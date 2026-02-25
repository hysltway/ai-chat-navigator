(() => {
  'use strict';

  const ns = window.ChatGptNav;

  let state;
  let THEME_ATTRIBUTE_FILTER;
  let THEME_TRANSITION_STYLE_ID;
  let THEME_TRANSITION_DURATION_MS;
  let THEME_TRANSITION_EASING;

  function initThemeApi(ctx) {
    ({
      state,
      THEME_ATTRIBUTE_FILTER,
      THEME_TRANSITION_STYLE_ID,
      THEME_TRANSITION_DURATION_MS,
      THEME_TRANSITION_EASING
    } = ctx);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function initThemeTracking() {
    syncColorScheme(true);
    if (state.themeObserver) {
      state.themeObserver.disconnect();
    }
    state.themeObserver = new MutationObserver(() => {
      scheduleThemeSync();
    });
    refreshThemeTrackingTargets();

    if (typeof window.matchMedia !== 'function') {
      return;
    }
    if (state.themeMql && state.themeMqlHandler) {
      removeThemeMediaListener(state.themeMql, state.themeMqlHandler);
    }
    state.themeMql = window.matchMedia('(prefers-color-scheme: dark)');
    state.themeMqlHandler = () => {
      scheduleThemeSync();
    };
    addThemeMediaListener(state.themeMql, state.themeMqlHandler);
  }

  function refreshThemeTrackingTargets() {
    if (!state.themeObserver) {
      return;
    }
    state.themeObserver.disconnect();
    if (document.documentElement) {
      state.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: THEME_ATTRIBUTE_FILTER
      });
    }
    if (document.body) {
      state.themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: THEME_ATTRIBUTE_FILTER
      });
    }
  }

  function scheduleThemeSync() {
    if (state.themeRaf) {
      return;
    }
    state.themeRaf = window.requestAnimationFrame(() => {
      state.themeRaf = null;
      syncColorScheme();
    });
  }

  function syncColorScheme(force = false) {
    if (!state.ui) {
      return;
    }
    const nextScheme = detectSiteColorScheme();
    if (!force && nextScheme === state.colorScheme) {
      return;
    }
    state.colorScheme = nextScheme;
    if (ns.ui.setColorScheme) {
      ns.ui.setColorScheme(state.ui, nextScheme);
    }
  }

  function handleThemeToggle(event) {
    const trigger = event && event.currentTarget ? event.currentTarget : state.ui && state.ui.themeToggle;
    const currentScheme = detectSiteColorScheme();
    const nextScheme = currentScheme === 'dark' ? 'light' : 'dark';

    runThemeToggleTransition(trigger, () => {
      applySiteTheme(nextScheme);
      syncColorScheme(true);
    }).finally(() => {
      scheduleThemeSync();
    });
  }

  async function runThemeToggleTransition(triggerNode, applyTheme) {
    if (typeof applyTheme !== 'function') {
      return false;
    }

    ensureThemeTransitionStyles();

    const origin = getThemeTransitionOrigin(triggerNode);
    const root = document.documentElement;
    root.style.setProperty('--chatgpt-nav-theme-x', `${origin.x}px`);
    root.style.setProperty('--chatgpt-nav-theme-y', `${origin.y}px`);

    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canAnimate = typeof document.startViewTransition === 'function' && !prefersReducedMotion;

    if (!canAnimate) {
      applyTheme();
      return false;
    }

    try {
      const transition = document.startViewTransition(() => {
        applyTheme();
      });

      transition.ready
        .then(() => {
          const maxRadius = getThemeTransitionRadius(origin.x, origin.y);
          root.animate(
            {
              clipPath: [
                `circle(0px at ${origin.x}px ${origin.y}px)`,
                `circle(${maxRadius}px at ${origin.x}px ${origin.y}px)`
              ]
            },
            {
              duration: THEME_TRANSITION_DURATION_MS,
              easing: THEME_TRANSITION_EASING,
              pseudoElement: '::view-transition-new(root)',
              fill: 'forwards'
            }
          );
        })
        .catch(() => {});

      await transition.finished.catch(() => {});
      return true;
    } catch (error) {
      applyTheme();
      return false;
    }
  }

  function getThemeTransitionOrigin(triggerNode) {
    const fallbackX = Math.max(12, window.innerWidth - 24);
    const fallbackY = 24;

    if (!triggerNode || typeof triggerNode.getBoundingClientRect !== 'function') {
      return { x: fallbackX, y: fallbackY };
    }

    const rect = triggerNode.getBoundingClientRect();
    if (!rect || !Number.isFinite(rect.left) || !Number.isFinite(rect.top)) {
      return { x: fallbackX, y: fallbackY };
    }

    return {
      x: clamp(rect.left + rect.width / 2, 0, window.innerWidth),
      y: clamp(rect.top + rect.height / 2, 0, window.innerHeight)
    };
  }

  function getThemeTransitionRadius(x, y) {
    const maxX = Math.max(x, window.innerWidth - x);
    const maxY = Math.max(y, window.innerHeight - y);
    return Math.hypot(maxX, maxY);
  }

  function ensureThemeTransitionStyles() {
    if (document.getElementById(THEME_TRANSITION_STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = THEME_TRANSITION_STYLE_ID;
    style.textContent = `
    ::view-transition-old(root),
    ::view-transition-new(root) {
      animation: none;
      mix-blend-mode: normal;
    }

    ::view-transition-new(root) {
      clip-path: circle(0px at var(--chatgpt-nav-theme-x, 50%) var(--chatgpt-nav-theme-y, 50%));
    }
  `;
    document.head.appendChild(style);
  }

  function applySiteTheme(targetScheme) {
    const mode = targetScheme === 'dark' ? 'dark' : 'light';
    const adapterId = state.adapter ? state.adapter.id : '';

    if (adapterId === 'gemini') {
      applyGeminiTheme(mode);
      return;
    }
    if (adapterId === 'claude') {
      applyClaudeTheme(mode);
      return;
    }
    applyChatGptTheme(mode);
  }

  function applyChatGptTheme(mode) {
    try {
      window.localStorage.setItem('theme', mode);
    } catch (error) {
      // Ignore storage failures.
    }

    if (document.documentElement && document.documentElement.classList) {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(mode);
      document.documentElement.style.colorScheme = mode;
    }
    if (document.body) {
      document.body.style.colorScheme = mode;
    }

    dispatchStorageChange('theme', mode);
  }

  function applyGeminiTheme(mode) {
    const themeValue = mode === 'dark' ? 'Bard-Dark-Theme' : 'Bard-Light-Theme';
    try {
      window.localStorage.setItem('Bard-Color-Theme', themeValue);
    } catch (error) {
      // Ignore storage failures.
    }

    if (document.body) {
      document.body.classList.toggle('dark-theme', mode === 'dark');
      document.body.classList.toggle('light-theme', mode === 'light');
      document.body.style.colorScheme = mode;
    }
    if (document.documentElement) {
      document.documentElement.style.colorScheme = mode;
    }

    dispatchStorageChange('Bard-Color-Theme', themeValue);
  }

  function applyClaudeTheme(mode) {
    try {
      window.localStorage.setItem('theme', mode);
    } catch (error) {
      // Ignore storage failures.
    }

    if (document.documentElement) {
      document.documentElement.setAttribute('data-mode', mode);
      document.documentElement.style.colorScheme = mode;
    }
    if (document.body) {
      document.body.style.colorScheme = mode;
    }

    dispatchStorageChange('theme', mode);
  }

  function dispatchStorageChange(key, newValue) {
    try {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key,
          newValue,
          storageArea: window.localStorage
        })
      );
    } catch (error) {
      // Ignore environments where StorageEvent cannot be constructed.
    }
  }

  function detectSiteColorScheme() {
    const adapterId = state.adapter ? state.adapter.id : '';
    if (adapterId === 'chatgpt') {
      return detectChatGptColorScheme() || 'light';
    }
    if (adapterId === 'gemini') {
      return detectGeminiColorScheme() || 'light';
    }
    if (adapterId === 'claude') {
      return detectClaudeColorScheme() || 'light';
    }
    return 'light';
  }

  function detectChatGptColorScheme() {
    const root = document.documentElement;
    if (!root || !root.classList) {
      return null;
    }
    if (root.classList.contains('dark')) {
      return 'dark';
    }
    if (root.classList.contains('light')) {
      return 'light';
    }
    return null;
  }

  function detectGeminiColorScheme() {
    const body = document.body;
    if (!body) {
      return null;
    }

    if (body.classList.contains('dark-theme')) {
      return 'dark';
    }
    if (body.classList.contains('light-theme')) {
      return 'light';
    }

    if (typeof window.getComputedStyle !== 'function') {
      return null;
    }
    try {
      const style = window.getComputedStyle(body);
      const colorScheme = style.colorScheme || style.getPropertyValue('color-scheme');
      if (typeof colorScheme !== 'string') {
        return null;
      }
      const value = colorScheme.trim().toLowerCase();
      if (!value) {
        return null;
      }
      if (value.includes('dark')) {
        return 'dark';
      }
      if (value.includes('light')) {
        return 'light';
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  function detectClaudeColorScheme() {
    const root = document.documentElement;
    if (root && typeof root.getAttribute === 'function') {
      const dataMode = root.getAttribute('data-mode');
      if (dataMode === 'dark' || dataMode === 'light') {
        return dataMode;
      }
    }

    if (root && root.classList) {
      if (root.classList.contains('dark')) {
        return 'dark';
      }
      if (root.classList.contains('light')) {
        return 'light';
      }
    }

    try {
      const saved = window.localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch (error) {
      // Ignore storage failures.
    }

    if (typeof window.getComputedStyle === 'function' && root) {
      try {
        const style = window.getComputedStyle(root);
        const colorScheme = style.colorScheme || style.getPropertyValue('color-scheme');
        if (typeof colorScheme === 'string') {
          const value = colorScheme.trim().toLowerCase();
          if (value.includes('dark')) {
            return 'dark';
          }
          if (value.includes('light')) {
            return 'light';
          }
        }
      } catch (error) {
        return null;
      }
    }

    return null;
  }

  function addThemeMediaListener(mql, handler) {
    if (!mql || !handler) {
      return;
    }
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler);
      return;
    }
    if (typeof mql.addListener === 'function') {
      mql.addListener(handler);
    }
  }

  function removeThemeMediaListener(mql, handler) {
    if (!mql || !handler) {
      return;
    }
    if (typeof mql.removeEventListener === 'function') {
      mql.removeEventListener('change', handler);
      return;
    }
    if (typeof mql.removeListener === 'function') {
      mql.removeListener(handler);
    }
  }


  ns.coreTheme = {
    initThemeApi,
    initThemeTracking,
    refreshThemeTrackingTargets,
    scheduleThemeSync,
    syncColorScheme,
    handleThemeToggle
  };
})();
