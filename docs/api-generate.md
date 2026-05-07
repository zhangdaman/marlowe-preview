# Generate API — Rate-Limit & Anti-Abuse Spec

> Purpose: prevent malicious / bot abuse of the AI portrait generation pipeline while keeping real-customer experience frictionless. This is the contract between the Marlowe frontend (customize stage in `designer.html`) and the backend `/api/generate` endpoint.

---

## 1. Cost model

- Each `/api/generate` call invokes a paid AI pipeline (Replicate halftone-portrait pipeline or self-hosted SD + ControlNet).
- Estimated cost: **~$0.05 per generation** (Replicate pricing as of 2026).
- Real customers average **2–3 generations** before checkout → ~$0.10–0.15 AI cost per converted lead.
- Without controls, a single malicious actor can rack up $10s–$100s in a few hours.

## 2. Threat model

| # | Threat | Severity |
|---|---|---|
| 1 | Bot scrapers using `/api/generate` as a free AI endpoint | High |
| 2 | One-off curiosity users generating 5–10× then leaving | Medium |
| 3 | Malicious scripted loops (no Turnstile = wide open) | High |
| 4 | One user creating 20 fake emails to bypass per-email limits | Low (IP fallback catches) |

## 3. Defense layers (3 stacked)

### Layer 1 — Cloudflare Turnstile (frontend)

- **Why Turnstile, not reCAPTCHA**: free, invisible by default (manual challenge only on suspicious traffic), no Google tracking, 5-minute integration.
- **Where**: mounts in customize panel, after the email field, before the Generate CTA.
- **Behavior**: user cannot click Generate until Turnstile token is issued.
- **Server-side verification**: every `/api/generate` call must include `turnstile_token`; backend posts it to `https://challenges.cloudflare.com/turnstile/v0/siteverify` with the secret key. Reject 400 on failure.

### Layer 2 — User-based rate limit (backend, primary)

> **Updated 2026-05-07**: with the move to account-based sign-in (see [auth.md](auth.md)), Generate is now gated by login. Rate-limit key shifts from email to `user_id`. Email-based limits are kept as a fallback for legacy / non-account paths.

- **Sign-in required** before Generate (enforced at frontend modal + backend bearer-token check).
- Limits per user (rolling windows):
  - **5 generations per 60 minutes**
  - **15 generations per 24 hours**
  - More generous than the old email-only flow because account-bound users are higher-trust
- **Storage**: Redis. Key format:
  - `gen:user:<user_id>:hour` — TTL 60min
  - `gen:user:<user_id>:day` — TTL 24h
- **Atomic increment** on every successful (non-429, non-400) request.
- On limit reached: respond `429` with `{ error: "rate_limited_user", retry_after: <seconds>, message: "..." }`.

**Email-based fallback** (only fires if Generate is somehow called without an authenticated user — should be 0 in normal flow):
- 3 generations per 60 minutes per email
- Key: `gen:email:<sha256(email)>:hour` — TTL 60min
- On limit reached: respond `429` with `{ error: "rate_limited_email", retry_after: <seconds>, message: "..." }`.

### Layer 3 — IP-based rate limit (backend, fallback)

- Catches the case where one user creates multiple fake emails.
- Limit per IP: **5 generations per 60 minutes**.
- **Storage**: Redis. Key: `gen:ip:<ip>:hour` — TTL 60min.
- On limit reached: respond `429` with `{ error: "rate_limited_ip", retry_after: <seconds>, message: "..." }`.
- Note: also catches NAT-shared customers (universities, offices) — keep limit reasonable. 5/hr is generous; raise if real-customer reports come in.

## 4. API contract

### `POST /api/generate`

**Request body** (`multipart/form-data`):

| Field | Type | Notes |
|---|---|---|
| `photo` | File | User's pet photo. Required. ≤ 10MB, `image/*` (JPG/PNG/HEIC/WebP). |
| `shape` | string | `'shield'` \| `'octagon'` \| `'disc'` |
| `color` | string | `'silver'` \| `'brass'` \| `'teal'` \| `'charcoal'` \| `'copper'` |
| `pet_name` | string | ≤ 12 chars, uppercase recommended |
| `pet_phone` | string | Free-form; FE doesn't validate format |
| `email` | string | (deprecated — use Authorization header for signed-in users; fallback only) |
| `newsletter_opt_in` | boolean | Captured at sign-up (see [auth.md](auth.md)); not part of generate request anymore |
| `turnstile_token` | string | From Cloudflare widget, single-use |

**Headers** (signed-in flow — primary path):
| Header | Value |
|---|---|
| `Authorization` | `Bearer <supabase_access_token>` |

**Response 200** (queued — async pipeline):
```json
{ "job_id": "abc123def", "status": "queued" }
```
Then poll `GET /api/jobs/:job_id` until `status === 'done'` → `{ status: "done", portrait_url: "https://cdn.marlowe.example/portraits/<id>.png" }`.
On failure: `{ status: "failed", error: "generation_failed", message: "..." }`.

**Response 429** (rate-limited):
```json
{
  "error": "rate_limited_email",
  "retry_after": 1234,
  "message": "You've generated 3 portraits in the last hour. Try again in 32 minutes."
}
```

**Response 400** (invalid input or bot check):
```json
{
  "error": "invalid_email" | "invalid_photo_format" | "invalid_photo_size" | "turnstile_failed",
  "message": "..."
}
```

