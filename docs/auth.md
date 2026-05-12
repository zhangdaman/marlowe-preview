# Authentication & Account System Spec

> v1 promoted from v1.5 backlog (decided 2026-05-07). Marlowe is now an account-based DTC site with progressive sign-in: browse / cart guest-friendly, **generate requires sign-in**.
>
> **2026-05-12 update**: Magic Link **replaced by 6-digit Email OTP** because magic links add 30-60s context-switching that hurts US e-commerce conversion. Also added **"Remember me on this device"** (7-day session) for the standard US "stay signed in" pattern.

---

## 1. Decisions locked

| Decision | Choice | Rationale |
|---|---|---|
| **Sign-in pattern** | Progressive — browse + cart as guest; **Generate requires login** | Preserves first-touch conversion; uses Generate (the AI-cost moment) as account anchor |
| **Auth methods** | **Email OTP** (primary, 6-digit code) + **Google OAuth**. Apple OAuth **deferred to v1.5** (code-ready, UI hidden). | OTP keeps user on the same page (no app-switching to inbox-and-back); Google for one-tap users; no passwords to remember/leak |
| **Auth provider** | **Supabase Auth** | Free tier ≤ 50K MAU; native OTP + OAuth + sessions; SDK handles browser side |
| **Password support** | **None** | Heritage brand; password-less is calmer, fewer support tickets |
| **Identity = email** | One account per email; OAuth-linked emails are the same account | Avoid duplicate accounts; matches privacy expectation |
| **Session persistence** | "Remember me on this device" toggle (default ON) | ON = 7-day refresh token in localStorage. OFF = session-only (cleared on tab close). Matches Amazon / Apple ID convention. |

## 2. Sign-in flow

### 2.1 Email OTP (primary)

```
User clicks "Sign in" / triggers auth gate
    ↓
Email input + "Remember me on this device" toggle → "Send 6-digit code"
    ↓
Supabase emails 6-digit code (no link, no redirect)
    ↓
User reads code from inbox, types it back on the same page
    ↓
Supabase verifies code, sets session
    ↓
Redirect to:
  - if user came from designer Generate → resume designer Stage 2 (modal closes, generate fires)
  - if user came from cart → resume cart
  - else → /account.html
```

OTP TTL: **10 minutes**. Single-use. Resend cooldown **30 seconds**.

### 2.2 OAuth (Google only in v1; Apple deferred)

```
User clicks "Continue with Google"
    ↓
"Remember me" preference stashed in sessionStorage
    ↓
Redirect to Google consent screen
    ↓
User approves → callback to /auth-callback.html
    ↓
Supabase exchanges code for session; remember-me preference applied
    ↓
Redirect to original page
```

OAuth scopes:
- **Google**: `email`, `profile` (display name + avatar URL)
- **Apple** (deferred v1.5): would use `email`, `name`. The button HTML lives commented-out in `login.html`, `login-zh.html`, and both designer auth-modal templates; `auth-state.js` already accepts `provider: 'apple'`. To re-enable: uncomment the buttons and add Apple Developer credentials to Supabase.

## 3. When sign-in is required

| Page / Action | Guest? | Notes |
|---|---|---|
| Home (`index.html` / `index-zh.html`) | ✅ | No gate; nav shows "Sign in" link |
| Designer Stage 1 (Upload) | ✅ | Photo upload allowed pre-login (sample chips and real photos) |
| Designer Stage 2 (Customize) | ✅ | Shape / finish / engraving — no gate |
| **Designer Generate button** | ❌ **Must be signed in** | Primary auth trigger. If guest clicks → modal with 6-digit email code + OAuth |
| Designer Stage 3 (Loading + Final) | ❌ Implies signed in | Flowed through Generate gate |
| Cart (`cart.html`) | ✅ | localStorage cart; signed-in users sync to server cart |
| Checkout (`checkout.html`) | ✅ | Guest can checkout. Signed-in users skip pre-filled fields |
| Account (`account.html`) | ❌ Sign-in required | Order history + saved designs |
| Thank-you (`thank-you.html`) | ✅ | After-purchase; signed-in users see "View in Account" |
| Legal pages | ✅ | Always public |

