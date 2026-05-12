/* MARLOWE — Auth State (shared wrapper)
 *
 * v1 MOCK mode: uses localStorage/sessionStorage as fake session store so the
 * entire auth UX flow can be built and tested before Supabase is wired up.
 *
 * v1 auth flow:
 *   1. Email OTP — user enters email, gets a 6-digit code, types it back.
 *      (Not a magic link — Magic Links add 30-60s of context switching that
 *       hurts US e-commerce conversion. OTP keeps users on the page.)
 *   2. Apple / Google OAuth — one-tap, redirects through auth-callback.html.
 *   3. Remember-me — default ON. 7-day session via localStorage. When OFF,
 *      session lives in sessionStorage (clears on browser close).
 *
 * To swap to real Supabase: replace the function bodies marked
 * "TODO BACKEND" with `supabase.auth.*` calls. No other file changes.
 *
 * See docs/auth.md for the full spec.
 */
(function () {
  'use strict';

  const STORAGE_KEY  = 'marlowe_auth_user';     // long-lived (remember me ON)
  const SESSION_KEY  = 'marlowe_auth_user';     // session-scoped (remember me OFF)
  const PENDING_KEY  = 'marlowe_auth_pending';  // mock OTP issuance + remember-me flag
  const REDIRECT_KEY = 'marlowe_auth_redirect_to';

  // Remember-me session lifetime (mock). Real Supabase refresh-token TTL is
  // controlled in dashboard; this is the analog for the mock layer.
  const REMEMBER_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  // OTP code expiry — matches what most US providers use.
  const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

  const subscribers = [];

  // Language-aware page routing. Pages set <html lang="zh"> for Chinese,
  // otherwise default to English. Used so auth redirects stay in-language.
  function isZh() {
    try { return (document.documentElement.lang || '').toLowerCase().startsWith('zh'); }
    catch (e) { return false; }
  }
  function pageFor(base) {
    // base e.g. "login.html" → "login-zh.html" when on a zh page
    return isZh() ? base.replace(/\.html$/, '-zh.html') : base;
  }

  // Read user from either localStorage (remember-me) or sessionStorage (session-only).
  function readUser() {
    try {
      // Prefer localStorage (long-lived); fall back to sessionStorage.
      const fromLocal = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (fromLocal) {
        // Check if remember-me TTL expired (mock-only; real Supabase handles via refresh tokens)
        if (fromLocal.expiresAt && Date.now() > fromLocal.expiresAt) {
          localStorage.removeItem(STORAGE_KEY);
          return null;
        }
        return fromLocal;
      }
      const fromSession = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
      return fromSession;
    } catch (e) { return null; }
  }
  function writeUser(user, rememberMe) {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      notify(null);
      return;
    }
    if (rememberMe) {
      user.expiresAt = Date.now() + REMEMBER_TTL_MS;
      user.rememberMe = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      user.rememberMe = false;
      delete user.expiresAt;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
      localStorage.removeItem(STORAGE_KEY);
    }
    notify(user);
  }
  function notify(user) {
    subscribers.forEach(cb => { try { cb(user); } catch (e) {} });
  }

  function genId() {
    return 'mock-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // ====================================================================
  // Public API
  // ====================================================================

  const MarloweAuth = {
    /**
     * @returns {object|null} { id, email, displayName?, avatarUrl?, provider, rememberMe, expiresAt? } or null
     */
    getUser() {
      return readUser();
    },

    /**
     * Send a 6-digit OTP code to the email.
     * MOCK: generates a code locally and stashes it; logs it to console so
     *       you can copy it during dev. UI also surfaces it on the code-entry view.
     *
     * TODO BACKEND: replace with
     *   await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
     *   (Without emailRedirectTo, Supabase sends a 6-digit OTP code instead of a link.)
     */
    async signInWithEmailOtp(email) {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: 'invalid_email' };
      }
      const code = String(Math.floor(100000 + Math.random() * 900000));
      localStorage.setItem(PENDING_KEY, JSON.stringify({
        email, code, at: Date.now(),
      }));
      console.info('[MarloweAuth mock] OTP code for', email, '→', code,
        '(real backend will email this code)');
      return { ok: true, email, mockCode: code };
    },

    /**
     * Verify a 6-digit OTP. On success, creates the session.
     * @param email
     * @param code 6-digit string
     * @param rememberMe whether to use 7-day localStorage session (default true)
     *
     * TODO BACKEND: replace with
     *   const { data, error } = await supabase.auth.verifyOtp({
     *     email, token: code, type: 'email'
     *   })
     */
    async verifyEmailOtp(email, code, rememberMe) {
      if (rememberMe === undefined) rememberMe = true;
      let pending = null;
      try { pending = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null'); }
      catch (e) {}
      if (!pending || pending.email !== email) return { error: 'no_pending' };
      if (Date.now() - pending.at > OTP_TTL_MS) {
        localStorage.removeItem(PENDING_KEY);
        return { error: 'expired' };
      }
      const cleanCode = String(code || '').replace(/\D/g, '');
      if (cleanCode !== pending.code) return { error: 'invalid_code' };
      const user = this._completeSignIn('email', email, rememberMe);
      return { ok: true, user };
    },

    /**
     * Resend OTP — generates a fresh 6-digit code.
     */
    async resendEmailOtp(email) {
      return this.signInWithEmailOtp(email);
    },

    /**
     * Trigger OAuth provider sign-in. Navigates away.
     * @param provider 'apple' | 'google'
     * @param rememberMe (default true). Stashed in sessionStorage for callback to read.
     *
     * TODO BACKEND: replace with
     *   await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: '<absolute-url>/auth-callback.html' }})
     */
    signInWithProvider(provider, rememberMe) {
      if (!['apple', 'google'].includes(provider)) return;
      if (rememberMe === undefined) rememberMe = true;
      // Remember-me preference must survive the OAuth round-trip.
      sessionStorage.setItem('marlowe_auth_remember', rememberMe ? '1' : '0');
      window.location.href = pageFor('auth-callback.html') + '?mock=' + encodeURIComponent(provider);
    },

    /**
     * Complete a sign-in. Internal helper — called by verifyEmailOtp
     * and by auth-callback.html (for OAuth round-trips).
     */
    _completeSignIn(provider, emailFromQuery, rememberMe) {
      let email = emailFromQuery;
      if (!email && provider === 'email') {
        try {
          const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null');
          if (pending) email = pending.email;
        } catch (e) {}
      }
      if (!email) {
        if (provider === 'apple')  email = 'demo.apple@privaterelay.appleid.com';
        else if (provider === 'google') email = 'demo.google@gmail.com';
        else email = 'demo@marlowe.example';
      }
      if (rememberMe === undefined) {
        // For OAuth callbacks, read the preference stashed before redirect.
        const stash = sessionStorage.getItem('marlowe_auth_remember');
        rememberMe = stash === null ? true : stash === '1';
      }
      sessionStorage.removeItem('marlowe_auth_remember');

      const user = {
        id: genId(),
        email,
        displayName: email.split('@')[0],
        avatarUrl: null,
        provider: provider === 'email' ? 'email_otp' : provider,
        signedInAt: new Date().toISOString(),
      };
      writeUser(user, !!rememberMe);
      localStorage.removeItem(PENDING_KEY);
      return user;
    },

    /**
     * Back-compat alias for the auth-callback.html mock=email path.
     * The new flow verifies OTP on the login page itself; this is kept so
     * an old `?mock=email&email=...` callback link still works during dev.
     */
    _mockCompleteSignIn(provider, emailFromQuery) {
      return this._completeSignIn(provider, emailFromQuery);
    },

    /**
     * Sign out and clear local session.
     *
     * TODO BACKEND: replace with await supabase.auth.signOut()
     */
    async signOut() {
      writeUser(null);
      localStorage.removeItem(PENDING_KEY);
      sessionStorage.removeItem('marlowe_auth_remember');
    },

    /**
     * Subscribe to auth state changes. Returns unsubscribe fn.
     */
    onAuthChange(callback) {
      subscribers.push(callback);
      // Fire immediately with current state
      try { callback(readUser()); } catch (e) {}
      return () => {
        const i = subscribers.indexOf(callback);
        if (i >= 0) subscribers.splice(i, 1);
      };
    },

    /**
     * Require auth on a page. If not signed in, stash current URL and redirect.
     */
    async requireAuth(redirectTo) {
      const user = readUser();
      if (user) return user;
      const after = redirectTo || (window.location.pathname + window.location.search);
      sessionStorage.setItem(REDIRECT_KEY, after);
      window.location.href = pageFor('login.html');
      throw new Error('not_authenticated');
    },

    /**
     * Save the page to return to after sign-in.
     * Used by auth-modal in designer.
     */
    setRedirectTarget(url) {
      sessionStorage.setItem(REDIRECT_KEY, url);
    },

    /**
     * Read + clear redirect target.
     */
    consumeRedirectTarget(fallback) {
      const target = sessionStorage.getItem(REDIRECT_KEY);
      sessionStorage.removeItem(REDIRECT_KEY);
      return target || fallback || pageFor('index.html');
    },
  };

  window.MarloweAuth = MarloweAuth;

  // Listen for cross-tab sign-in/out via storage events
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) notify(readUser());
  });

  // NOTE: nav auth-pill rendering is handled per-page (inline IIFE after
  // <script src="auth-state.js">) so pages keep full control over the
  // pill's markup, CSS, and i18n. See cart.html / index.html footer for
  // the standard pattern.
})();