**Response 500** (generation failed mid-pipeline):
```json
{ "error": "generation_failed", "message": "..." }
```

## 5. Frontend responsibilities

### Customize panel (stage-2 in designer)

- New section **D — Where to send your proof** with required email input.
- Newsletter opt-in checkbox (default **checked**, GDPR-compliant — language: "Send me updates about new finishes and seasonal limited runs. Unsubscribe anytime.").
- Cloudflare Turnstile widget mounts after email field.
- "Generate" CTA disabled until:
  1. Email matches `^[^\s@]+@[^\s@]+\.[^\s@]+$`
  2. Turnstile token issued
- Pass `email`, `newsletter_opt_in`, `turnstile_token` along with the existing payload to `/api/generate`.

### Stage-error reason switcher

Currently the error stage is generic ("The portrait didn't take."). Add reason-specific copy switching based on backend `error` code:

| Backend `error` | Title | Body |
|---|---|---|
| `rate_limited_email` | "Take a breather." | "You've generated 3 portraits in the last hour. Try again in [X] min — or save your design and come back, your cart is still here." |
| `rate_limited_ip` | "Too many generations." | "Looks like there's been a lot of activity from your network. Try again in [X] min." |
| `turnstile_failed` | "Quick check needed." | "Anti-bot check didn't go through. Refresh and try again." |
| `invalid_email` | "Email looks off." | "Double-check the format and try again." |
| `invalid_photo_format` / `invalid_photo_size` | "Photo issue." | (existing dropzone-error wording) |
| `generation_failed` *(default)* | "The portrait didn't take." | "Our system couldn't read this photo clearly enough. Try a brighter, front-facing shot — or pick one of our breed samples." |

## 6. Cost projection

| Cohort | Behavior | Gens | $ AI cost |
|---|---|---|---|
| 100 real customers | ~2.5 gens to checkout | 250 | $12.50 |
| 100 bot attempts | Turnstile blocks ~95% → 5 leak through, capped at 3 by email limit | 15 | $0.75 |
| **Total per ~$7,900 revenue cohort** | | **265** | **~$13.25** |

AI cost ≈ **0.17% of revenue**. Margin-safe.

## 7. Privacy alignment

- Email field is now a **mandatory** data input. Covered by [privacy.html](../privacy.html) §01 ("Contact information").
- Newsletter consent tracked server-side: `{ email, consent_state, consent_timestamp }`.
- Photo retention 1 year per [privacy.html](../privacy.html) §03 — `/api/generate` is the storage entry point. Set up TTL-based deletion on uploads bucket.

## 8. v1.5 upgrades (deferred — implement after data)

### A. Add-to-Cart unlocks unlimited regenerations
After a user adds a generated portrait to cart, all further regenerations of cart items bypass the email/IP rate limits — they've already committed. Reduces conversion friction at the highest-bounce moment ("ehh, this one's not perfect").
- Implementation: signed cart token from `/api/cart/:cart_id` exempts caller from limit middleware.
- Risk: malicious user creates a cart, gets unlimited gens. Mitigation: still cap at e.g. 20/hr per cart, just much higher than pre-cart.

### B. Abandoned-design recovery email
Cron: every email with ≥ 2 generations in last 7 days that hasn't converted → send at T+48h: "We saved your designs — your cart is still here. Free shipping for 24h."
- Run as 4-week test, measure incremental conversion lift.
- Sender: SendGrid template, link includes one-time recovery code that pre-fills the cart.

### C. Generate-history dashboard
Authenticated customer dashboard showing all past generations + ability to "redo" any of them. Encourages return visits / repeat purchases.
- Requires Account system — not in v1 scope.

## 9. Monitoring

Track in GA4 / Plausible / your analytics of choice:

| Event | When |
|---|---|
| `gen_attempt` | Every Generate click (after FE validation passes) |
| `gen_rate_limit_email` | Backend returns `429 rate_limited_email` |
| `gen_rate_limit_ip` | Backend returns `429 rate_limited_ip` |
| `gen_turnstile_fail` | Backend returns `400 turnstile_failed` |
| `gen_success` | Backend returns `200` and job completes |
| `gen_to_checkout` | Generate followed by Add to Cart in same session |

**Healthy ratios after week 1:**
- `gen_rate_limit_hit / gen_attempt` < **5%** (higher → real customers are hitting the cap; raise it)
- `gen_to_checkout / gen_success` ≥ **30%** (industry baseline for AI portrait products)
- `gen_turnstile_fail / gen_attempt` < **2%** (higher → Turnstile is too aggressive on real users)

## 10. Open questions for backend / ops

- [ ] Confirm Replicate vs self-hosted SD pipeline before wiring this up. Cost-per-gen baseline needs to be locked.
- [ ] Pick Turnstile site-key / secret-key environment (managed via .env / Secrets Manager).
- [ ] Decide on uploads bucket: S3 + CloudFront? Cloudflare R2? Tied to photo retention policy.
- [ ] Confirm newsletter consent capture format that satisfies CAN-SPAM / GDPR / CCPA — needs legal review of the checkbox copy.
- [ ] Decide tax policy: Stripe Tax auto-handles US sales tax across 50 states, but Marlowe's nexus must be configured. Likely just CA initially.

---

## Changelog
- 2026-05-07 — Initial spec.
