# FSE Gear Academy v1.4: isolated preview (not a production deployment)

This preview artifact is created only after the GitHub Actions browser tests succeed. It contains `index.html`, `dictionary.js`, and `ai-dictionary.js`, without credentials or a backend.

## Run locally on a computer
1. Download the `fse-v1-4-preview` artifact from the successful **Development verification (no deployment)** GitHub Actions run.
2. Extract all files to one folder.
3. In that folder run `python3 -m http.server 4173` (Windows: `py -m http.server 4173`).
4. Open `http://localhost:4173` in a browser.

## Manual acceptance checklist
- [ ] Exactly one floating dictionary button is visible on the learning tab.
- [ ] It opens AI search, and **기본 사전 검색** opens the built-in dictionary.
- [ ] Search for `Backlash` in the built-in dictionary; save it.
- [ ] In **용어장**, verify saved entry, notes, review and JSON backup.
- [ ] Search an unknown term; external Wiktionary link is safe.
- [ ] AI search without `FSE_AI_ENDPOINT` reports that server integration is unavailable and does not call paid APIs.
- [ ] Reload and confirm stored terms remain.
- [ ] Check phone-sized browser layout and modal closing.

## Scope and limitations
- No GitHub Pages publication, no main merge, no Cloudflare Worker code deployment.
- AI responses, Turnstile and rate limiting are **not** exercised by this preview. A separate secure staging Worker and explicit approval are needed for a paid end-to-end test.
- Browser storage is local to the origin and device. This preview does not migrate the existing production origin's localStorage.
- This artifact is not a public hosted preview URL. To test on iPhone directly, a separately approved private hosting or local-network setup is required.
