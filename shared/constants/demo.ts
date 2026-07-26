/**
 * Sentinel stored in the auth cookie by the demo login.
 *
 * It is deliberately not a JWT: a demo session never reaches the API — the API
 * client answers every request locally with empty payloads, so the whole app is
 * browsable while no real data is exposed.
 */
export const DEMO_SESSION_TOKEN = "demo-session";

export function isDemoToken(token: string | null | undefined): boolean {
  return token === DEMO_SESSION_TOKEN;
}
