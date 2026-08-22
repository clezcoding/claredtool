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
import { authorizationCodeGrant, buildAuthorizationUrl } from "./oidc";
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
    const state = randomBytes(16).toString("base64url");
    const codeVerifier = randomBytes(32).toString("base64url");
    await this.redis.set(
      `oauth:${state}`,
      JSON.stringify({ code_verifier: codeVerifier }),
      "EX",
      OAUTH_TTL_SECONDS,
    );
    const backend = process.env.BACKEND_URL ?? "http://localhost:3000";
    const redirectUri = `${backend}/auth/callback`;
    const codeChallenge = randomBytes(32).toString("base64url");
    const url = await buildAuthorizationUrl({
      redirectUri,
      state,
      codeChallenge,
    });
    res.redirect(url.toString());
  }

  @Public()
  @Get("callback")
  async callback(
    @Query("code") code: string | undefined,
    @Query("state") state: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    if (!state) {
      throw new UnauthorizedException();
    }
    const raw = await this.redis.getdel(`oauth:${state}`);
    if (!raw) {
      throw new UnauthorizedException();
    }
    const { code_verifier } = JSON.parse(raw) as { code_verifier: string };
    const backend = process.env.BACKEND_URL ?? "http://localhost:3000";
    const currentUrl = new URL("/auth/callback", backend);
    if (code) {
      currentUrl.searchParams.set("code", code);
    }
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
    const claims = JSON.parse(raw) as {
      sub: string;
      email: string;
      name: string;
      groups: string[];
    };
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
    const authentik = process.env.AUTHENTIK_URL ?? "http://localhost:9000";
    return {
      endSessionUrl: `${authentik.replace(/\/$/, "")}/application/o/clared/end-session/`,
    };
  }
}
