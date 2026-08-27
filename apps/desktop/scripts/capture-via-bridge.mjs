#!/usr/bin/env node
/**
 * Talk to the running tauri-plugin-mcp-bridge (ws://127.0.0.1:9223).
 * Same capture path as Tauri MCP webview_screenshot (WKWebView takeSnapshot, no OS titlebar).
 * Used when the @hypothesi/tauri-mcp-server npx cache cannot load driver modules.
 */
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const { PNG } = createRequire(import.meta.url)("pngjs");
const CSS_W = 1536;
const CSS_H = 1024;

const BRIDGE = process.env.MCP_BRIDGE_URL ?? "ws://127.0.0.1:9223";
const OUT_DIR = resolve(process.argv[2] ?? "artifacts/captures");

const SHOTS = [
  { file: "02-rechnung-light.png", hash: "#/", theme: "light", h1: "Rechnung" },
  { file: "03-rechnung-dark.png", hash: "#/", theme: "dark", h1: "Rechnung" },
  { file: "04-entities-light.png", hash: "#/entities", theme: "light", h1: "Geschäftseinheiten" },
  { file: "05-entities-dark.png", hash: "#/entities", theme: "dark", h1: "Geschäftseinheiten" },
  { file: "06-tax-engine.png", hash: "#/tax", theme: "light", h1: "Steuerregeln" },
  { file: "07-pdf-viewer.png", hash: "#/pdf", theme: "dark", h1: "PDF-Vorschau" },
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
  writeFileSync(dest, toCssPixelPng(Buffer.from(match[1], "base64")));
}

/** Retina WKWebView snapshot is 2× CSS. Approved goldens are 1536×1024. Even-pixel pick is CSS grid, not bilinear fake-scale. */
function toCssPixelPng(buf) {
  const img = PNG.sync.read(buf);
  if (img.width === CSS_W && img.height === CSS_H) {
    return buf;
  }
  if (img.width === CSS_W * 2 && img.height === CSS_H * 2) {
    const out = new PNG({ width: CSS_W, height: CSS_H });
    for (let y = 0; y < CSS_H; y++) {
      for (let x = 0; x < CSS_W; x++) {
        const si = ((y * 2) * img.width + x * 2) << 2;
        const di = (y * CSS_W + x) << 2;
        out.data[di] = img.data[si];
        out.data[di + 1] = img.data[si + 1];
        out.data[di + 2] = img.data[si + 2];
        out.data[di + 3] = img.data[si + 3];
      }
    }
    return PNG.sync.write(out);
  }
  throw new Error(`capture ${img.width}x${img.height} is not ${CSS_W}x${CSS_H} or 2× that`);
}

async function execJs(ws, id, script) {
  return send(ws, { id, command: "execute_js", args: { script, windowLabel: "main" } });
}

async function pinInner(ws) {
  for (let i = 0; i < 12; i++) {
    const metrics = await execJs(
      ws,
      `inner-${i}`,
      `return { w: window.innerWidth, h: window.innerHeight, dpr: window.devicePixelRatio };`,
    );
    const { w, h, dpr } = metrics.data;
    process.stdout.write(`inner ${JSON.stringify(metrics.data)}\n`);
    if (w === CSS_W && h === CSS_H) {
      return metrics.data;
    }
    const info = await send(ws, {
      id: `info-${i}`,
      command: "get_window_info",
      args: { windowId: "main" },
    });
    const outerLogW = info.data.width / dpr;
    const outerLogH = info.data.height / dpr;
    const chromeW = outerLogW - w;
    const chromeH = outerLogH - h;
    await send(ws, {
      id: `resize-${i}`,
      command: "resize_window",
      args: {
        width: Math.round(CSS_W + chromeW),
        height: Math.round(CSS_H + chromeH),
        logical: true,
        windowId: "main",
      },
    });
    await sleep(250);
  }
  throw new Error("could not pin inner 1536x1024");
}

async function waitRoute(ws, shot) {
  for (let i = 0; i < 25; i++) {
    const prep = await execJs(ws, `prep-${shot.file}-${i}`, prepScript(shot.theme, shot.hash));
    const d = prep.data;
    const h1ok = typeof d.h1 === "string" && d.h1.includes(shot.h1);
    if (d.hash === shot.hash && d.hasNav && h1ok && !d.anmelden) {
      process.stdout.write(`${shot.file} ready ${JSON.stringify(d)}\n`);
      return d;
    }
    await sleep(200);
  }
  throw new Error(`${shot.file} route not ready`);
}

const ws = new WebSocket(BRIDGE);
await new Promise((resolvePromise, reject) => {
  ws.addEventListener("open", resolvePromise);
  ws.addEventListener("error", () => reject(new Error(`cannot open ${BRIDGE}`)));
});

const info = await send(ws, { id: "info", command: "get_window_info", args: { windowId: "main" } });
process.stdout.write(`window ${JSON.stringify(info.data)}\n`);
const inner = await pinInner(ws);
process.stdout.write(`pinned ${JSON.stringify(inner)}\n`);

for (const shot of SHOTS) {
  await waitRoute(ws, shot);
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
