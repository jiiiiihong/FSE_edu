# v1.4 AI Dictionary Worker (development only)

This Cloudflare Worker is NOT deployed. No API key is stored in the repository.

Required server-side secrets/config:
- OPENAI_API_KEY: secret
- OPENAI_MODEL: model supporting Responses API strict JSON schema
- TURNSTILE_SECRET: secret
- ALLOWED_ORIGIN: exact https://jiiiiihong.github.io

Client must acquire a Cloudflare Turnstile token before each POST to the Worker, with JSON `{"term":"Backlash","turnstileToken":"..."}`.

**Deployment blockers:** provision Turnstile site key, configure Cloudflare edge rate limits and monthly AI budget, select and validate actual model and API pricing, and verify API responses. CORS is not authentication. Do not publish a callable endpoint before controls are tested.

No image is fabricated: diagram integration needs separately verified sources. Do not assume a model can draw precise engineering figures.
