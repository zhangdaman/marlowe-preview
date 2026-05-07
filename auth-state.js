/* MARLOWE — Auth State (shared wrapper)
 *
 * v1 MOCK mode: uses localStorage as fake session store so the entire
 * auth UX flow can be built and tested before Supabase is wired up.
 *
 * To swap to real Supabase: replace the function bodies marked
 * "TODO BACKEND" with `supabase.auth.*` calls. No other file changes.
 *
 * See docs/auth.md for the full spec.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'marlowe_auth_user';
  const PENDING_KEY = 'marlowe_auth_pending'; // for mock magic-link flow
  const REDIRECT_KEY = 'marlowe_auth_redirect_to';
  const subscribers = [];

  function readUser() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
    catch (e) { return null; }
  }
  function writeUser(user) {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
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
     * @returns {object|null} { id, email, displayName?, avatarUrl?, provider } or null
     */
    getUser() {
      return readUser();
    },

    /**
     * Trigger magic link to email.
     * MOCK: stashes pending email and returns success; user can "click" the
     * link by visiting auth-callback.html?mock=email&email=...
     *
     * TODO BACKEND: replace with
     *   await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: '<absolute-url>/auth-callback.html' }})
     */
    async signInWithMagicLink(email) {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { error: 'invalid_email' };
      }
      localStorage.setItem(PENDING_KEY, JSON.stringify({ email, at: Date.now() }));
      // In mock mode, don't actually send mail — just simulate success.
      console.info('[MarloweAuth mock] magic link "sent" to', email,
        '— to simulate clicking it, visit auth-callback.html?mock=email');
      return { ok: true, email };
    },

    /**
     * Trigger OAuth provider sign-in. Navigates away.
     * MOCK: redirects to auth-callback.html?mock=<provider>
     *
     * TODO BACKEND: replace with
     *   await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: '<absolute-url>/auth-callback.html' }})
     */
    signInWithProvider(provider) {
      if (!['apple', 'google'].includes(provider)) return;
      window.location.href = 'auth-callback.html?mock=' + encodeURIComponent(provider);
    },

    /**
     * Complete a sign-in. Called by auth-callback.html.
     * MOCK only — in real flow, Supabase SDK handles this in onAuthStateChange.
     */
    _mockCompleteSignIn(provider, emailFromQuery) {
      let email = emailFromQuery;
      if (!email && provider === 'email') {
        try {
          const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null');
          if (pending) email = pending.email;
        } catch (e) {}
      }
      if (!email) {
        if (provider === 'apple') email = 'demo.apple@privaterelay.appleid.com';
        else if (provider === 'google') email = 'demo.google@gmail.com';
        else email = 'demo@marlowe.example';
      }
      const user = {
        id: genId(),
        email,
        displayName: email.split('@')[0],
        avatarUrl: null,
        provider: provider === 'email' ? 'magic_link' : provider,
        signedInAt: new Date().toISOString(),
      };
      writeUser(user);
      localStorage.removeItem(PENDING_KEY);
      return user;
    },

    /**
     * Sign out and clear local session.
     *
     * TODO BACKEND: replace with await supabase.auth.signOut()
     */
    async signOut() {
      writeUser(null);
      localStorage.removeItem(PENDING_KEY);
      // In real flow Supabase clears its own keys too.
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
      window.location.href = 'login.html';
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
      return target || fallback || 'index.html';
    },
  };

  window.MarloweAuth = MarloweAuth;

  // Listen for cross-tab sign-in/out via storage events
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) notify(readUser());
  });
})();
