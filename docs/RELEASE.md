# PHASE F — release candidate and publication gate

Branch: `feature/gear-academy-v2-engineering`.

PR: https://github.com/jiiiiihong/FSE_edu/pull/10

**Running preview:** https://fse-gear-academy-v2.onrender.com

Render service `srv-db8bdmvavr4c73atib5g`, user-selected My Workspace. Manual deployment from the feature branch; auto-deploy off. Main/Pages/Worker remain unchanged. Application commit `21c20e0a2cbed507924cdb56598d4f4551c7f88f` passed 20 Node and 244 cross-browser tests, plus desktop/mobile checks against the public URL. Later documentation-only commits do not alter those tested app assets.

The preview is a different origin: existing production browser data stays at its original origin and is not automatically transferred. New AI searches against the existing Worker were not live-validated on this preview; basic dictionary and browser-local records are verified.

This is a reviewable engineering-academy implementation. **Do not merge main or deploy Pages/Worker without the user's final approval.** GitHub Pages currently publishes `main`, `/`; all added workflows only verify/package artifacts.

## Implemented scope

- 7 PART / 14 chapter / 35 lesson document curriculum with all 10 required sections.
- Prerequisites, chapter objectives, resume/progress, 5 assessment categories.
- 35 explained concept tasks, 20 tolerance-defined calculations, 7 evidence/sequence diagnosis exercises; 35 saved reflections and self-review rubrics.
- Ratio/efficiency, normal/transverse geometry comparison, exact involute branch with tangent construction, synthetic/user-input metrology graph.
- Unit-explicit pure models, labeled SVG schematics, documented mathematical assumptions and limits.
- Legacy app and storage compatibility, existing AI/Worker integration, added AI keyboard trap.
- Versioned additive storage, validation, corruption protection, stale-write guard, backup and recovery copy.
- Static Pages-compatible assets; Chromium and WebKit regression/axe suites; complete preview artifact CI.

## Publication gates

- [ ] Technical specialist reviews each lesson against the linked sources; record reviewer/date/claim evidence, and resolve `technical-review-pending` before marking publication-ready.
- [ ] Obtain and verify ISO 1328-1:2013 and ISO 1328-2:2020 catalogue/official text, scope, edition and applicable evaluation method. Development access returned HTTP 403; no verified tolerance tables are presented.
- [ ] Confirm materials/heat-treatment/process claims against the actual controlled reference editions and manufacturer documents.
- [ ] Physical iPhone Safari/VoiceOver and touch acceptance. Automated WebKit results are emulation, not hardware evidence.
- [ ] Live secure staging AI/Turnstile/Worker integration, model availability and cost controls; local AI tests are mocked.
- [ ] Confirm CI green for the exact PR head; inspect static artifact and current production-origin backup plan.
- [ ] User approves the exact commit for main merge and Pages publication.

## Release and recovery plan after approval

Back up browser data on the production origin, record approved commit/Pages source and retain v1.6 source. Merge/publish only the approved revision; verify production routing, assets, AI integration and unchanged legacy storage on that origin. Rollback of source returns to v1.6 and leaves the added v2 storage key unused; no broad storage reset. Production rollback also requires approval.

Full meshing animation, complete tooth/fillet solid generation and a machine-specific process kinematics simulator are beyond this candidate's verified tool scope. The delivered workbench prioritizes exact, bounded educational models. No app result is a machine setup prescription or accredited competency certification.
