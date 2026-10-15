import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
const data = JSON.parse(
  readFileSync(new URL("../content/curriculum.json", import.meta.url)),
);
async function open(page, route = "home") {
  await page.goto("/#" + route);
  await expect(page.locator("#app")).not.toContainText(
    "교육과정을 불러오고 있습니다.",
  );
}
const errorsFor = (page) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
};
async function noOverflow(page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
}
test("dashboard and all 14 chapters expose the structured learning path", async ({
  page,
}) => {
  const errors = errorsFor(page);
  await open(page);
  await expect(page.locator(".part-row")).toHaveCount(7);
  for (const p of data.parts) {
    await page.goto("/#part/" + p.id);
    await expect(page.locator(".chapter")).toHaveCount(2);
    await expect(page.locator(".lesson-row")).toHaveCount(5);
    await noOverflow(page);
  }
  expect(errors).toEqual([]);
});
test("all 35 lessons include 10 sections, formulas, examples, diagrams and review status", async ({
  page,
}) => {
  const errors = errorsFor(page);
  for (const l of data.lessons) {
    await open(page, "lesson/" + l.id);
    await expect(page.locator(".reader>section")).toHaveCount(11);
    await expect(page.locator("[role=math]")).toBeVisible();
    await expect(page.locator(".example li")).not.toHaveCount(0);
    await expect(page.locator(".engineering-diagram svg")).toBeVisible();
    await expect(page.locator("#section-references")).toContainText(
      "出판".replace("出", "출"),
    );
    await noOverflow(page);
  }
  expect(errors).toEqual([]);
});
test("completion, recent position, assessments and reflection persist independently", async ({
  page,
}) => {
  await open(page, "lesson/p1-l1");
  await page.locator("[data-complete]").check();
  await page.locator('[data-choice="1"]').click();
  await expect(page.locator("#choice-p1-l1")).toContainText("다시 확인");
  await page.locator('[data-choice="0"]').click();
  await expect(page.locator("#choice-p1-l1")).toContainText("정답");
  await page.locator("#number-p1-l1").fill("300");
  await page.locator("[data-number]").click();
  await expect(page.locator("#numeric-p1-l1")).toContainText("정답");
  await page
    .locator("#reflection-p1-l1")
    .fill("η=0.95는 교육용 가정이다. 실제 효율을 확인한다.");
  await page.locator("[data-reflection]").click();
  await page.reload();
  await expect(page.locator("[data-complete]")).toBeChecked();
  await expect(page.locator("#reflection-p1-l1")).toHaveValue(/실제 효율/);
  await page.locator("nav [data-tab=home]").click();
  await expect(page.locator(".stats")).toContainText("1");
  await page.getByRole("button", { name: "학습 이어하기 →" }).click();
  await expect(page).toHaveURL(/lesson\/p1-l1/);
});
test("all numerical exercises reject blanks and accept independently specified answers", async ({
  page,
}) => {
  // Independent expected-answer fixture, not answers read from the app at runtime.
  const answers = {
    "p1-l1": "300",
    "p1-l3": "64",
    "p1-l5": "1000",
    "p2-l1": "11.18034",
    "p2-l2": "5.90426",
    "p2-l3": "69.28203",
    "p2-l4": "1.6352",
    "p3-l1": "40",
    "p3-l2": "9",
    "p3-l3": "300",
    "p3-l5": "150.79645",
    "p4-l4": "0.024",
    "p5-l3": "40",
    "p5-l4": "0.2",
    "p6-l1": "0.035",
    "p6-l3": "0.004",
    "p7-l1": "600",
    "p7-l2": "0.0364",
    "p7-l4": "0.1",
    "p7-l5": "50",
  };
  for (const [id, answer] of Object.entries(answers)) {
    await open(page, "quiz/" + id);
    await page.locator("[data-number]").click();
    await expect(page.locator("#numeric-" + id)).toContainText("다시 확인");
    await page.locator("#number-" + id).fill(answer);
    await page.locator("[data-number]").click();
    await expect(page.locator("#numeric-" + id)).toContainText("✓ 정답");
  }
});
test("geometry calculator compares normal/transverse and rejects empty/fractional values", async ({
  page,
}) => {
  await open(page, "calc/geometry");
  await expect(page.locator("#toolResult")).toContainText("69.2820 mm");
  await expect(page.locator("#toolResult")).toContainText("22.7959°");
  for (const z of ["", "0", "2.5"]) {
    await page.locator("#z").fill(z);
    await page.getByRole("button", { name: "모델 계산" }).click();
    await expect(page.locator("#toolResult")).toContainText("입력값을 확인");
  }
  await page.locator("#z").fill("30");
  await page.locator("#beta").fill("0");
  await page.getByRole("button", { name: "모델 계산" }).click();
  await expect(page.locator("#toolResult")).toContainText("60.0000 mm");
});
test("ratio power balance, involute slider, and metrology input errors", async ({
  page,
}) => {
  await open(page, "calc/ratio");
  await expect(page.locator("#toolResult")).toContainText("28.5000 N·m");
  await page.locator("#eta").fill("1.1");
  await page.getByRole("button", { name: "모델 계산" }).click();
  await expect(page.locator("#toolResult")).toContainText("입력값을 확인");
  await open(page, "calc/involute");
  await page.locator("#unwind").fill("0.5");
  await expect(page.locator("#unwindValue")).toHaveText("0.50");
  await expect(page.locator("#toolResult")).toContainText("44.7214 mm");
  await open(page, "calc/metrology");
  await expect(page.locator("#toolResult")).toContainText("8.0000 μm");
  for (const s of ["1,", "NaN,2", "1"]) {
    await page.locator("#samples").fill(s);
    await page.getByRole("button", { name: "모델 계산" }).click();
    await expect(page.locator("#toolResult")).toContainText("입력값을 확인");
  }
});
test("legacy raw storage survives v2 study and full backup includes legacy values", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("fse3_done", '{"0-0":true}');
    localStorage.setItem("fse3_answers", '{"0":1}');
    localStorage.setItem("fse3_memo", '"기존 보존 메모"');
    localStorage.setItem("fse_dictionary_v1_3", '{"version":1,"entries":[]}');
    localStorage.setItem("fse_ai_dictionary_v1_4", "[]");
    localStorage.setItem("fse_ai_model_v1_5", "gpt-4.1");
  });
  const before = await page.evaluate(() =>
    Object.fromEntries(
      Object.keys(localStorage)
        .filter((k) => k !== "fse_academy_v2")
        .map((k) => [k, localStorage.getItem(k)]),
    ),
  );
  await open(page, "lesson/p2-l3");
  await page.locator("[data-complete]").check();
  await open(page, "notes");
  await expect(page.locator("#memo")).toHaveValue("기존 보존 메모");
  const after = await page.evaluate(() =>
    Object.fromEntries(
      Object.keys(localStorage)
        .filter((k) => k !== "fse_academy_v2")
        .map((k) => [k, localStorage.getItem(k)]),
    ),
  );
  expect(after).toEqual(before);
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.locator("#exportBackup").click(),
  ]);
  const backup = JSON.parse(readFileSync(await download.path(), "utf8"));
  expect(backup.legacy).toEqual(before);
  expect(backup.academy.completed["p2-l3"]).toBe(true);
});
test("backup restore validates before mutation and makes a recovery copy", async ({
  page,
}) => {
  await open(page, "notes");
  const before = await page.evaluate(() =>
    localStorage.getItem("fse_academy_v2"),
  );
  await page
    .locator("#restoreBackup")
    .setInputFiles({
      name: "bad.json",
      mimeType: "application/json",
      buffer: Buffer.from("{bad"),
    });
  await expect(page.locator("#restoreStatus")).toContainText("복구 실패");
  expect(
    await page.evaluate(() => localStorage.getItem("fse_academy_v2")),
  ).toBe(before);
  const backup = {
    format: "fse-academy-backup",
    version: 2,
    academy: {
      version: 2,
      completed: { "p1-l2": true },
      assessments: {},
      reflections: {},
      lastLesson: "p1-l2",
    },
  };
  await page
    .locator("#restoreBackup")
    .setInputFiles({
      name: "valid.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(backup)),
    });
  await expect(page.locator("#restoreStatus")).toContainText("병합");
  await open(page, "lesson/p1-l2");
  await expect(page.locator("[data-complete]")).toBeChecked();
});
test("corrupt v2 state is protected and valid recovery re-enables saving", async ({
  page,
}) => {
  await open(page);
  await page.evaluate(() => localStorage.setItem("fse_academy_v2", "{corrupt"));
  await page.reload();
  await open(page, "lesson/p1-l1");
  await expect(page.locator("#storageStatus")).toContainText("원본");
  await page.locator("[data-complete]").check();
  expect(
    await page.evaluate(() => localStorage.getItem("fse_academy_v2")),
  ).toBe("{corrupt");
  await open(page, "notes");
  const backup = {
    format: "fse-academy-backup",
    version: 2,
    academy: {
      version: 2,
      completed: {},
      assessments: {},
      reflections: {},
      lastLesson: null,
    },
  };
  await page
    .locator("#restoreBackup")
    .setInputFiles({
      name: "valid.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(backup)),
    });
  expect(
    await page.evaluate(() =>
      localStorage.getItem("fse_academy_v2_before_restore"),
    ),
  ).toBe("{corrupt");
  await open(page, "lesson/p1-l2");
  await page.locator("[data-complete]").check();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("fse_academy_v2")).completed["p1-l2"],
    ),
  ).toBe(true);
});
test("blocked localStorage reports failure and app stays usable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("quota", "QuotaExceededError");
    };
  });
  await open(page, "lesson/p1-l1");
  await page.locator("[data-complete]").check();
  await expect(page.locator("#storageStatus")).toContainText("저장 실패");
  await page.locator("nav [data-tab=calc]").click();
  await expect(page.locator("#toolForm")).toBeVisible();
});
test("loading error has a retry and legacy fallback", async ({ page }) => {
  await page.route("**/content/curriculum.json", (r) =>
    r.fulfill({ status: 503, body: "unavailable" }),
  );
  await page.goto("/");
  await expect(page.locator("#app")).toContainText("불러오지 못했습니다");
  await expect(
    page.getByRole("button", { name: "다시 불러오기" }),
  ).toBeVisible();
  await expect(page.locator("#app a")).toHaveAttribute("href", "legacy.html");
});
test("WCAG automatic checks on main screens and dictionary dialogs", async ({
  page,
}) => {
  for (const route of [
    "home",
    "part/1",
    "lesson/p2-l1",
    "quiz/p7-l5",
    "calc/geometry",
    "notes",
  ]) {
    await open(page, route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
  await open(page);
  await page.locator("#dictFab").click();
  let results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
  await page.getByRole("button", { name: "기본 사전 검색" }).click();
  results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});
test("keyboard lesson anchors and dictionary focus return", async ({
  page,
}) => {
  await open(page, "lesson/p2-l1");
  await page.getByRole("link", { name: "06 단계별 예제" }).click();
  await expect(page.locator("#section-example")).toBeInViewport();
  await open(page);
  await page.locator("#dictFab").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "AI 기술사전" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#dictFab")).toBeFocused();
});
for (const width of [320, 375, 390, 768, 1440])
  test("responsive learning/tool screens at " + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "home",
      "part/5",
      "lesson/p2-l1",
      "calc/involute",
      "quiz/p7-l5",
      "notes",
    ]) {
      await open(page, route);
      await noOverflow(page);
    }
  });
