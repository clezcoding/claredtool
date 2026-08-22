import { afterEach, describe, expect, it } from "vitest";
import { signedInOwner } from "./auth-signed-in";
import { fetchMock, resetAuthMocks } from "./auth-test-doubles";
import {
  apiFetch,
  fetchMe,
  getLastRequest,
  replayLastRequest,
} from "../auth/api";

afterEach(() => {
  resetAuthMocks();
});

describe("WR-11 lastRequest replay", () => {
  it("fetchMe does not overwrite lastRequest so D-31 can replay the 401'd call", async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("/invoices")) {
        return new Response("ok", { status: 200 });
      }
      if (url.includes("/me")) {
        return new Response(JSON.stringify(signedInOwner), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("nope", { status: 404 });
    });

    await apiFetch("/invoices");
    expect(getLastRequest()?.path).toBe("/invoices");

    await fetchMe("dead-token");
    expect(getLastRequest()?.path).toBe("/invoices");

    const replayed = await replayLastRequest("fresh-token");
    expect(replayed?.status).toBe(200);

    const invoiceCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes("/invoices"),
    );
    expect(invoiceCalls).toHaveLength(2);
    const replayInit = invoiceCalls[1]?.[1] as RequestInit | undefined;
    const headers = new Headers(replayInit?.headers);
    expect(headers.get("Authorization")).toBe("Bearer fresh-token");
  });
});
