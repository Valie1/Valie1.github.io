export type MediaConsent = "allowed" | "rejected" | null;

export const MEDIA_CONSENT_STORAGE_KEY = "valie-media-consent-v1";
export const MEDIA_CONSENT_CHANGE_EVENT = "valie:media-consent-change";
export const OPEN_COOKIE_SETTINGS_EVENT = "valie:open-cookie-settings";

export type StoredMediaConsent = {
  version: 1;
  media: Exclude<MediaConsent, null>;
  updatedAt: string;
};

function parseStoredConsent(raw: string | null): MediaConsent {
  if (!raw) return null;


  if (raw === "allowed" || raw === "rejected") return raw;

  try {
    const parsed = JSON.parse(raw) as Partial<StoredMediaConsent>;
    if (parsed?.version === 1 && (parsed.media === "allowed" || parsed.media === "rejected")) {
      return parsed.media;
    }
  } catch {

  }

  return null;
}

export function readMediaConsent(): MediaConsent {
  if (typeof window === "undefined") return null;
  try {
    return parseStoredConsent(window.localStorage.getItem(MEDIA_CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeMediaConsent(media: Exclude<MediaConsent, null>) {
  if (typeof window === "undefined") return;

  const payload: StoredMediaConsent = {
    version: 1,
    media,
    updatedAt: new Date().toISOString(),
  };

  try {
    window.localStorage.setItem(MEDIA_CONSENT_STORAGE_KEY, JSON.stringify(payload));
  } catch {

  }

  window.dispatchEvent(
    new CustomEvent<Exclude<MediaConsent, null>>(MEDIA_CONSENT_CHANGE_EVENT, { detail: media }),
  );
}

