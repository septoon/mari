export const COOKIE_CONSENT_STORAGE_KEY = 'mari.cookie-consent.v1';
export const COOKIE_CONSENT_EVENT = 'mari:cookie-consent-changed';

export type CookieConsentValue = 'accepted' | 'necessary';

let transientConsent: CookieConsentValue | null = null;

export const isCookieConsentValue = (value: unknown): value is CookieConsentValue =>
  value === 'accepted' || value === 'necessary';

export const readCookieConsent = (): CookieConsentValue | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (transientConsent) {
    return transientConsent;
  }
  try {
    const rawValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    return isCookieConsentValue(rawValue) ? rawValue : null;
  } catch {
    return null;
  }
};

export const writeCookieConsent = (value: CookieConsentValue) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
    transientConsent = null;
  } catch {
    // Keep the user's choice for this page when Safari denies persistent storage.
    transientConsent = value;
  }
  window.dispatchEvent(new CustomEvent<CookieConsentValue>(COOKIE_CONSENT_EVENT, { detail: value }));
};