test("capture dashboard and textbook prototype", async ({ page }, info) => {
  await open(page);
  await page.screenshot({
    path: info.outputPath("dashboard.png"),
    fullPage: true,
  });
  await open(page, "lesson/p2-l1");
  await page.screenshot({
    path: info.outputPath("lesson.png"),
    fullPage: true,
  });
});
test("diagnosis evaluates evidence and sequence, explains unsafe and unsupported choices", async ({
  page,
}) => {
  await open(page, "quiz/p7-l5");
  await page.locator("[data-diagnosis]").click();
  await expect(page.locator("#diagnosis-p7-l5")).toContainText("다시 확인");
  await page.locator('input[name="evidence-p7-l5"][value="0"]').check();
  await page.locator('input[name="evidence-p7-l5"][value="1"]').check();
  for (let i = 0; i < 4; i++)
    await page.locator(`[data-order="${i}"]`).selectOption(String(i + 1));
  await page.locator("[data-diagnosis]").click();
  await expect(page.locator("#diagnosis-p7-l5")).toContainText("계획 통과");
  await expect(page.locator("#diagnosis-p7-l5")).toContainText(
    "원인 확정이 아닙니다",
  );
  await page.reload();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("fse_academy_v2")).assessments["p7-l5"]
          .diagnosis,
    ),
  ).toBe(true);
});
test("external state changes are protected from stale in-memory writes", async ({
  page,
}) => {
  await open(page, "lesson/p1-l1");
  await page.evaluate(() =>
    localStorage.setItem("fse_academy_v2", '{"version":3}'),
  );
  await page.locator("[data-complete]").check();
  await expect(page.locator("#storageStatus")).toContainText("외부");
  expect(
    await page.evaluate(() => localStorage.getItem("fse_academy_v2")),
  ).toBe('{"version":3}');
});
test("AI dialog traps forward and reverse keyboard focus", async ({ page }) => {
  await open(page);
  await page.locator("#dictFab").click();
  const first = page
    .getByRole("dialog", { name: "AI 기술사전" })
    .getByRole("button", { name: "기본 사전 검색" });
  await first.focus();
  await page.keyboard.press("Shift+Tab");
  expect(
    await page.evaluate(
      () => document.activeElement.closest(".ai14-overlay") !== null,
    ),
  ).toBe(true);
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
});
test("skip link reaches main without changing the course route", async ({
  page,
}) => {
  await open(page);
  await page.keyboard.press("Tab");
  await page.locator("a.skip").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#app")).toBeFocused();
  await expect(page).toHaveURL(/#home/);
  await expect(page.locator(".part-row")).toHaveCount(7);
});
