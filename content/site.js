(() => {
  'use strict';

  const globalRef = window;
  const ns = globalRef.ChatGptNav || {};

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

  function normalizeHost(hostname) {
    if (typeof hostname !== 'string') {
      return '';
    }
    return hostname.trim().toLowerCase();
  }

  function resolveSiteId(hostname) {
    const normalizedHost = normalizeHost(hostname);
    return HOST_TO_SITE[normalizedHost] || SITE_ID.GENERIC;
  }

  function isSupportedSite(siteId) {
    return siteId === SITE_ID.CHATGPT || siteId === SITE_ID.GEMINI || siteId === SITE_ID.CLAUDE;
  }

  function resolveCurrentSiteId(locationRef) {
    const host = locationRef && typeof locationRef.hostname === 'string' ? locationRef.hostname : '';
    return resolveSiteId(host);
  }

  function createSiteApi(environment = {}) {
    const locationRef = environment.locationRef || globalRef.location;
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
  globalRef.ChatGptNav = ns;
  globalRef.JumpNavSite = Object.assign({}, globalRef.JumpNavSite, siteApi, { createSiteApi });
})();
