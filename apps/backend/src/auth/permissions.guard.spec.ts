import { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  PERMISSION_KEY,
  RequirePermission,
} from "./permissions.decorator";
import { PermissionsGuard } from "./permissions.guard";

function mockContext(user?: { permissions: string[] }): ExecutionContext {
  const request = { user };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe("PermissionsGuard", () => {
  const reflector = new Reflector();
  const guard = new PermissionsGuard(reflector);

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
