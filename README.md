# FSE Gear Academy v2

[Open the running v2 preview](https://fse-gear-academy-v2.onrender.com) · [PR #10](https://github.com/jiiiiihong/FSE_edu/pull/10)

Verified: 20 Node tests, 244 desktop/mobile Chromium/WebKit tests, and desktop/mobile smoke tests against the public preview.

Static engineering learning platform for Korean-speaking engineers and new Field Service Engineers: 7 PARTs, 14 chapters, 35 lessons, 62 objective evaluation tasks and 35 saved written exercises.

The curriculum is a **technical-review draft**. Standard tables and OEM-specific alarm/parameter instructions are not fabricated. Each lesson exposes sources, assumptions, limits and publication status.

## Local preview

```sh
npm ci
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173`. No build step, application packages or API credentials are needed. The AI dictionary uses the existing secured Cloudflare endpoint; its tests use mocks and do not call paid models.

## Verification

```sh
npx playwright install --with-deps chromium webkit
npm run test:syntax
node scripts/check-ui-v1.6.mjs
npm run test:unit
npm run test:e2e
```

Desktop/mobile Chromium and desktop/iPhone-emulated WebKit. [Audit](docs/AUDIT.md), [curriculum & prototype](docs/CURRICULUM.md), [data compatibility](docs/DATA-COMPATIBILITY.md), [QA report](docs/QA.md), [release gate](docs/RELEASE.md).

`legacy.html` preserves the original course, quizzes, notes and glossary. `legacy-data.js`, `dictionary.js`, `ai-dictionary.js`, original CSS/navigation and `worker/` preserve legacy integrations. New progress uses a separate versioned storage key.

Pages remains based on `main`, `/`. Feature branch/PR checks only; no main merge, Pages publish or Worker deployment without final user approval.
