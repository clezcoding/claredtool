import { type AddressInfo } from "node:net";
import { listenWorkerHealth } from "./worker-health";

describe("listenWorkerHealth", () => {
  it("GET /health returns 200 with status ok", async () => {
    const server = listenWorkerHealth(0, "127.0.0.1");
    await new Promise<void>((resolve) => {
      server.once("listening", () => resolve());
    });
    const { port } = server.address() as AddressInfo;
    const res = await fetch(`http://127.0.0.1:${port}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });
});
