# Security notes (demo-grade vs production)

## Demo-grade in this repo
- **Basic Auth** with username/password in environment variables.
- Credentials stored in browser `localStorage`.
- In-memory cache and in-memory rate limiting.

## Production upgrades (recommended)
- Replace Basic Auth with OAuth2/OIDC or JWT + refresh tokens.
- Store sessions securely (httpOnly cookies) and avoid localStorage for secrets.
- Use a centralized rate limiter (Redis) + WAF.
- Encrypt secrets with secret manager (GCP Secret Manager / AWS Secrets Manager).
- Add structured logging and PII redaction.
- Harden the Sheets write-back path with explicit allow-lists and change auditing.
- Add row-level security or separate sheets per tenant if multi-tenant.

## Grounding / data leakage controls
- Backend enforces:
  - Retrieval threshold (`min_retrieval_score`)
  - Pre-check refusal when no evidence and no computed analysis
  - Post-validation for required sections and refusal behavior
- The LLM prompt includes strict rules, but **the authoritative gate is the backend logic**.
