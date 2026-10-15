# PHASE A — FSE Gear Academy audit

Baseline: `3f7456f` (v1.6.0), repository `jiiiiihong/FSE_edu`. Audit date: 2026-10-13.

## Reusable assets

- `index.html` baseline has 7 units, 20 lessons, 58 bilingual glossary entries, 36 multiple-choice questions and 8 numerical exercises. The complete baseline is retained byte-for-byte as `legacy.html`; data is also extracted without reindexing to `legacy-data.js` for the existing dictionary.
- Existing mathematical definitions, hobbing start-count distinction, normal/transverse conversion, TIR caution and evidence-first FSE guidance underpin expanded v2 lessons.
- `dictionary.js`: version-1 schema, validation, built-in search, safe Wiktionary links, notes/review, additive dictionary import, JSON export. Unit indices 0–6 are retained.
- `ai-dictionary.js`: one shared FAB, saved detailed explanations, model preference, Turnstile token acquisition, guarded Worker POST, mockable fetch seam. Endpoint and public site key unchanged.
- `worker/ai-dictionary.js`: origin/hostname checks, Turnstile verification, rate limiter, server-side model allowlist, timeout and sanitized diagnostics. Worker and API contract unchanged. AI dialog gains a minimal keyboard focus trap. No paid request was made during QA.

## Rewritten surfaces

- Original monolithic DATA + render + event handlers coupled course ordering to storage keys. New content uses stable IDs; JSON, rendering, diagrams, pure math and storage are separate files.
- `ui-v1.6.css` originally overrode inline dark styles and `navigation-v1.6.js` hid quiz/cases/notes in a five-slot mobile menu. These remain for the legacy app. V2 uses `academy.css` and document routes/TOC, keeping cards for supporting tools only.
- V1 DUMPE phases and term recall are retained in the archive. V2 has PART → Chapter → Lesson → Exercise → Assessment, 10 required lesson sections, 5 assessed ability categories and separate self-reflection.
- Baseline calculators did not reject blank inputs consistently and mixed UI with computation. V2 has finite-number and range checks, explicit units and assumptions, separate pure models.

## Data compatibility risks and mitigation

| Key | Existing shape | V2 behavior |
|---|---|---|
| `fse3_done` | `{ "unit-lesson": boolean }` | Raw unchanged; legacy completion count shown separately, never counted as new mastery |
| `fse3_answers` | question index → choice index | Raw unchanged; legacy quiz remains operational |
| `fse3_memo` | JSON string | Read into notes; only explicit memo save updates this same key |
| `fse_dictionary_v1_3` | `{version:1,entries:[...]}` with numeric unit IDs | Dictionary code and 7 unit indices unchanged |
| `fse_ai_dictionary_v1_4` | saved AI explanation array | Existing AI code, memo/review fields unchanged |
| `fse_ai_model_v1_5` | model string | Existing selection and allowlist unchanged |
| `fse_academy_v2` | new version-2 stable-ID state | Separate completions, latest evaluations, reflections and last location |

V2 does not reinterpret legacy quiz scores or automatically mark expanded lessons complete. There is no destructive migration. Invalid/future v2 JSON remains untouched and stops writes; recovery validates a backup before mutation and saves the pre-restore raw value. Completion merge is additive, existing reflection/evaluation wins. A full export includes all six legacy raw keys. Restore only merges v2; legacy dictionary import remains available in the archive. Same-origin Pages retains data; a preview on another origin cannot see production storage.

## Testing and deployment risks

- Old E2E selectors assume seven expandable DUMPE units, bottom navigation and More menu. Those assertions now run on `legacy.html`; they were not removed or converted into superficial v2 assertions.
- New course routes, numerical tolerances, corrupt/quota-denied storage, export/import, accessibility and responsive layouts require their own suite.
- Original projects were Chromium desktop and Pixel emulation only. V2 adds desktop WebKit and iPhone WebKit emulation; neither substitutes for physical Safari/VoiceOver.
- Original `development-verification.yml` packaged only three assets, so a v2 preview must include JSON and module dependencies. New CI creates a complete static artifact without publishing it.
- Existing GitHub Actions do not deploy Pages. Read-only Pages API check on 2026-10-13 confirmed **legacy branch publication from `main`, `/`**. A feature-branch push is isolated from this deployment source.
- GitHub main merge, Pages publication and Cloudflare deployment require the user's final approval and are not performed.
