import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { gradeNumber } from "../engineering.mjs";
const data = JSON.parse(
  readFileSync(new URL("../content/curriculum.json", import.meta.url)),
);
test("curriculum has all 7 parts, 14 chapters and complete lesson contracts", () => {
  assert.equal(data.parts.length, 7);
  assert.equal(data.parts.flatMap((p) => p.chapters).length, 14);
  assert.equal(data.lessons.length, 35);
  const ids = new Set(data.lessons.map((l) => l.id));
  assert.equal(ids.size, 35);
  for (const l of data.lessons) {
    for (const f of [
      "objectives",
      "context",
      "theory",
      "formula",
      "diagram",
      "example",
      "application",
      "limitations",
      "mistakes",
      "exercise",
      "assessment",
      "sources",
      "review",
    ])
      assert.ok(l[f], `${l.id}: ${f}`);
    assert.ok(data.parts[l.part - 1].chapters.some((c) => c.id === l.chapter));
    for (const id of l.prerequisites) {
      assert.ok(ids.has(id));
      assert.ok(
        data.lessons.findIndex((x) => x.id === id) < data.lessons.indexOf(l),
      );
    }
    for (const id of l.sources) assert.ok(data.sources[id]);
    assert.equal(l.review.publicationReady, false);
    assert.equal(l.assessment.choices.length, l.assessment.reasons.length);
    assert.ok(
      l.assessment.answer >= 0 &&
        l.assessment.answer < l.assessment.choices.length,
    );
    if (l.calculation) {
      assert.ok(
        l.calculation.unit &&
          l.calculation.tolerance > 0 &&
          l.calculation.rounding,
      );
      assert.equal(
        gradeNumber(String(l.calculation.answer), l.calculation),
        true,
      );
    }
  }
});
test("legacy dataset and app are retained verbatim from v1.6 baseline", () => {
  const html = readFileSync(new URL("../legacy.html", import.meta.url), "utf8"),
    legacy = JSON.parse(html.match(/const DATA=(.*?);\nconst \$=/s)[1]);
  assert.equal(legacy.units.length, 7);
  assert.equal(legacy.glossary.flat().length, 58);
  assert.equal(legacy.quizzes.length, 36);
  assert.equal(legacy.cases.length, 8);
  const js = readFileSync(
    new URL("../legacy-data.js", import.meta.url),
    "utf8",
  );
  assert.ok(js.includes(JSON.stringify(legacy)));
});