## 4. Auth state in the frontend

### 4.1 `auth-state.js` (shared module)

A single JS file all pages load. Wraps the Supabase JS SDK with a stable interface:

```js
window.MarloweAuth = {
  // Read current user (null if not signed in). Returns:
  //   { id, email, displayName?, avatarUrl?, provider, rememberMe, expiresAt? }
  getUser(): User | null

  // Send a 6-digit OTP code to the email address.
  // Returns { ok, email, mockCode? } on success (mockCode only in dev mode).
  signInWithEmailOtp(email): Promise<{ ok: true, email, mockCode? } | { error }>

  // Verify the 6-digit code and sign the user in.
  // rememberMe: true → 7-day localStorage session. false → session-only.
  verifyEmailOtp(email, code, rememberMe?): Promise<{ ok: true, user } | { error: 'invalid_code' | 'expired' | 'no_pending' }>

  // Resend a fresh OTP code.
  resendEmailOtp(email): Promise<{ ok: true, email, mockCode? } | { error }>

  // Trigger OAuth flow (provider = 'apple' | 'google'). rememberMe stashed
  // in sessionStorage so the callback applies it after the redirect round-trip.
  signInWithProvider(provider, rememberMe?): void  // navigates away

  // Sign out (clears session)
  signOut(): Promise<void>

  // Subscribe to auth state changes
  onAuthChange(callback): unsubscribe

  // Verify current session (call on protected pages); redirects if not signed in
  requireAuth(redirectTo?): Promise<User>
};
```

In v1 dev/mock mode (before Supabase keys are wired), this file stores sessions in `localStorage` (remember-me ON) or `sessionStorage` (remember-me OFF). To swap to real Supabase: replace function bodies with `supabase.auth.*` calls — no other file changes.

**Supabase real-flow mapping**:
- `signInWithEmailOtp(email)` → `supabase.auth.signInWithOtp({ email })` *(without `emailRedirectTo` → returns 6-digit code rather than a link)*
- `verifyEmailOtp(email, code)` → `supabase.auth.verifyOtp({ email, token: code, type: 'email' })`
- `signInWithProvider('apple')` → `supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo: '<abs>/auth-callback.html' } })`
- `signOut()` → `supabase.auth.signOut()`

### 4.2 Page integration

Every page `<head>` loads:
```html
<script src="auth-state.js" defer></script>
```

Pages that need auth state in nav (sign-in link or user pill) wait for `MarloweAuth.onAuthChange()` and update DOM.

Pages requiring auth (`account.html`):
```js
MarloweAuth.requireAuth('/login.html').then(user => { ... });
```

## 5. Session storage

Supabase JS SDK manages session via:
- `localStorage` key `sb-<project>-auth-token` (default)
- Auto-refresh access token before expiry (1 hour default)
- Refresh token rotates per refresh

For our nav state checks, we read from `MarloweAuth.getUser()` which wraps `supabase.auth.getSession()`.

## 6. Cart sync (guest → signed-in)

When a guest with a non-empty `localStorage.marlowe_cart` signs in:

1. Frontend detects sign-in event via `onAuthChange`
2. POST guest cart items to `/api/cart/merge` with auth token
3. Backend merges items into user's server cart (dedupe by `tagId`)
4. Frontend clears `localStorage.marlowe_cart` and switches to server-cart mode
5. Subsequent cart operations hit `/api/cart/*` endpoints

Conflict resolution: if server cart already has the same `tagId`, **keep the server one** (likely from another device).

For signed-in users, cart is always server-side; for guests, always localStorage.

## 7. Database schema (Supabase / Postgres)

### `auth.users` (Supabase managed)
- `id: uuid` (primary key, used as `user_id` everywhere)
- `email: text`
- `created_at: timestamp`
- (other Supabase-managed fields)

