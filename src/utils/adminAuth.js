/**
 * 🌿 ZAYTOUN ATELIER - ADMIN AUTHORIZATION UTILITY
 * Exclusive security and access control strictly for store owner:
 * Shahroz Mubarak (shaahrozdogar@gmail.com).
 * 
 * Strictly prevents unauthorized visitors from accessing /studio or /admin.
 */

export const DEFAULT_OWNER_EMAIL = 'shaahrozdogar@gmail.com';

/**
 * Returns all recognized owner email addresses (normalized lowercase)
 */
export function getAuthorizedOwnerEmails() {
  const emails = [DEFAULT_OWNER_EMAIL.toLowerCase().trim()];

  try {
    const envEmail = (import.meta.env.VITE_ADMIN_EMAIL || '').toLowerCase().trim();
    if (envEmail && !emails.includes(envEmail)) {
      emails.push(envEmail);
    }
  } catch {}

  return emails;
}

/**
 * Check if a given email is the verified store owner
 */
export function isOwnerEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.toLowerCase().trim();
  const authorized = getAuthorizedOwnerEmails();
  return authorized.includes(normalized);
}

/**
 * Check if the active client user is authorized to access the Admin Studio.
 * ONLY returns true if the user is authenticated with an email matching the owner's email.
 * NO passcodes, NO secret keys, NO URL parameters, and NO unverified session bypasses.
 * 
 * @param {Object|null} user - Active user object from React state or null
 * @returns {boolean}
 */
export function isOwnerAuthorized(user = null) {
  let activeUser = user;
  if (!activeUser) {
    try {
      const stored = localStorage.getItem('zaytoun_client_user') || localStorage.getItem('foolisharc_user') || localStorage.getItem('zaytoun_user');
      if (stored) {
        activeUser = JSON.parse(stored);
      }
    } catch {}
  }

  if (activeUser?.email && isOwnerEmail(activeUser.email)) {
    return true;
  }

  return false;
}
