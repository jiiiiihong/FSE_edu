# PHASE E — technical and functional QA

Date: 2026-10-13. Baseline: v1.6 `3f7456f`. Candidate: `feature/gear-academy-v2-engineering`.

## Verification methods

- Parse both HTML entry points, external JS/modules and curriculum JSON; retained v1.6 asset/storage/nav invariants.
- Pure-model tests against independent numerical values: spur/helical diameter, base pitch, pressure angle, ratio/power balance, involute radius/tangent string and external spur contact ratio.
- Numerical answer tolerance boundaries, blanks/nonfinite/range rejection and raw sample range interpretation.
- Content schema, prerequisite ordering, source existence, publication flags and complete legacy dataset.
- Versioned state validation, quota/denied storage, raw legacy key preservation, additive restore and invalid backup rejection.
- Retained Worker diagnostics: HTTP failures, incomplete output, malformed JSON/schema; no secret leakage.
- Browser suites: old chapter/glossary/quiz/calculators; new 35-lesson contracts; all 20 numeric tasks; 7-case diagnosis workflow; reading/assessment/reflection persistence; corrupt/stale state; backups; AI mocks and keyboard focus.
- Axe WCAG 2 A/AA and 2.1 AA on dashboard, PART, lesson, assessment, calculator, notes, AI dialog and basic dictionary. This automated scan does not replace manual screen-reader review.
- Responsive widths: 320, 375, 390, 768, 1440 px; screenshots of dashboard/textbook in each browser project.

## Current execution evidence

- JavaScript/HTML/JSON syntax: PASS.
- Retained v1.6 static checks: PASS.
- Node tests: **20 passed, 0 failed** (final local execution).
- Final GitHub Actions four-project suite: **244 passed, 0 failed**, on 2026-10-15 (3.9 minutes).
- Validated application commit: `21c20e0a2cbed507924cdb56598d4f4551c7f88f`.
- CI evidence: https://github.com/jiiiiihong/FSE_edu/actions/runs/38726375297
- Legacy Chromium regression and v1.6 static checks: PASS in separate jobs.
- Live Render browser smoke: desktop 1440×1000 and mobile 390×844 both PASS. Confirmed 7 PARTs, chapter/lesson routes, numeric grading, saved completion after reload, helical calculator, built-in dictionary, no horizontal overflow and no JavaScript exceptions.
- Live root, curriculum (35 lessons), JS modules, CSS, legacy app and dictionaries: HTTP 200 with correct content types.
- Published URL: https://fse-gear-academy-v2.onrender.com

The earlier 214/216 local result is preserved in `qa-results.json`. Its two WebKit timeouts were confined to a single long 58-card test. Seven per-unit tests now cover the same entries and pass in all four CI projects.

Earlier Chromium run: 98/102 passed. A responsive grid minimum width issue was fixed; two corrupt-state tests were corrected to reload after injecting persisted data. Targeted recheck: 12/12 passed. Earlier four-project run: 188/208 passed; long multi-step tests hit 30 s limits under four-worker contention. Final configuration uses two workers and 90 s per test. These earlier runs are diagnostic evidence, not the final acceptance result.

## Runtime environment

Node 24.19.0, Python 3.12, Debian 13. Playwright lockfile pins the installed version. Chromium 156.0.8078.4 / WebKit 27.2 (Playwright builds 1248/2370).

The local image lacked WebKit libraries. Debian packages were downloaded/extracted under `/tmp/fse-browser-libs` and linked into the temporary Playwright bundle, without system installation. Host cache validation was skipped because `ldconfig` does not list those locally provided libraries; WebKit actually launched and executed tests. CI installs normal system dependencies with `playwright install --with-deps`; no bypass is configured in tracked CI.

## Technical source review and limits

KHK Technical Reference index, Involute Gear Profile and Calculation of Gear Dimensions returned HTTP 200 and correct titles. ISO catalogue/OBP requests returned HTTP 403. References therefore distinguish link checks from claim-level professional verification. All 35 lessons remain `publicationReady:false`.

Corrected the worked example of a 60→61 mm center distance at 20° to α_w=22.4388°. Contact example ε_α=1.6351859636 was independently calculated. Diagrams distinguish computed curves/circles from conceptual blocks; no illustrative polygon is claimed to be a manufactured involute tooth. Sample graphs and case values are explicitly synthetic, with no invented ISO tolerance limits.

No physical Safari/VoiceOver test, paid AI API call, live Worker deployment or main merge occurred. A separate public Render preview was published with the user’s authorization; the existing production Pages site is unchanged. Production localStorage was not read or modified. Browser-local data tests use isolated local contexts.
