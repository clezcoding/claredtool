import { ExecutionContext, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

/**
 * Wave 0 contract spec for PermissionsGuard (implementation lands in 03-02).
 * Inline mirror of the intended decorator + guard so this file compiles before
 * permissions.decorator.ts / permissions.guard.ts exist.
 */
export const PERMISSION_KEY = "permission";
export const RequirePermission = (permission: string) =>
  SetMetadata(PERMISSION_KEY, permission);

type SessionUser = {
  permissions: string[];
};

class PermissionsGuardContract {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string | undefined>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (required === undefined) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{ user?: SessionUser }>();
    const permissions = request.user?.permissions ?? [];
    return permissions.includes(required);
  }
}

function mockContext(user?: SessionUser): ExecutionContext {
  const request = { user };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe.skip("phase03-product", () => {
  describe("PermissionsGuard (contract)", () => {
    const reflector = new Reflector();
    const guard = new PermissionsGuardContract(reflector);

    it("returns true when no RequirePermission metadata is present", () => {
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined);
      expect(guard.canActivate(mockContext({ permissions: [] }))).toBe(true);
    });

    it("returns false when request.user.permissions lacks the required catalog string", () => {
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue("entity.create");
      expect(
        guard.canActivate(
          mockContext({ permissions: ["entity.read", "invoice.read"] }),
        ),
      ).toBe(false);
    });

    it("returns true when request.user.permissions includes the required string", () => {
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue("entity.create");
      expect(
        guard.canActivate(
          mockContext({ permissions: ["entity.create", "invoice.write"] }),
        ),
      ).toBe(true);
    });

    it("RequirePermission sets metadata key used by the guard", () => {
      @RequirePermission("tax.evaluate")
      class TaxHandler {}

      const permission = Reflect.getMetadata(PERMISSION_KEY, TaxHandler);
      expect(permission).toBe("tax.evaluate");
    });
  });
});
