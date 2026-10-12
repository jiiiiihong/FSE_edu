# FSE Gear Academy verification policy v1.2

Development branch: `feature/agent-verification-v1-2`. Do not merge, push to the Pages deployment source, deploy, or roll back without separate explicit approval.

## Local verification
1. Install Node.js 20+ and Python 3.
2. Run `npm install` and `npx playwright install chromium`.
3. Run `npm run test:syntax`.
4. Run `npm run test:e2e`. Both desktop Chromium and mobile-emulated Chromium must pass.

## Gate definitions
- GATE 1: requirements-to-diff traceability; branch isolated from deployment.
- GATE 2: syntax and static checks PASS.
- GATE 3: real-browser Playwright tests PASS 100%; unavailable browser = NOT VERIFIED.
- GATE 4: separate approval for a specific commit SHA before production merge/deploy.
- GATE 5: production deployment confirmed, approved commit identity verified, and production browser tests PASS.

The browser tests here are an initial regression suite, **not** evidence that every v1.2 required scenario is covered. Before deployment approval, extend coverage for all chapter transitions, scoring boundaries, glossary behavior, mobile interactions, resource paths, and independently checked calculation expected values. Capture browser version, test output, and screenshots/traces as evidence.

Production verification must run against the actual production URL after approval; local tests are not a substitute. No automatic rollback or hotfix without a separate approval.
