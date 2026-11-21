// Codespaces/devcontainer contract (#50): the dev container must use the same toolchain as CI and must let the Vite dev
// server answer on Codespaces' forwarded hostnames. Pure file checks (no Docker needed):
//   node --test tests/devcontainer.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// devcontainer.json is JSONC (comments allowed)
const raw = readFileSync(".devcontainer/devcontainer.json", "utf8");
const config = JSON.parse(raw.replace(/^\s*\/\/.*$/gm, ""));
const workflow = (f) => readFileSync(`.github/workflows/${f}`, "utf8");
const bunPins = (text) => [...text.matchAll(/npm install --global bun@([\d.]+)/g)].map((m) => m[1]);

test("the container image is Node 22, the version CI and deploy use", () => {
  assert.match(config.image, /javascript-node:[^ ]*22/);
  for (const f of ["ci.yml", "deploy.yml"]) assert.match(workflow(f), /node-version: 22/);
});

test("Bun is pinned to exactly the version CI and deploy install", () => {
  const ci = new Set([...bunPins(workflow("ci.yml")), ...bunPins(workflow("deploy.yml"))]);
  assert.equal(ci.size, 1, `CI and deploy disagree on the Bun version: ${[...ci]}`);
  assert.deepEqual(bunPins(config.onCreateCommand), [...ci]);
});

test("setup installs from the lockfile and python3 is available for the content checks", () => {
  assert.match(config.postCreateCommand, /bun install --frozen-lockfile/);
  assert.ok(Object.keys(config.features).some((k) => k.includes("features/python")));
});

test("the forwarded ports are the real dev (Vite default) and preview ports", () => {
  assert.deepEqual(config.forwardPorts, [5173, 4300]);
  assert.match(readFileSync("scripts/serve-dist.mjs", "utf8"), /PORT \?\? 4300/);
  assert.match(readFileSync("package.json", "utf8"), /"dev": "vite dev"/);
  assert.doesNotMatch(
    readFileSync("vite.config.ts", "utf8"),
    /port:/,
    "a custom dev port would break forwardPorts",
  );
});

test("Vite allows the Codespaces hostnames, and nothing broader", () => {
  const vite = readFileSync("vite.config.ts", "utf8");
  assert.match(vite, /allowedHosts:\s*\[\s*"\.app\.github\.dev"\s*\]/);
  assert.doesNotMatch(vite, /allowedHosts:\s*true/);
});
