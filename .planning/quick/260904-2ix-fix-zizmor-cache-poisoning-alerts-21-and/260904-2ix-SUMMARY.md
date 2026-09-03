---
status: complete
phase: quick-260904-2ix
plan: 01
subsystem: ci
tags: [github-actions, zizmor, cache-poisoning, node24]

requires:
  - phase: main
    provides: desktop-build FaynoSync publish, Node 24 setup-node
provides:
  - desktop-build tauri job without Actions cache (no setup-node cache, no rust-cache)
affects: [desktop-build, github-security-tab]

key-files:
  modified:
    - .github/workflows/desktop-build.yml

key-decisions:
  - "Release/publish workflow must not restore Actions cache (zizmor cache-poisoning). ci.yml desktop-test still caches."
  - "Node 24 unchanged"

self-check: |
  grep node-version desktop-build.yml is 24
  no cache: pnpm and no rust-cache in desktop-build.yml
  ci.yml still has cache: pnpm and rust-cache
---

# 260904-2ix SUMMARY

Removed Actions caches from `desktop-build.yml` so zizmor errors #21 and #22 close. `setup-node` stays on Node 24. `ci.yml` test job still caches.
