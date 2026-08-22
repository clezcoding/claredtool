import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { randomBytes } from "node:crypto";
import { IsOptional, IsString } from "class-validator";
import type { Response } from "express";
import { Public } from "./public.decorator";
import {
  authorizationCodeGrant,
  beginAuthorization,
  endSessionUrl,
} from "./oidc";
import { projectRbac } from "./rbac";
import { AuthedRequest } from "./auth.guard";
import {
  OAUTH_TTL_SECONDS,
  SESSION_TTL_SECONDS,
  TICKET_TTL_SECONDS,
} from "./ttl";
import { RedisService } from "../redis/redis.service";

class SessionDto {
  @IsString()
  ticket!: string;

  @IsOptional()
  @IsString()
  hostname?: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly redis: RedisService) {}

  @Public()
  @Get("login")
  async login(@Res() res: Response): Promise<void> {
    const backend = process.env.BACKEND_URL ?? "http://localhost:3000";
    const redirectUri = `${backend}/auth/callback`;
    const { url, state, codeVerifier } = await beginAuthorization(redirectUri);
    await this.redis.set(
      `oauth:${state}`,
      JSON.stringify({ code_verifier: codeVerifier }),
      "EX",
      OAUTH_TTL_SECONDS,
    );
    res.redirect(url.toString());
  }

  @Public()
  @Get("callback")
  async callback(
    @Query("code") code: string | undefined,
    @Query("state") state: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    if (!state || !code) {
      throw new UnauthorizedException();
    }
    const raw = await this.redis.getdel(`oauth:${state}`);
    if (!raw) {
      throw new UnauthorizedException();
    }
    const { code_verifier } = parseOauthPayload(raw);
    const backend = process.env.BACKEND_URL ?? "http://localhost:3000";
    const currentUrl = new URL("/auth/callback", backend);
    currentUrl.searchParams.set("code", code);
    currentUrl.searchParams.set("state", state);
    const claims = await authorizationCodeGrant(
      currentUrl,
      state,
      code_verifier,
    );
    const ticket = randomBytes(32).toString("base64url");
    await this.redis.set(
      `ticket:${ticket}`,
      JSON.stringify(claims),
      "EX",
      TICKET_TTL_SECONDS,
      "NX",
    );
    res.redirect(`clared://auth?ticket=${ticket}`);
  }

  @Public()
  @Post("session")
  @HttpCode(HttpStatus.OK)
  async session(@Body() body: SessionDto): Promise<{ token: string }> {
    const raw = await this.redis.getdel(`ticket:${body.ticket}`);
    if (!raw) {
      throw new UnauthorizedException();
    }
    const claims = parseTicketClaims(raw);
    if (!claims.sub) {
      throw new UnauthorizedException();
    }
    const rbac = projectRbac(claims.groups ?? []);
    const token = randomBytes(32).toString("base64url");
    const session = {
      sub: claims.sub,
      email: claims.email,
      name: claims.name,
      groups: claims.groups ?? [],
      permissions: rbac.permissions,
      primaryRole: rbac.primaryRole,
      iat: Math.floor(Date.now() / 1000),
      hostname: body.hostname ?? "",
    };
    await this.redis.set(
      `session:${token}`,
      JSON.stringify(session),
      "EX",
      SESSION_TTL_SECONDS,
    );
    return { token };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: AuthedRequest,
  ): Promise<{ endSessionUrl: string }> {
    if (request.sessionToken) {
      await this.redis.del(`session:${request.sessionToken}`);
    }
    return { endSessionUrl: endSessionUrl() };
  }
}

function parseOauthPayload(raw: string): { code_verifier: string } {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      "code_verifier" in parsed &&
      typeof (parsed as { code_verifier: unknown }).code_verifier === "string" &&
      (parsed as { code_verifier: string }).code_verifier.length > 0
    ) {
      return parsed as { code_verifier: string };
    }
  } catch {
    /* fall through */
  }
  throw new UnauthorizedException();
}

function parseTicketClaims(raw: string): {
  sub: string;
  email: string;
  name: string;
  groups: string[];
} {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      "sub" in parsed &&
      typeof (parsed as { sub: unknown }).sub === "string" &&
      (parsed as { sub: string }).sub.length > 0
    ) {
      const record = parsed as {
        sub: string;
        email?: unknown;
        name?: unknown;
        groups?: unknown;
      };
      return {
        sub: record.sub,
        email: typeof record.email === "string" ? record.email : "",
        name: typeof record.name === "string" ? record.name : "",
        groups: Array.isArray(record.groups)
          ? record.groups.filter((g): g is string => typeof g === "string")
          : [],
      };
    }
  } catch {
    /* fall through */
  }
  throw new UnauthorizedException();
}
