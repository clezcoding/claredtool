import { createServer, type Server } from "node:http";

export function listenWorkerHealth(port: number, host = "0.0.0.0"): Server {
  const server = createServer((req, res) => {
    const path = (req.url ?? "/").split("?")[0];
    if (req.method === "GET" && (path === "/health" || path === "/health/")) {
      res.writeHead(200, { "content-type": "application/json" });
      res.end('{"status":"ok"}');
      return;
    }
    res.writeHead(404);
    res.end();
  });
  server.listen(port, host);
  return server;
}
