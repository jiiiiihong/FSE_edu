import { test } from "node:test";
import assert from "node:assert/strict";
import {
  KEY,
  LEGACY_KEYS,
  emptyState,
  loadState,
  saveState,
  validateState,
  exportBackup,
  mergeBackup,
} from "../storage.mjs";
const ids = ["p1-l1", "p1-l2"];
function memory() {
  const m = new Map();
  return {
    m,
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => m.set(k, v),
  };
}
test("new version never overwrites legacy raw data", () => {
  const s = memory();
  for (const k of LEGACY_KEYS) s.setItem(k, "raw " + k);
  const before = LEGACY_KEYS.map((k) => s.getItem(k));
  const state = loadState(s, ids).state;
  state.completed["p1-l1"] = true;
  assert.equal(saveState(s, state), true);
  assert.deepEqual(
    LEGACY_KEYS.map((k) => s.getItem(k)),
    before,
  );
  const backup = exportBackup(s, state);
  assert.equal(backup.legacy.fse3_memo, "raw fse3_memo");
});
test("corrupt and future versions remain untouched and are flagged", () => {
  for (const raw of [
    "{broken",
    JSON.stringify({ ...emptyState(), version: 3 }),
    JSON.stringify({ ...emptyState(), completed: [] }),
    JSON.stringify({
      ...emptyState(),
      assessments: { "p1-l1": { choice: "yes" } },
    }),
  ]) {
    const s = memory();
    s.setItem(KEY, raw);
    const loaded = loadState(s, ids);
    assert.ok(loaded.error);
    assert.equal(s.getItem(KEY), raw);
    assert.deepEqual(loaded.state, emptyState());
  }
});
test("denied storage returns error without losing memory state", () => {
  const s = {
    getItem() {
      throw Error("denied");
    },
    setItem() {
      throw Error("quota");
    },
  };
  assert.ok(loadState(s, ids).error);
  assert.equal(saveState(s, emptyState()), false);
});
test("validated backup merges completion and missing data, preserves current evaluation", () => {
  const s = memory(),
    current = emptyState(),
    incoming = emptyState();
  current.completed["p1-l1"] = true;
  current.assessments["p1-l1"] = { choice: false };
  incoming.completed["p1-l1"] = false;
  incoming.completed["p1-l2"] = true;
  incoming.assessments["p1-l1"] = { choice: true, number: true };
  incoming.reflections["p1-l2"] = "검증 근거";
  const merged = mergeBackup(current, exportBackup(s, incoming), ids);
  assert.equal(merged.completed["p1-l1"], true);
  assert.equal(merged.completed["p1-l2"], true);
  assert.equal(merged.assessments["p1-l1"].choice, false);
  assert.equal(merged.assessments["p1-l1"].number, true);
  assert.equal(merged.reflections["p1-l2"], "검증 근거");
  assert.equal(current.completed["p1-l2"], undefined);
});
test("reject unknown identifiers, oversize notes and unexpected fields", () => {
  assert.throws(() =>
    validateState({ ...emptyState(), completed: { bad: true } }, ids),
  );
  assert.throws(() =>
    validateState(
      { ...emptyState(), reflections: { "p1-l1": "x".repeat(10001) } },
      ids,
    ),
  );
  assert.throws(() => mergeBackup(emptyState(), { version: 1 }, ids));
});
