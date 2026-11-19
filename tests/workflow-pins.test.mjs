// Supply-chain guard (AGENTS.md: workflow dependencies must be pinned): every action referenced by a workflow must be
// pinned to a full 40-character commit SHA, never a mutable tag or branch, and a workflow must not use `pull_request_target`.
//   node --test tests/workflow-pins.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const dir = ".github/workflows";
const files = readdirSync(dir).filter((f) => /\.ya?ml$/.test(f));

test("there are workflows to check", () => assert.ok(files.length >= 2));

for (const f of files) {
  const text = readFileSync(`${dir}/${f}`, "utf8");
  test(`${f}: every action is pinned to a full commit SHA`, () => {
    const uses = [...text.matchAll(/^\s*(?:-\s*)?uses:\s*(\S+)/gm)].map((m) => m[1]);
    assert.ok(uses.length > 0, "no `uses:` found");
    for (const u of uses) {
      if (u.startsWith("./")) continue; // local action
      assert.match(
        u,
        /^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/,
        `${f}: "${u}" is not pinned to a commit SHA`,
      );
    }
  });
  test(`${f}: no pull_request_target trigger`, () => {
    assert.doesNotMatch(text, /pull_request_target/);
  });
}

test("the guard itself rejects a tag-pinned action", () => {
  const re = /^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/;
  assert.ok(!re.test("actions/checkout@v4"));
  assert.ok(!re.test("actions/checkout@main"));
  assert.ok(re.test("actions/checkout@11d5960a326750d5838078e36cf38b85af677262"));
});
