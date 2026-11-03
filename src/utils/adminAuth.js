/**
 * Browser profile data is never proof of owner access.
 * The Studio uses the server-verified JWT session in services/api.js.
 */
export function isOwnerAuthorized() {
  return false;
}
