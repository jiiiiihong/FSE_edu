# PHASE B/C — curriculum and information architecture

## Intended progression

| PART | Chapters | Ability progression |
|---|---|---|
| I Fundamentals | Power & gear types / Geometry & meshing | Identify → explain ratio → calculate size/load |
| II Geometry | Involute & planes / Contact & generation | Trace generation → convert planes → assess contact/design assumptions |
| III Manufacturing | Cutting & generating motion / Finishing & planning | Compare relative motion → select processes → verify condition changes |
| IV Materials | Material & structure / Distortion & finishing | Connect failure mode → heat treatment → measurement before/after |
| V Metrology | Datums & deviations / Inspection & standards | Define what was measured → distinguish error components → establish decision rules |
| VI FSE | Drives & motion errors / Calibration & diagnosis | Separate signal/mechanics → compare hypotheses → verify evidence |
| VII Cases | Noise & geometry / Process changes | Integrate model predictions, confounders, controlled checks and final validation |

35 stable-ID lessons, 5 per PART and 3/2 per chapter. Each lesson supplies objectives, engineering context, theory, formula/definitions/assumptions, labeled diagram, worked example, application, limitations, common mistakes, practice/assessment and reference/review metadata. `legacyRefs` reclassifies the old units as supplementary materials without renumbering storage indices.

## Learning flow

1. Dashboard: resume location, PART progress, latest results by ability and workbench shortcuts.
2. PART/chapter: objectives, predecessor PART, structured lesson list and chapter assessment entry.
3. Lesson: document reading, accessible in-page TOC, prerequisite links, formulas, diagrams and stepped examples.
4. Practice: choices with each distractor's explanation, numerical input with tolerance/unit/rounding, saved reflection and self-review rubric.
5. Integrated diagnosis: compare multiple hypotheses; select evidence checks and construct verification order. Passing a plan never means the app has identified a real machine's root cause.
6. Progress: manual reading completion is separate from assessed success. Return to theory from an assessment; proceed to next lesson across PART boundaries.

## Assessment contract

- 35 concept/application questions; all choices have explanations.
- 20 numerical exercises; independently specified expected-value fixtures, symmetric absolute tolerance, finite input and rejection of blanks.
- 7 evidence/verification-plan exercises in FSE and integrated cases. Both evidence selection and sequence must pass; disallowed shortcuts are explained.
- 35 saved written reflections with visible rubric. These are **not machine-graded**.
- Recall / Understanding / Calculation / Application / Diagnosis are recorded separately. Current scores use latest evaluation, not historical attempt inflation. UI does not claim accredited certification or calibrated proficiency.

## Prototype/design system

`index.html`, `academy.css` and `academy.mjs` are the working prototype and implementation. Ink/ivory/teal with orange engineering curves; ruled chapter rows, restrained panels and a desktop reading sidebar. At small widths, chapter list becomes document navigation and technical figures may scroll within their own container so labels remain legible. Targets ≥44 px; input font ≥16 px; reduced motion; local system fonts; no CDN fonts or application runtime dependencies.

The pure engineering models, Formula rendering, labeled SVG Diagram, numbered Example and Assessment rendering are reusable. Content does not contain event handlers or view markup. Source-linked technical content is still draft until an appropriately qualified reviewer checks claims against the referenced documents.
