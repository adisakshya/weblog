// One command: serve dist/client like GitHub Pages, capture the full visual matrix, compare with the approved reference.
//   bun run build && node scripts/visual-check.mjs [outDir]
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const port = 4400 + Math.floor(Math.random() * 400);
const out = process.argv[2] ?? mkdtempSync(join(tmpdir(), "weblog-visual-"));
const server = spawn(process.execPath, ["scripts/serve-dist.mjs"], {
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "inherit"],
});
await new Promise((res, rej) => {
  server.stdout.on("data", (d) => String(d).includes("serving") && res());
  server.on("exit", (c) => rej(new Error(`server exited ${c}`)));
});
let status = 1;
try {
  const cap = spawnSync(
    process.execPath,
    ["scripts/capture-visual.cjs", `http://127.0.0.1:${port}`, join(out, "new")],
    { stdio: "inherit" },
  );
  if (cap.status !== 0) throw new Error("capture failed");
  status =
    spawnSync(
      process.execPath,
      ["scripts/compare-visual.cjs", join(out, "new"), "--out", join(out, "diff")],
      { stdio: "inherit" },
    ).status ?? 1;
  if (status) console.error(`diff images: ${join(out, "diff")}`);
} finally {
  server.kill();
}
process.exit(status);
