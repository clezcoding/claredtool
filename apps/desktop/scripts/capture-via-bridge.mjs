#!/usr/bin/env node
/**
 * Talk to the running tauri-plugin-mcp-bridge (ws://127.0.0.1:9223).
 * Same capture path as Tauri MCP webview_screenshot (WKWebView takeSnapshot, no OS titlebar).
 * Used when the @hypothesi/tauri-mcp-server npx cache cannot load driver modules.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const BRIDGE = process.env.MCP_BRIDGE_URL ?? "ws://127.0.0.1:9223";
const OUT_DIR = resolve(process.argv[2] ?? "artifacts/captures");

const SHOTS = [
  { file: "02-rechnung-light.png", hash: "#/", theme: "light" },
  { file: "03-rechnung-dark.png", hash: "#/", theme: "dark" },
  { file: "04-entities-light.png", hash: "#/entities", theme: "light" },
  { file: "05-entities-dark.png", hash: "#/entities", theme: "dark" },
  { file: "06-tax-engine.png", hash: "#/tax", theme: "light" },
  { file: "07-pdf-viewer.png", hash: "#/pdf", theme: "dark" },
];

function prepScript(theme, hash) {
  const dark = theme === "dark";
  return `
    var dark = ${dark ? "true" : "false"};
    document.documentElement.style.setProperty("--dur", "0");
    if (!document.querySelector("style[data-pixel-capture]")) {
      var s = document.createElement("style");
      s.setAttribute("data-pixel-capture", "1");
      s.textContent = "*,*::before,*::after{animation:none!important;transition:none!important}";
      document.head.appendChild(s);
    }
    document.documentElement.classList.toggle("dark", dark);
    var bg = dark ? "#0F0F0F" : "#F7F7F5";
    var scheme = dark ? "dark" : "light";
    document.documentElement.style.background = bg;
    document.documentElement.style.colorScheme = scheme;
    document.body.style.background = bg;
    document.body.style.colorScheme = scheme;
    try { localStorage.setItem("clared-theme", dark ? "dark" : "light"); } catch (e) {}
    if (location.hash !== "${hash}") location.hash = "${hash}";
    var name = "Alexander Wagner";
    var email = "aw@clared.de";
    var company = "Greenfield Studio GmbH";
    var nav = document.querySelector("nav");
    if (nav) {
      var spans = nav.querySelectorAll("span");
      for (var i = 0; i < spans.length; i++) {
        var t = (spans[i].textContent || "").trim();
        if (/@/.test(t) && t !== email) spans[i].textContent = email;
      }
      var sm = nav.querySelectorAll("span.block.truncate.text-sm");
      for (var j = 0; j < sm.length; j++) {
        if (sm[j].textContent && sm[j].textContent.trim() && sm[j].textContent.trim() !== name) {
          sm[j].textContent = name;
        }
      }
      var co = nav.querySelectorAll("span.block.truncate.text-\\\\[12px\\\\]");
      for (var k = 0; k < co.length; k++) {
        var ct = (co[k].textContent || "").trim();
        if (ct && ct !== email && ct !== company && !/@/.test(ct)) co[k].textContent = company;
      }
    }
    return {
      dpr: window.devicePixelRatio,
      inner: { w: window.innerWidth, h: window.innerHeight },
      hash: location.hash,
      hasNav: !!document.querySelector("nav"),
      h1: document.querySelector("h1") ? document.querySelector("h1").textContent : null,
      anmelden: !!(document.body.innerText || "").match(/Anmelden/)
    };
  `;
}

function send(ws, payload) {
  return new Promise((resolvePromise, reject) => {
    const id = payload.id;
    const onMsg = (event) => {
      let parsed;
      try {
        parsed = JSON.parse(String(event.data));
      } catch {
        return;
      }
      if (parsed.id !== id) return;
      ws.removeEventListener("message", onMsg);
      if (parsed.success === false) {
        reject(new Error(parsed.error || "bridge error"));
        return;
      }
      resolvePromise(parsed);
    };
    ws.addEventListener("message", onMsg);
    ws.send(JSON.stringify(payload));
    setTimeout(() => {
      ws.removeEventListener("message", onMsg);
      reject(new Error(`timeout waiting for ${id}`));
    }, 30000);
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function writePngFromDataUrl(dataUrl, dest) {
  const match = /^data:image\/png;base64,(.+)$/s.exec(dataUrl);
  if (!match) {
    throw new Error(`expected png data URL, got ${String(dataUrl).slice(0, 80)}`);
  }
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, Buffer.from(match[1], "base64"));
}

const ws = new WebSocket(BRIDGE);
await new Promise((resolvePromise, reject) => {
  ws.addEventListener("open", resolvePromise);
  ws.addEventListener("error", () => reject(new Error(`cannot open ${BRIDGE}`)));
});

const info = await send(ws, { id: "info", command: "get_window_info", args: { windowId: "main" } });
process.stdout.write(`window ${JSON.stringify(info.data)}\n`);

await send(ws, {
  id: "resize",
  command: "resize_window",
  args: { width: 1536, height: 1024, logical: true, windowId: "main" },
});
await sleep(400);

for (const shot of SHOTS) {
  const prep = await send(ws, {
    id: `prep-${shot.file}`,
    command: "execute_js",
    args: { script: prepScript(shot.theme, shot.hash), windowLabel: "main" },
  });
  process.stdout.write(`${shot.file} prep ${JSON.stringify(prep.data)}\n`);
  await sleep(700);
  const cap = await send(ws, {
    id: `shot-${shot.file}`,
    command: "capture_native_screenshot",
    args: { format: "png", windowLabel: "main" },
  });
  const dest = join(OUT_DIR, shot.file);
  writePngFromDataUrl(cap.data, dest);
  process.stdout.write(`wrote ${dest}\n`);
}

ws.close();