### `profiles` (we manage)
```sql
create table profiles (
  user_id uuid references auth.users(id) primary key,
  display_name text,
  avatar_url text,
  newsletter_opt_in boolean default true,
  newsletter_consent_at timestamptz,
  created_at timestamptz default now()
);
```

### `orders`
```sql
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),  -- nullable for guest checkouts
  guest_email text,                          -- only set for guest orders
  status text not null,                      -- 'received', 'in_production', 'shipped', 'delivered', 'cancelled'
  stripe_payment_intent_id text,
  shipping_address jsonb,
  subtotal_cents integer,
  tax_cents integer,
  total_cents integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### `archived_designs`
```sql
create table archived_designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  order_id uuid references orders(id),       -- which order this came from
  shape text not null,
  color text not null,
  pet_name text not null,
  pet_phone text,
  halftone_url text,                         -- where the AI output is stored
  source_photo_url text,                     -- 1-year retention (see privacy.html §03)
  source_photo_deletes_at timestamptz,
  created_at timestamptz default now()
);
```

Reorder flow uses `archived_designs.id` to pre-fill a new cart item without re-running AI.

### `cart_items` (server cart for signed-in users)
```sql
create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  tag_id text not null,                      -- one-of-one ID
  shape text, color text, pet_name text, pet_phone text,
  svg_snapshot text,                         -- final-rendered SVG for thumbnail
  unit_price_cents integer,
  quantity integer default 1,
  archived_design_id uuid references archived_designs(id),  -- if reordered from archive
  added_at timestamptz default now()
);
```

## 8. API contract changes

### `/api/generate` — rate-limit key updates

| Caller state | Rate-limit key | Limits |
|---|---|---|
| **Signed in (preferred)** | `user_id` | 5 / hour, 15 / 24h (more generous than email) |
| **Guest** (only allowed if generate gate is bypassed somehow — e.g. legacy URL) | IP fallback | 5 / hour |

When auth gate is enforced (= every Generate click goes through sign-in modal first), guest generations should be **0 in normal flow**. Rate-limit by IP is purely defensive.

See [api-generate.md §3](api-generate.md) for full layered defense.

### New endpoints (backend to-do)

```
POST /api/cart/merge        # body: { items: [...] }  (guest cart on sign-in)
GET  /api/me                # current user profile
PUT  /api/me                # update profile (display name, newsletter opt-in)
GET  /api/me/orders         # list user's orders
GET  /api/me/orders/:id     # order details
GET  /api/me/designs        # archived designs
POST /api/me/reorder/:design_id  # create cart item from archived design
DELETE /api/me              # account deletion (CCPA / GDPR compliance)
```

All endpoints require Supabase auth header: `Authorization: Bearer <access_token>`.

## 9. Privacy alignment

[privacy.html](../privacy.html) needs a new section. Key points to disclose:

- **What account data we store**: email (mandatory); display name + avatar from OAuth providers (optional); newsletter consent state + timestamp
- **Supabase as data processor**: covered under our DPA with Supabase; data stored in Supabase US-East
- **OAuth providers as data sources**: Google / Apple share email + (optional) profile per scopes
- **Account deletion**: CCPA / GDPR right honored; `DELETE /api/me` cascades to orders (anonymized for tax compliance), designs (deleted), cart (deleted), Supabase user (deleted)

## 10. Error states & edge cases

| Scenario | Handling |
|---|---|
| OTP code expired / invalid | Inline error banner on the code-entry view; user can resend (30s cooldown) |
| OAuth provider error | Redirect to `/login.html?error=oauth_failed` |
| Sign-in modal shown but user cancels | Stage 2 customize panel preserved; user can try Generate again later |
| User signs in, then signs out mid-cart | Clear server cart UI, show localStorage cart (if any) |
| Email already exists when OAuth user has different displayName | Trust email as canonical; OAuth links to existing account |
| OTP requested on phone, verified on desktop (or vice versa) | Works — the code is just digits, not tied to device |
| Account deletion request | Email confirmation required; 30-day soft-delete grace period; then hard delete |

## 11. Security considerations

- OTP codes are 6 digits, single-use, **10-minute TTL** — Supabase managed
- Resend cooldown **30 seconds** to discourage email-bombing
- Session cookies marked `Secure`, `HttpOnly`, `SameSite=Lax` — Supabase managed when using SSR helpers
- All `/api/me/*` endpoints verify JWT — backend middleware
- Rate-limit on `signInWithEmailOtp` (5 / hour per email + 5 / hour per IP) to prevent email-bombing
- Never store passwords (we don't accept them)
- OAuth state parameter to prevent CSRF — Supabase managed

## 12. Testing scenarios

Manual QA checklist for v1 launch:

- [ ] Guest browses home → cart → checkout → places order (no sign-in required)
- [ ] Guest enters designer Stage 1 → 2, clicks Generate → sees auth modal
- [ ] Modal: enter email → 6-digit code email arrives → type code back into the same page → modal closes → generation fires
- [ ] "Remember me" ON → session persists across page reloads & 7 days
- [ ] "Remember me" OFF → session lives only while tab is open
- [ ] Modal: click "Continue with Google" → Google consent → returns to designer (remember-me preference applied)
- [ ] *(Deferred to v1.5)* Modal: click "Continue with Apple" → Apple consent → returns to designer
- [ ] Signed-in user adds cart item → signs out → cart preserved on this device (server cart cleared but localStorage takes over? or cleared entirely?) — **decide policy**
- [ ] Guest with non-empty localStorage cart signs in → cart merges to server
- [ ] Account page shows 0 orders (new user) and 0 designs
- [ ] After completing checkout, account page shows 1 order + 1 archived design
- [ ] Click a past design card → designer pre-populated → finish/engraving editable → Generate works
- [ ] Account → Sign out → both localStorage + sessionStorage cleared → home nav shows "Sign in"
- [ ] Privacy: account deletion works, all linked data removed (or anonymized for orders)

## 13. Frontend pages to add / modify

| File | Action |
|---|---|
| `auth-state.js` | **NEW** — shared auth wrapper |
| `login.html` | **NEW** — 2-state form (email → 6-digit code) + remember-me + OAuth |
| `auth-callback.html` | **NEW** — OAuth redirect target only (OTP verifies on login page) |
| `account.html` | **NEW** — orders + designs + sign out |
| `designer.html` / `designer-zh.html` | Remove D — Email section; add auth modal triggered on Generate |
| `index.html` / `index-zh.html` | Nav: "Sign in" link / signed-in user pill |
| `cart.html` | On sign-in event, merge localStorage cart to server |
| `checkout.html` | Pre-fill email + name when signed in; allow guest |
| `thank-you.html` | Add "View in Account" link if signed in |
| `privacy.html` | New section on account data |
| `chat-widget.js` / `docs/chat-bot.md` | New "Account & login" FAQ topic |

## 14. v1.5+ deferred

- Multi-device session sync (Supabase covers basic; we may add device-aware UX)
- 2FA (TOTP) for high-value accounts (decide based on fraud signals)
- Social account merging (e.g., user signs in with Google, later wants to add email-code too)
- Address book (multiple shipping addresses per user)
- Subscriptions (recurring orders for multi-dog families)

## 15. Open questions for ops / backend

- [ ] Supabase project: created in which region? (recommend `us-east-1` to match general AWS)
- [ ] Confirm Apple Developer account exists (required for Sign in with Apple)
- [ ] Confirm Google Cloud project exists for OAuth credentials
- [ ] DPA with Supabase signed?
- [ ] Email-from address for 6-digit codes (`auth@marlowe.example`?) — verify SPF/DKIM
- [ ] Account deletion grace period (30 days proposed) — legal review

---

## Changelog
- **2026-05-07** — Initial spec, v1 account system promoted from v1.5 backlog.
