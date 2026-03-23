import { ns } from './namespace';

const SITE_ID = Object.freeze({
  CHATGPT: 'chatgpt',
  GEMINI: 'gemini',
  CLAUDE: 'claude',
  GENERIC: 'generic'
});

const HOST_TO_SITE = Object.freeze({
  'chatgpt.com': SITE_ID.CHATGPT,
  'chat.openai.com': SITE_ID.CHATGPT,
  'gemini.google.com': SITE_ID.GEMINI,
  'claude.ai': SITE_ID.CLAUDE
});

function normalizeHost(hostname: unknown): string {
  if (typeof hostname !== 'string') {
    return '';
  }
  return hostname.trim().toLowerCase();
}

function resolveSiteId(hostname: unknown): string {
  const normalizedHost = normalizeHost(hostname);
  return HOST_TO_SITE[normalizedHost as keyof typeof HOST_TO_SITE] || SITE_ID.GENERIC;
}

function isSupportedSite(siteId: string): boolean {
  return siteId === SITE_ID.CHATGPT || siteId === SITE_ID.GEMINI || siteId === SITE_ID.CLAUDE;
}

function resolveCurrentSiteId(locationRef: Location | null | undefined): string {
  const host = locationRef && typeof locationRef.hostname === 'string' ? locationRef.hostname : '';
  return resolveSiteId(host);
}

function createSiteApi(environment: { locationRef?: Location } = {}) {
  const locationRef = environment.locationRef || window.location;
  return {
    SITE_ID,
    resolveSiteId,
    isSupportedSite,
    getCurrentSiteId() {
      return resolveCurrentSiteId(locationRef);
    }
  };
}

const siteApi = createSiteApi();

ns.site = Object.assign({}, ns.site, siteApi, { createSiteApi });
window.ChatGptNav = ns;
