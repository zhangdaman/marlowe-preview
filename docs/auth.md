# Authentication & Account System Spec

> v1 promoted from v1.5 backlog (decided 2026-05-07). Marlowe is now an account-based DTC site with progressive sign-in: browse / cart guest-friendly, **generate requires sign-in**.

---

## 1. Decisions locked

| Decision | Choice | Rationale |
|---|---|---|
| **Sign-in pattern** | Progressive — browse + cart as guest; **Generate requires login** | Preserves first-touch conversion; uses Generate (the AI-cost moment) as account anchor |
| **Auth methods** | **Magic link** (primary) + **Apple OAuth** + **Google OAuth** | Magic link for inclusivity (no password to remember); OAuth for Apple/Google users (zero friction, plays nice with Apple Pay) |
| **Auth provider** | **Supabase Auth** | Free tier ≤ 50K MAU; built-in magic link + OAuth + session cookies; SDK handles browser side |
| **Password support** | **None** | Heritage brand; password-less is calmer, fewer support tickets |
| **Identity = email** | One account per email; OAuth-linked emails are the same account | Avoid duplicate accounts; matches privacy expectation |

## 2. Sign-in flow

### 2.1 Magic link (primary)

```
User clicks "Sign in" / triggers auth gate
    ↓
Modal/page: email input → "Send me a link"
    ↓
Supabase emails magic link to address
    ↓
User clicks link in email (opens Marlowe in browser)
    ↓
Supabase verifies token, sets session cookie
    ↓
Redirect to:
  - if user came from designer Generate → resume designer Stage 2
  - if user came from cart → resume cart
  - else → /account.html
```

Magic link TTL: **15 minutes** (Supabase default). Single-use.

### 2.2 OAuth (Apple / Google)

```
User clicks "Continue with Apple" or "Continue with Google"
    ↓
Redirect to Apple/Google consent screen
    ↓
User approves → callback to /auth-callback.html?code=...
    ↓
Supabase exchanges code for session, sets cookie
    ↓
Redirect to original page
```

OAuth scopes:
- **Google**: `email`, `profile` (display name + avatar URL)
- **Apple**: `email`, `name` (Apple Pay-friendly)

## 3. When sign-in is required

| Page / Action | Guest? | Notes |
|---|---|---|
| Home (`index.html` / `index-zh.html`) | ✅ | No gate; nav shows "Sign in" link |
| Designer Stage 1 (Upload) | ✅ | Photo upload allowed pre-login (sample chips and real photos) |
| Designer Stage 2 (Customize) | ✅ | Shape / finish / engraving — no gate |
| **Designer Generate button** | ❌ **Must be signed in** | Primary auth trigger. If guest clicks → modal with magic link + OAuth |
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
  // Read current user (null if not signed in)
  getUser(): { id, email, displayName?, avatarUrl?, provider } | null

  // Trigger magic link to email
  signInWithMagicLink(email): Promise<{ ok: true } | { error }>

  // Trigger OAuth flow (provider = 'apple' | 'google')
  signInWithProvider(provider): void  // navigates away

  // Sign out (clears session, redirects to /)
  signOut(): Promise<void>

  // Subscribe to auth state changes
  onAuthChange(callback): unsubscribe

  // Verify current session token (call on protected pages)
  requireAuth(redirectTo?): Promise<User>  // throws / redirects if not authed
};
```

In v1 dev/mock mode (before Supabase keys are wired), this file uses `localStorage` as a fake session store. To swap to real Supabase: replace function bodies with `supabase.auth.*` calls, no other file changes.

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
| Magic link expired / invalid | Redirect to `/login.html?error=expired`, show "Link expired, request a new one" |
| OAuth provider error | Redirect to `/login.html?error=oauth_failed` |
| Sign-in modal shown but user cancels | Stage 2 customize panel preserved; user can try Generate again later |
| User signs in, then signs out mid-cart | Clear server cart UI, show localStorage cart (if any) |
| Email already exists when OAuth user has different displayName | Trust email as canonical; OAuth links to existing account |
| Magic link clicked on different device | Supabase handles via cross-device session; user lands on Marlowe with active session |
| Account deletion request | Email confirmation required; 30-day soft-delete grace period; then hard delete |

## 11. Security considerations

- Magic link tokens are single-use, 15-min TTL — Supabase managed
- Session cookies marked `Secure`, `HttpOnly`, `SameSite=Lax` — Supabase managed when using SSR helpers
- All `/api/me/*` endpoints verify JWT — backend middleware
- Rate-limit on `signInWithMagicLink` (5 / hour per email + 5 / hour per IP) to prevent email-bombing
- Never store passwords (we don't accept them)
- OAuth state parameter to prevent CSRF — Supabase managed

## 12. Testing scenarios

Manual QA checklist for v1 launch:

- [ ] Guest browses home → cart → checkout → places order (no sign-in required)
- [ ] Guest enters designer Stage 1 → 2, clicks Generate → sees auth modal
- [ ] Modal: enter email → "Check your inbox" state shown → click magic link in email → returns to designer Stage 2 with state preserved → generates portrait
- [ ] Modal: click "Continue with Google" → Google consent → returns to designer
- [ ] Modal: click "Continue with Apple" → Apple consent → returns to designer
- [ ] Signed-in user adds cart item → signs out → cart preserved on this device (server cart cleared but localStorage takes over? or cleared entirely?) — **decide policy**
- [ ] Guest with non-empty localStorage cart signs in → cart merges to server
- [ ] Account page shows 0 orders (new user) and 0 designs
- [ ] After completing checkout, account page shows 1 order + 1 archived design
- [ ] Click "Reorder" on archived design → cart populated → checkout works
- [ ] Account → Sign out → localStorage cleared → home page nav shows "Sign in"
- [ ] Privacy: account deletion works, all linked data removed (or anonymized for orders)

## 13. Frontend pages to add / modify

| File | Action |
|---|---|
| `auth-state.js` | **NEW** — shared auth wrapper |
| `login.html` | **NEW** — magic link form + OAuth buttons + check-your-inbox state |
| `auth-callback.html` | **NEW** — OAuth redirect target; sets session, redirects |
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
- Social account merging (e.g., user signs in with Google, later wants to add magic-link too)
- Address book (multiple shipping addresses per user)
- Subscriptions (recurring orders for multi-dog families)

## 15. Open questions for ops / backend

- [ ] Supabase project: created in which region? (recommend `us-east-1` to match general AWS)
- [ ] Confirm Apple Developer account exists (required for Sign in with Apple)
- [ ] Confirm Google Cloud project exists for OAuth credentials
- [ ] DPA with Supabase signed?
- [ ] Email-from address for magic link (`auth@marlowe.example`?) — verify SPF/DKIM
- [ ] Account deletion grace period (30 days proposed) — legal review

---

## Changelog
- **2026-05-07** — Initial spec, v1 account system promoted from v1.5 backlog.
