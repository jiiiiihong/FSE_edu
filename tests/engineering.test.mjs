import { test } from "node:test";
import assert from "node:assert/strict";
import {
  geometry,
  ratio,
  involute,
  contact,
  gradeNumber,
  sampleRange,
} from "../engineering.mjs";
const near = (a, b, e = 1e-7) => assert.ok(Math.abs(a - b) <= e, `${a} ≠ ${b}`);
test("reference geometry: independently tabulated spur and helical examples", () => {
  const spur = geometry(2, 40, 0, 20);
  near(spur.d, 80);
  near(spur.db, 75.1754096629);
  near(spur.pbt, 5.9042628682);
  const helical = geometry(2, 30, 30, 20);
  near(helical.mt, 2.3094010768);
  near(helical.d, 69.2820323028);
  near(helical.at, 22.7958772589);
  const negative = geometry(2, 30, -30, 20);
  near(helical.d, negative.d);
  near(helical.at, negative.at);
});
test("geometry rejects nonphysical, fractional, nonfinite and singular input", () => {
  for (const row of [
    [0, 30, 0, 20],
    [2, 2, 0, 20],
    [2, 30.5, 0, 20],
    [2, 30, 85, 20],
    [2, 30, -85, 20],
    [2, 30, 0, 0],
    [2, 30, 0, 45],
    [Infinity, 30, 0, 20],
    [2, NaN, 0, 20],
    [Number.MAX_VALUE, 30, 30, 20],
  ])
    assert.throws(() => geometry(...row), RangeError);
});
test("ratio obeys steady-state power balance with efficiency", () => {
  const r = ratio(20, 60, 900, 10, 0.95);
  near(r.i, 3);
  near(r.n2, 300);
  near(r.t2, 28.5);
  near(r.p2, 895.3539062731);
  near((2 * Math.PI * r.n2 * r.t2) / 60, r.p2);
  for (const e of [0, -1, 1.01, Infinity])
    assert.throws(() => ratio(20, 60, 900, 10, e));
  assert.throws(() => ratio(20.5, 60, 900, 10, 1));
});
test("involute radius and tangent-string construction agree", () => {
  for (const t of [0, 0.1, 0.5, 1, 1.5]) {
    const p = involute(10, t);
    near(Math.hypot(p.x, p.y), p.r);
    const tx = 10 * Math.cos(t),
      ty = 10 * Math.sin(t);
    near(Math.hypot(p.x - tx, p.y - ty), 10 * t);
    near((p.x - tx) * tx + (p.y - ty) * ty, 0);
  }
  const p = involute(10, 0.5);
  near(p.x, 11.1729533119);
  near(p.y, 0.4063425766);
  assert.throws(() => involute(0, 1));
  assert.throws(() => involute(10, -1));
});
test("external spur contact worked example", () => {
  const c = contact(2, 20, 40, 20);
  near(c.a, 60);
  near(c.path, 9.6545677673);
  near(c.epsilon, 1.6351859636);
});
test("numeric grading accepts tolerance boundaries but rejects blank/NaN", () => {
  const q = { answer: 80, tolerance: 0.01 };
  for (const v of ["80", "79.99", "80.01"])
    assert.equal(gradeNumber(v, q), true);
  for (const v of ["", " ", "NaN", "Infinity", "80.0101", "79.98"])
    assert.equal(gradeNumber(v, q), false);
});
test("sample range does not imply gear specification compliance", () => {
  near(sampleRange([-4, -2, 0, 2, 4]), 8);
  near(sampleRange([24, -16]), 40);
  for (const v of [[], [1], [1, NaN]]) assert.throws(() => sampleRange(v));
});
test("diagnosis grades evidence and order without asserting a single root cause", async () => {
  const { gradeDiagnosis } = await import("../engineering.mjs");
  const q = { requiredChecks: [0, 1], order: [0, 1, 2, 3] };
  assert.equal(gradeDiagnosis([0, 1], [0, 1, 2, 3], q).pass, true);
  assert.equal(gradeDiagnosis([0, 1, 2], [0, 1, 2, 3], q).pass, false);
  assert.equal(gradeDiagnosis([0], [0, 1, 2, 3], q).pass, false);
  assert.equal(gradeDiagnosis([0, 1], [1, 0, 2, 3], q).pass, false);
  assert.equal(gradeDiagnosis([0, 1], [-1, 0, 2, 3], q).pass, false);
});
