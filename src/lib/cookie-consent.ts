export const COOKIE_CONSENT_STORAGE_KEY = 'mari.cookie-consent.v1';
export const COOKIE_CONSENT_EVENT = 'mari:cookie-consent-changed';

export type CookieConsentValue = 'accepted' | 'necessary';

export const isCookieConsentValue = (value: unknown): value is CookieConsentValue =>
  value === 'accepted' || value === 'necessary';

export const readCookieConsent = (): CookieConsentValue | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  return isCookieConsentValue(rawValue) ? rawValue : null;
};

export const writeCookieConsent = (value: CookieConsentValue) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value);
  window.dispatchEvent(new CustomEvent<CookieConsentValue>(COOKIE_CONSENT_EVENT, { detail: value }));
};
