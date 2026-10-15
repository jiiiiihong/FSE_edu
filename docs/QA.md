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
- Four-project browser suite on 2026-10-13: **214 passed / 216 total**, 2 timeouts in the monolithic 58-card legacy glossary checks on WebKit. All v2 functional/accessibility tests passed in all four projects. The legacy glossary tests are now split into seven unit-scoped tests (same 58 entries); the final skip-link test is also included. Updated suite: 244 cases; CI execution pending. See `qa-results.json` for preserved run metadata.

Earlier Chromium run: 98/102 passed. A responsive grid minimum width issue was fixed; two corrupt-state tests were corrected to reload after injecting persisted data. Targeted recheck: 12/12 passed. Earlier four-project run: 188/208 passed; long multi-step tests hit 30 s limits under four-worker contention. Final configuration uses two workers and 90 s per test. These earlier runs are diagnostic evidence, not the final acceptance result.

## Runtime environment

Node 24.19.0, Python 3.12, Debian 13. Playwright lockfile pins the installed version. Chromium 156.0.8078.4 / WebKit 27.2 (Playwright builds 1248/2370).

The local image lacked WebKit libraries. Debian packages were downloaded/extracted under `/tmp/fse-browser-libs` and linked into the temporary Playwright bundle, without system installation. Host cache validation was skipped because `ldconfig` does not list those locally provided libraries; WebKit actually launched and executed tests. CI installs normal system dependencies with `playwright install --with-deps`; no bypass is configured in tracked CI.

## Technical source review and limits

KHK Technical Reference index, Involute Gear Profile and Calculation of Gear Dimensions returned HTTP 200 and correct titles. ISO catalogue/OBP requests returned HTTP 403. References therefore distinguish link checks from claim-level professional verification. All 35 lessons remain `publicationReady:false`.

Corrected the worked example of a 60→61 mm center distance at 20° to α_w=22.4388°. Contact example ε_α=1.6351859636 was independently calculated. Diagrams distinguish computed curves/circles from conceptual blocks; no illustrative polygon is claimed to be a manufactured involute tooth. Sample graphs and case values are explicitly synthetic, with no invented ISO tolerance limits.

No physical Safari/VoiceOver test, paid AI API call, live Worker deployment, main merge or production publication occurred. Production localStorage was not read or modified. Browser-local data tests use isolated local contexts.
