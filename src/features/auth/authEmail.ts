/**
 * Bridges the app's "username" login to Supabase Auth, which
 * requires an email identifier for password sign-in.
 *
 * Pure, deterministic function of username — no lookup table, no
 * network round-trip before calling Auth. Uniqueness is
 * guaranteed by the UNIQUE constraint on auth.users.email (and,
 * redundantly, on profiles.username).
 *
 * `.invalid` is reserved by IANA (RFC 2606) specifically to
 * guarantee it can never resolve to a real mail server — no risk
 * of this address accidentally being a real inbox.
 *
 * REQUIRED Supabase project settings (dashboard, not code):
 *   - "Enable email confirmations" → OFF (this address can never
 *     receive a confirmation email)
 *   - "Enable sign ups" → OFF (accounts are only ever created via
 *     the admin provisioning endpoint — not built yet in this
 *     stage, but the setting should already be off)
 *
 * IMPORTANT: this file is the single source of truth for the
 * username↔email mapping. Do not duplicate this logic anywhere
 * else (including the future provisioning endpoint) — import
 * from here instead.
 */

const AUTH_EMAIL_DOMAIN = 'wisuda-internal.invalid';

/** Username formatting rules — enforced wherever a username is accepted. */
const USERNAME_PATTERN = /^[a-z0-9._]{3,32}$/;

export function normalizeUsername(rawUsername: string): string {
  return rawUsername.trim().toLowerCase();
}

export function isValidUsernameFormat(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

export function usernameToAuthEmail(rawUsername: string): string {
  return `${normalizeUsername(rawUsername)}@${AUTH_EMAIL_DOMAIN}`;
}