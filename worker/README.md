# v1.4 AI Dictionary Worker (development only)

This Cloudflare Worker is NOT deployed. No API key is stored in the repository.

Required server-side secrets/config:
- OPENAI_API_KEY: secret
- OPENAI_MODEL: model supporting Responses API strict JSON schema
- TURNSTILE_SECRET: secret
- ALLOWED_ORIGIN: exact https://jiiiiihong.github.io
- TURNSTILE_HOSTNAME: jiiiiihong.github.io
- AI_RATE_LIMITER: Cloudflare native rate limiting binding, configured and verified before enabling endpoint

Client must acquire a Cloudflare Turnstile token before each POST to the Worker, with JSON `{"term":"Backlash","turnstileToken":"..."}`.

**Deployment blockers:** provision Turnstile site key, configure Cloudflare edge rate limits and monthly AI budget, select and validate actual model and API pricing, and verify API responses. CORS is not authentication. Do not publish a callable endpoint before controls are tested.

No image is fabricated: diagram integration needs separately verified sources. Do not assume a model can draw precise engineering figures.

## Cloudflare rate limiting binding (required before API activation)

Create an AI_RATE_LIMITER binding in the Worker settings (native Rate Limiting). Start with a conservative limit such as 5 requests per 60 seconds per client IP, subject to the Cloudflare plan's supported periods. The Worker rejects calls if the binding is missing or unavailable. Set and test an upstream API spending control independently; rate limiting does not guarantee a fixed monetary cap.

The frontend deliberately leaves window.FSE_AI_ENDPOINT unset. A separately approved endpoint configuration and deployment are required for paid AI calls. The public Turnstile site key is embedded in ai-dictionary.js; never put TURNSTILE_SECRET or OPENAI_API_KEY in client code.
