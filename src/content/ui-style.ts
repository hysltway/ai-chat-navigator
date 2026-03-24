
  import { ns } from './namespace';
  const THEME_SITE_KEYS = new Set(['chatgpt', 'gemini', 'claude', 'generic']);
  const DARK_SELECTORS = {
    chatgpt: 'html.dark',
    gemini: 'body.dark-theme',
    claude: 'html[data-mode="dark"], html.dark'
  };

  const NAV_LIGHT_BASE = {
    '--nav-bg': '#f9f9f9',
    '--nav-surface': '#f9f9f9',
    '--nav-border': '#efefef',
    '--nav-text': '#1f1f1f',
    '--nav-muted': '#666666',
    '--nav-accent': '#efefef',
    '--nav-accent-strong': '#1f1f1f',
    '--nav-hover': '#efefef',
    '--nav-accent-shadow': 'rgba(0, 0, 0, 0.06)',
    '--nav-item-bg': '#f4f4f4',
    '--nav-item-hover-bg': '#efefef',
    '--nav-item-active-bg': '#eaeaea',
    '--nav-item-hover-border': '#efefef',
    '--nav-item-active-border': '#eaeaea',
    '--nav-item-active-text': '#1f1f1f',
    '--nav-item-indicator-color': '#1f1f1f',
    '--nav-item-active-color': '#1f1f1f',
    '--nav-item-active-shadow': 'rgba(0, 0, 0, 0.06)',
    '--nav-control-hover-border': '#efefef',
    '--nav-control-hover-text': '#1f1f1f',
    '--nav-control-active-border': '#eaeaea',
    '--nav-control-active-bg': '#eaeaea',
    '--nav-control-active-text': '#1f1f1f',
    '--nav-shadow': '0 18px 42px rgba(23, 21, 16, 0.16)',
    '--nav-button-bg': '#f9f9f9',
    '--nav-active-text': '#1f1f1f',
    '--nav-scrollbar-size': '10px',
    '--nav-scrollbar-track': 'rgba(31, 31, 31, 0.06)',
    '--nav-scrollbar-thumb': 'rgba(31, 31, 31, 0.22)',
    '--nav-scrollbar-thumb-hover': 'rgba(31, 31, 31, 0.34)',
    '--nav-scrollbar-thumb-active': 'rgba(31, 31, 31, 0.44)',
    '--nav-panel-offset': '88px',
    '--nav-panel-max-height': 'calc(100vh - 176px)'
  };

  const NAV_LIGHT_SITE_OVERRIDES = {
    chatgpt: {},
    gemini: {
      '--nav-bg': '#f3f6fc',
      '--nav-surface': '#f3f6fc',
      '--nav-border': '#dce1e9',
      '--nav-text': '#1f2a3d',
      '--nav-muted': '#546377',
      '--nav-accent': '#dce1e9',
      '--nav-accent-strong': '#0842a0',
      '--nav-hover': '#dce1e9',
      '--nav-item-bg': '#e9eef6',
      '--nav-item-hover-bg': '#dce1e9',
      '--nav-item-active-bg': '#d3e3fd',
      '--nav-item-hover-border': '#dce1e9',
      '--nav-item-active-border': '#d3e3fd',
      '--nav-item-active-text': '#0842a0',
      '--nav-item-indicator-color': '#0842a0',
      '--nav-item-active-color': '#0842a0',
      '--nav-item-active-shadow': 'rgba(8, 66, 160, 0.16)',
      '--nav-control-hover-border': '#dce1e9',
      '--nav-control-hover-text': '#0842a0',
      '--nav-control-active-border': '#d3e3fd',
      '--nav-control-active-bg': '#d3e3fd',
      '--nav-control-active-text': '#0842a0',
      '--nav-button-bg': '#f3f6fc'
    },
    claude: {
      '--nav-bg': '#faf9f5',
      '--nav-surface': '#faf9f5',
      '--nav-border': '#e7e1d5',
      '--nav-text': '#2f2923',
      '--nav-muted': '#756c60',
      '--nav-accent': '#f0eee6',
      '--nav-accent-strong': '#d97757',
      '--nav-hover': '#f0eee6',
      '--nav-accent-shadow': 'rgba(217, 119, 87, 0.2)',
      '--nav-item-bg': '#f7f4ec',
      '--nav-item-hover-bg': '#f0eee6',
      '--nav-item-active-bg': '#eae4d8',
      '--nav-item-hover-border': '#e7e1d5',
      '--nav-item-active-border': '#d97757',
      '--nav-item-active-text': '#c6613f',
      '--nav-item-indicator-color': '#c6613f',
      '--nav-item-active-color': '#c6613f',
      '--nav-item-active-shadow': 'rgba(198, 97, 63, 0.18)',
      '--nav-control-hover-border': '#d97757',
      '--nav-control-hover-text': '#d97757',
      '--nav-control-active-border': '#c6613f',
      '--nav-control-active-bg': '#f0eee6',
      '--nav-control-active-text': '#c6613f',
      '--nav-button-bg': '#faf9f5'
    },
    generic: {}
  };

  const NAV_DARK_OVERRIDES = {
    '--nav-bg': '#121417',
    '--nav-surface': '#181b1f',
    '--nav-border': '#2f343a',
    '--nav-text': '#e7eaee',
    '--nav-muted': '#a4adb7',
    '--nav-accent': '#2a3037',
    '--nav-accent-strong': '#c9d0d8',
    '--nav-hover': '#242a31',
    '--nav-accent-shadow': 'rgba(170, 178, 187, 0.18)',
    '--nav-item-bg': '#21262c',
    '--nav-item-hover-bg': '#2a3037',
    '--nav-item-active-bg': '#303740',
    '--nav-item-hover-border': '#4a545f',
    '--nav-item-active-border': '#66727d',
    '--nav-item-active-text': '#f1f4f7',
    '--nav-item-indicator-color': '#d3d9e0',
    '--nav-item-active-color': '#e5eaf0',
    '--nav-item-active-shadow': 'rgba(10, 12, 15, 0.38)',
    '--nav-control-hover-border': '#4f5964',
    '--nav-control-hover-text': '#e1e6eb',
    '--nav-control-active-border': '#6d7883',
    '--nav-control-active-bg': 'rgba(160, 169, 178, 0.18)',
    '--nav-control-active-text': '#f1f4f7',
    '--nav-shadow': '0 20px 48px rgba(3, 8, 17, 0.58), 0 2px 10px rgba(3, 8, 17, 0.35)',
    '--nav-button-bg': '#22272e',
    '--nav-active-text': '#f0f4f8',
    '--nav-scrollbar-track': 'rgba(232, 236, 241, 0.1)',
    '--nav-scrollbar-thumb': 'rgba(232, 236, 241, 0.34)',
    '--nav-scrollbar-thumb-hover': 'rgba(232, 236, 241, 0.48)',
    '--nav-scrollbar-thumb-active': 'rgba(232, 236, 241, 0.62)'
  };

  const FORMULA_THEME_BY_SITE = {
    chatgpt: {
      light: {
        outline: 'rgba(31, 31, 31, 0.34)',
        ring: 'rgba(31, 31, 31, 0.1)',
        hoverBg: '#F4F4F4',
        activeBg: '#F4F4F4',
        toastBg: 'rgba(249, 249, 249, 0.97)',
        toastText: '#1f1f1f',
        toastBorder: 'rgba(31, 31, 31, 0.16)',
        toastShadow: 'rgba(23, 21, 16, 0.2)'
      },
      dark: {
        outline: 'rgba(211, 217, 224, 0.58)',
        ring: 'rgba(211, 217, 224, 0.2)',
        hoverBg: 'rgba(232, 236, 241, 0.14)',
        activeBg: 'rgba(232, 236, 241, 0.2)',
        toastBg: 'rgba(24, 27, 31, 0.95)',
        toastText: '#f1f4f7',
        toastBorder: 'rgba(109, 120, 131, 0.72)',
        toastShadow: 'rgba(3, 8, 17, 0.45)'
      }
    },
    gemini: {
      light: {
        outline: 'rgba(8, 66, 160, 0.52)',
        ring: 'rgba(8, 66, 160, 0.18)',
        hoverBg: '#E9EEF6',
        activeBg: '#E9EEF6',
        toastBg: 'rgba(243, 246, 252, 0.97)',
        toastText: '#1f2a3d',
        toastBorder: 'rgba(8, 66, 160, 0.3)',
        toastShadow: 'rgba(8, 66, 160, 0.22)'
      },
      dark: {
        outline: 'rgba(138, 180, 248, 0.66)',
        ring: 'rgba(138, 180, 248, 0.25)',
        hoverBg: 'rgba(138, 180, 248, 0.16)',
        activeBg: 'rgba(138, 180, 248, 0.26)',
        toastBg: 'rgba(27, 36, 51, 0.95)',
        toastText: '#e8f0fe',
        toastBorder: 'rgba(138, 180, 248, 0.46)',
        toastShadow: 'rgba(15, 23, 42, 0.44)'
      }
    },
    claude: {
      light: {
        outline: 'rgba(198, 97, 63, 0.52)',
        ring: 'rgba(217, 119, 87, 0.2)',
        hoverBg: '#F0EEE6',
        activeBg: '#F0EEE6',
        toastBg: 'rgba(250, 249, 245, 0.97)',
        toastText: '#2f2923',
        toastBorder: 'rgba(217, 119, 87, 0.38)',
        toastShadow: 'rgba(198, 97, 63, 0.22)'
      },
      dark: {
        outline: 'rgba(244, 162, 132, 0.68)',
        ring: 'rgba(244, 162, 132, 0.29)',
        hoverBg: 'rgba(244, 162, 132, 0.16)',
        activeBg: 'rgba(244, 162, 132, 0.24)',
        toastBg: 'rgba(40, 34, 30, 0.95)',
        toastText: '#f5ede5',
        toastBorder: 'rgba(244, 162, 132, 0.52)',
        toastShadow: 'rgba(15, 12, 10, 0.44)'
      }
    },
    generic: {
      light: {
        outline: 'rgba(37, 99, 235, 0.5)',
        ring: 'rgba(37, 99, 235, 0.18)',
        hoverBg: 'rgba(191, 219, 254, 0.46)',
        activeBg: 'rgba(147, 197, 253, 0.52)',
        toastBg: 'rgba(248, 250, 252, 0.97)',
        toastText: '#1e293b',
        toastBorder: 'rgba(37, 99, 235, 0.28)',
        toastShadow: 'rgba(30, 41, 59, 0.18)'
      },
      dark: {
        outline: 'rgba(147, 197, 253, 0.68)',
        ring: 'rgba(147, 197, 253, 0.24)',
        hoverBg: 'rgba(147, 197, 253, 0.16)',
        activeBg: 'rgba(147, 197, 253, 0.24)',
        toastBg: 'rgba(15, 23, 42, 0.95)',
        toastText: '#e2e8f0',
        toastBorder: 'rgba(147, 197, 253, 0.42)',
        toastShadow: 'rgba(2, 6, 23, 0.46)'
      }
    }
  };

  function normalizeThemeSite(site) {
    if (typeof site !== 'string') {
      return 'generic';
    }
    return THEME_SITE_KEYS.has(site) ? site : 'generic';
  }

  function normalizeThemeScheme(scheme) {
    return scheme === 'dark' ? 'dark' : 'light';
  }

  function createNavTheme(site, scheme) {
    const safeSite = normalizeThemeSite(site);
    const safeScheme = normalizeThemeScheme(scheme);
    const baseTheme = safeScheme === 'dark' ? NAV_DARK_OVERRIDES : NAV_LIGHT_BASE;
    const siteOverrides = safeScheme === 'dark' ? {} : NAV_LIGHT_SITE_OVERRIDES[safeSite] || {};
    return {
      ...(safeScheme === 'dark' ? NAV_LIGHT_BASE : {}),
      ...baseTheme,
      ...siteOverrides
    };
  }

  function createFormulaTheme(site, scheme) {
    const safeSite = normalizeThemeSite(site);
    const safeScheme = normalizeThemeScheme(scheme);
    const siteTheme = FORMULA_THEME_BY_SITE[safeSite] || FORMULA_THEME_BY_SITE.generic;
    return siteTheme[safeScheme] || FORMULA_THEME_BY_SITE.generic[safeScheme];
  }

  const UI_THEME_PRESETS = {
    chatgpt: {
      light: { nav: createNavTheme('chatgpt', 'light'), formula: createFormulaTheme('chatgpt', 'light') },
      dark: { nav: createNavTheme('chatgpt', 'dark'), formula: createFormulaTheme('chatgpt', 'dark') }
    },
    gemini: {
      light: { nav: createNavTheme('gemini', 'light'), formula: createFormulaTheme('gemini', 'light') },
      dark: { nav: createNavTheme('gemini', 'dark'), formula: createFormulaTheme('gemini', 'dark') }
    },
    claude: {
      light: { nav: createNavTheme('claude', 'light'), formula: createFormulaTheme('claude', 'light') },
      dark: { nav: createNavTheme('claude', 'dark'), formula: createFormulaTheme('claude', 'dark') }
    },
    generic: {
      light: { nav: createNavTheme('generic', 'light'), formula: createFormulaTheme('generic', 'light') },
      dark: { nav: createNavTheme('generic', 'dark'), formula: createFormulaTheme('generic', 'dark') }
    }
  };

  function getUiThemePreset(site, scheme) {
    const safeSite = normalizeThemeSite(site);
    const safeScheme = normalizeThemeScheme(scheme);
    const sitePreset = UI_THEME_PRESETS[safeSite] || UI_THEME_PRESETS.generic;
    return sitePreset[safeScheme] || sitePreset.light;
  }

  function buildFormulaThemeConfig() {
    const presets = {};
    Object.keys(UI_THEME_PRESETS).forEach((site) => {
      const sitePreset = UI_THEME_PRESETS[site];
      presets[site] = {
        light: sitePreset.light.formula,
        dark: sitePreset.dark.formula
      };
    });
    return {
      presets,
      darkSelectors: DARK_SELECTORS
    };
  }

  ns.UI_THEME_PRESETS = UI_THEME_PRESETS;
  ns.UI_THEME_DARK_SELECTORS = DARK_SELECTORS;
  ns.UI_NAV_THEME_VAR_KEYS = Object.keys(NAV_LIGHT_BASE);
  ns.getUiThemePreset = getUiThemePreset;
  ns.UI_FORMULA_THEME = buildFormulaThemeConfig();
  ns.UI_STYLE_TEXT = `

      .nav-root, .nav-root * {
        box-sizing: border-box;
      }

      .nav-root {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        pointer-events: none;
        --nav-bg: #f9f9f9;
        --nav-surface: #f9f9f9;
        --nav-border: #efefef;
        --nav-text: #1f1f1f;
        --nav-muted: #666666;
        --nav-accent: #efefef;
        --nav-accent-strong: #1f1f1f;
        --nav-hover: #efefef;
        --nav-accent-shadow: rgba(0, 0, 0, 0.06);
        --nav-item-bg: #f4f4f4;
        --nav-item-hover-bg: #efefef;
        --nav-item-active-bg: #eaeaea;
        --nav-item-hover-border: #efefef;
        --nav-item-active-border: #eaeaea;
        --nav-item-active-text: #1f1f1f;
        --nav-item-indicator-color: #1f1f1f;
        --nav-item-active-color: #1f1f1f;
        --nav-item-active-shadow: rgba(0, 0, 0, 0.06);
        --nav-control-hover-border: #efefef;
        --nav-control-hover-text: #1f1f1f;
        --nav-control-active-border: #eaeaea;
        --nav-control-active-bg: #eaeaea;
        --nav-control-active-text: #1f1f1f;
        --nav-shadow: 0 18px 42px rgba(23, 21, 16, 0.16);
        --nav-button-bg: #f9f9f9;
        --nav-active-text: #1f1f1f;
        --nav-scrollbar-size: 10px;
        --nav-scrollbar-track: rgba(31, 31, 31, 0.06);
        --nav-scrollbar-thumb: rgba(31, 31, 31, 0.22);
        --nav-scrollbar-thumb-hover: rgba(31, 31, 31, 0.34);
        --nav-scrollbar-thumb-active: rgba(31, 31, 31, 0.44);
        --nav-panel-offset: 88px;
        --nav-panel-max-height: calc(100vh - 176px);
        --nav-ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
        --nav-ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
        --nav-ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
        --nav-feedback-duration: 160ms;
        --nav-surface-duration: 260ms;
        --nav-panel-enter-duration: 420ms;
        --nav-panel-exit-duration: 240ms;
        font-family: "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif;
      }

      .nav-root[data-visible="0"] {
        display: none;
      }

      @keyframes nav-panel-enter {
        from {
          opacity: 0;
          transform: translate3d(0, 14px, 0) scale(0.985);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
      }

      @keyframes nav-panel-section-enter {
        from {
          opacity: 0;
          transform: translate3d(0, 10px, 0);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }

      @keyframes nav-fab-enter {
        from {
          opacity: 0;
          transform: translate3d(0, 10px, 0) scale(0.92);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0) scale(1);
        }
      }

      .nav-root[data-color-scheme="light"][data-site="chatgpt"] {
        --nav-bg: #f9f9f9;
        --nav-surface: #f9f9f9;
        --nav-border: #efefef;
        --nav-text: #1f1f1f;
        --nav-muted: #666666;
        --nav-accent: #efefef;
        --nav-accent-strong: #1f1f1f;
        --nav-hover: #efefef;
        --nav-item-bg: #f4f4f4;
        --nav-item-hover-bg: #efefef;
        --nav-item-active-bg: #eaeaea;
        --nav-item-hover-border: #efefef;
        --nav-item-active-border: #eaeaea;
        --nav-item-active-text: #1f1f1f;
        --nav-item-indicator-color: #1f1f1f;
        --nav-item-active-color: #1f1f1f;
        --nav-item-active-shadow: rgba(0, 0, 0, 0.06);
        --nav-control-hover-border: #efefef;
        --nav-control-hover-text: #1f1f1f;
        --nav-control-active-border: #eaeaea;
        --nav-control-active-bg: #eaeaea;
        --nav-control-active-text: #1f1f1f;
        --nav-button-bg: #f9f9f9;
      }

      .nav-root[data-color-scheme="light"][data-site="gemini"] {
        --nav-bg: #f3f6fc;
        --nav-surface: #f3f6fc;
        --nav-border: #dce1e9;
        --nav-text: #1f2a3d;
        --nav-muted: #546377;
        --nav-accent: #dce1e9;
        --nav-accent-strong: #0842a0;
        --nav-hover: #dce1e9;
        --nav-item-bg: #e9eef6;
        --nav-item-hover-bg: #dce1e9;
        --nav-item-active-bg: #d3e3fd;
        --nav-item-hover-border: #dce1e9;
        --nav-item-active-border: #d3e3fd;
        --nav-item-active-text: #0842a0;
        --nav-item-indicator-color: #0842a0;
        --nav-item-active-color: #0842a0;
        --nav-item-active-shadow: rgba(8, 66, 160, 0.16);
        --nav-control-hover-border: #dce1e9;
        --nav-control-hover-text: #0842a0;
        --nav-control-active-border: #d3e3fd;
        --nav-control-active-bg: #d3e3fd;
        --nav-control-active-text: #0842a0;
        --nav-button-bg: #f3f6fc;
      }

      .nav-root[data-color-scheme="light"][data-site="claude"] {
        --nav-bg: #faf9f5;
        --nav-surface: #faf9f5;
        --nav-border: #e7e1d5;
        --nav-text: #2f2923;
        --nav-muted: #756c60;
        --nav-accent: #f0eee6;
        --nav-accent-strong: #d97757;
        --nav-hover: #f0eee6;
        --nav-accent-shadow: rgba(217, 119, 87, 0.2);
        --nav-item-bg: #f7f4ec;
        --nav-item-hover-bg: #f0eee6;
        --nav-item-active-bg: #eae4d8;
        --nav-item-hover-border: #e7e1d5;
        --nav-item-active-border: #d97757;
        --nav-item-active-text: #c6613f;
        --nav-item-indicator-color: #c6613f;
        --nav-item-active-color: #c6613f;
        --nav-item-active-shadow: rgba(198, 97, 63, 0.18);
        --nav-control-hover-border: #d97757;
        --nav-control-hover-text: #d97757;
        --nav-control-active-border: #c6613f;
        --nav-control-active-bg: #f0eee6;
        --nav-control-active-text: #c6613f;
        --nav-button-bg: #faf9f5;
      }

      .nav-root[data-color-scheme="dark"] {
        --nav-bg: #121417;
        --nav-surface: #181b1f;
        --nav-border: #2f343a;
        --nav-text: #e7eaee;
        --nav-muted: #a4adb7;
        --nav-accent: #2a3037;
        --nav-accent-strong: #c9d0d8;
        --nav-hover: #242a31;
        --nav-accent-shadow: rgba(170, 178, 187, 0.18);
        --nav-item-bg: #21262c;
        --nav-item-hover-bg: #2a3037;
        --nav-item-active-bg: #303740;
        --nav-item-hover-border: #4a545f;
        --nav-item-active-border: #66727d;
        --nav-item-active-text: #f1f4f7;
        --nav-item-indicator-color: #d3d9e0;
        --nav-item-active-color: #e5eaf0;
        --nav-item-active-shadow: rgba(10, 12, 15, 0.38);
        --nav-control-hover-border: #4f5964;
        --nav-control-hover-text: #e1e6eb;
        --nav-control-active-border: #6d7883;
        --nav-control-active-bg: rgba(160, 169, 178, 0.18);
        --nav-control-active-text: #f1f4f7;
        --nav-shadow: 0 20px 48px rgba(3, 8, 17, 0.58), 0 2px 10px rgba(3, 8, 17, 0.35);
        --nav-button-bg: #22272e;
        --nav-active-text: #f0f4f8;
        --nav-scrollbar-track: rgba(232, 236, 241, 0.1);
        --nav-scrollbar-thumb: rgba(232, 236, 241, 0.34);
        --nav-scrollbar-thumb-hover: rgba(232, 236, 241, 0.48);
        --nav-scrollbar-thumb-active: rgba(232, 236, 241, 0.62);
      }

      .panel {
        position: fixed;
        top: var(--nav-panel-offset);
        right: 16px;
        width: 280px;
        max-height: var(--nav-panel-max-height);
        height: auto;
        display: flex;
        flex-direction: column;
        pointer-events: auto;
        background: var(--nav-surface);
        border: 1px solid var(--nav-border);
        border-radius: 16px;
        box-shadow: var(--nav-shadow);
        overflow: hidden;
        opacity: 1;
        visibility: visible;
        transform: translate3d(0, 0, 0) scale(1);
        transform-origin: top right;
        transition:
          opacity var(--nav-panel-enter-duration) var(--nav-ease-out-quart),
          transform var(--nav-panel-enter-duration) var(--nav-ease-out-expo),
          box-shadow var(--nav-surface-duration) var(--nav-ease-out-quart),
          visibility 0ms linear 0ms;
        will-change: transform, opacity;
      }

      .panel-header {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 12px 14px 10px 14px;
        border-bottom: 1px solid var(--nav-border);
        background: var(--nav-surface);
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }

      .panel-title {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .panel-title strong {
        font-size: 14px;
        letter-spacing: 0.3px;
        color: var(--nav-text);
      }

      .panel-title span {
        font-size: 12px;
        color: var(--nav-muted);
      }

      .panel-actions {
        display: flex;
        gap: 6px;
        align-items: center;
        justify-content: flex-start;
        flex-wrap: nowrap;
        width: 100%;
      }

      .panel-toggle {
        border: 1px solid var(--nav-border);
        background: var(--nav-button-bg);
        color: var(--nav-text);
        font-size: 12px;
        border-radius: 999px;
        padding: 6px 10px;
        cursor: pointer;
        white-space: nowrap;
        transform: translate3d(0, 0, 0);
        transition:
          transform var(--nav-feedback-duration) var(--nav-ease-out-quart),
          border-color 180ms var(--nav-ease-out-quart),
          background-color 180ms var(--nav-ease-out-quart),
          color 180ms var(--nav-ease-out-quart),
          box-shadow 220ms var(--nav-ease-out-quart);
        will-change: transform;
      }

      .panel-toggle:hover {
        border-color: var(--nav-control-hover-border);
        color: var(--nav-control-hover-text);
        background: var(--nav-hover);
        box-shadow: 0 8px 18px var(--nav-accent-shadow);
        transform: translate3d(0, -1px, 0);
      }

      .panel-toggle:active {
        transform: translate3d(0, 0, 0) scale(0.97);
        box-shadow: none;
      }

      .panel-toggle:focus-visible {
        outline: 2px solid var(--nav-item-active-border);
        outline-offset: 2px;
      }

      .panel-toggle.is-active {
        border-color: var(--nav-control-active-border);
        background: var(--nav-control-active-bg);
        color: var(--nav-control-active-text);
      }

      .panel-toggle-theme {
        width: 32px;
        height: 32px;
        min-width: 32px;
        padding: 0;
        border-radius: 999px;
        text-align: center;
        font-size: 15px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .panel-body-wrap {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        overflow: hidden;
        background: var(--nav-surface);
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }

      .panel-body {
        flex: 1 1 auto;
        min-height: 0;
        max-height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: var(--nav-scrollbar-thumb) var(--nav-scrollbar-track);
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: var(--nav-surface);
      }

      .panel-body::-webkit-scrollbar {
        width: var(--nav-scrollbar-size);
      }

      .panel-body::-webkit-scrollbar-track {
        background: var(--nav-scrollbar-track);
        border-radius: 999px;
      }

      .panel-body::-webkit-scrollbar-thumb {
        background: var(--nav-scrollbar-thumb);
        border-radius: 999px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }

      .panel-body::-webkit-scrollbar-thumb:hover {
        background: var(--nav-scrollbar-thumb-hover);
        background-clip: padding-box;
      }

      .panel-body::-webkit-scrollbar-thumb:active {
        background: var(--nav-scrollbar-thumb-active);
        background-clip: padding-box;
      }

      .scroll-hint {
        position: absolute;
        left: 0;
        right: 0;
        height: 20px;
        opacity: 0;
        pointer-events: none;
        transition:
          opacity 180ms var(--nav-ease-out-quart),
          transform 180ms var(--nav-ease-out-quart);
        z-index: 2;
      }

      .scroll-hint::before {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--nav-surface);
      }

      .scroll-hint-top {
        top: 0;
        transform: translate3d(0, -4px, 0);
      }

      .scroll-hint-top::before {
        -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
        mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
      }

      .scroll-hint-bottom {
        bottom: 0;
        transform: translate3d(0, 4px, 0);
      }

      .scroll-hint-bottom::before {
        -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
        mask-image: linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
      }

      .nav-item {
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid transparent;
        background: var(--nav-item-bg);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 4px;
        position: relative;
        transform: translate3d(0, 0, 0);
        transition:
          border-color 180ms var(--nav-ease-out-quart),
          background-color 180ms var(--nav-ease-out-quart),
          box-shadow 220ms var(--nav-ease-out-quart),
          transform 180ms var(--nav-ease-out-quart),
          color 180ms var(--nav-ease-out-quart);
        will-change: transform;
      }

      .nav-item::after {
        content: '';
        position: absolute;
        right: -2px;
        top: -2px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--nav-item-indicator-color);
        box-shadow: 0 0 0 2px var(--nav-surface);
        opacity: 0;
        transform: scale(0.45);
        transition:
          opacity 180ms var(--nav-ease-out-quart),
          transform 220ms var(--nav-ease-out-expo);
      }

      .nav-item:hover {
        border-color: var(--nav-item-hover-border);
        background: var(--nav-item-hover-bg);
        box-shadow: 0 10px 22px var(--nav-item-active-shadow);
        transform: translate3d(0, -2px, 0);
      }

      .nav-item:active {
        transform: translate3d(0, 0, 0) scale(0.985);
      }

      .nav-item:focus-visible {
        outline: 2px solid var(--nav-item-active-border);
        outline-offset: 2px;
      }

      .nav-item.is-active {
        border-color: var(--nav-item-active-border);
        background: var(--nav-item-active-bg);
        box-shadow: 0 10px 24px var(--nav-item-active-shadow);
        transform: translate3d(0, 0, 0);
      }

      .nav-item.is-active::after {
        opacity: 1;
        transform: scale(1);
      }

      .nav-item.is-active .nav-item-title,
      .nav-item.is-active .nav-item-preview,
      .nav-item.is-active .nav-item-minimal {
        color: var(--nav-item-active-text);
      }

      .nav-root[data-site="claude"] .nav-item.is-active .nav-item-title {
        color: var(--nav-text);
      }

      .nav-root[data-site="claude"] .nav-item.is-active .nav-item-preview,
      .nav-root[data-site="claude"] .nav-item.is-active .nav-item-minimal {
        color: var(--nav-muted);
      }

      .nav-root[data-site="claude"] .nav-item.is-active {
        border-color: transparent;
      }

      .nav-root[data-minimal="1"] .nav-item {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 6px 8px;
        gap: 0;
      }

      .nav-item-title {
        font-size: 13px;
        color: var(--nav-text);
        font-weight: 600;
        line-height: 1.35;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        transition: color 180ms var(--nav-ease-out-quart);
      }

      .nav-item-preview {
        font-size: 12px;
        color: var(--nav-muted);
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 180ms var(--nav-ease-out-quart);
      }

      .nav-item-minimal {
        font-size: 11px;
        color: var(--nav-muted);
        letter-spacing: 0.9px;
        text-transform: uppercase;
        transition: color 180ms var(--nav-ease-out-quart);
      }

      .nav-empty {
        font-size: 12px;
        color: var(--nav-muted);
        text-align: center;
        margin-top: 24px;
      }

      .nav-root[data-minimal="1"] .nav-empty {
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: center;
        margin-top: 12px;
      }

      .nav-root[data-minimal="1"] .nav-empty span {
        display: block;
        line-height: 1.2;
        letter-spacing: 0.6px;
        text-transform: uppercase;
      }

      .nav-root[data-collapsed="1"] .panel {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translate3d(0, 12px, 0) scale(0.985);
        transition-duration:
          var(--nav-panel-exit-duration),
          var(--nav-panel-exit-duration),
          var(--nav-panel-exit-duration),
          0ms;
        transition-delay: 0ms, 0ms, 0ms, var(--nav-panel-exit-duration);
      }

      .nav-root[data-collapsed="0"] .fab {
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transform: translate3d(0, 10px, 0) scale(0.92);
        transition-delay: 0ms, 0ms, 0ms, 0ms, 0ms, 0ms, var(--nav-surface-duration);
      }

      .nav-root[data-visible="1"][data-collapsed="0"] .panel {
        animation: nav-panel-enter var(--nav-panel-enter-duration) var(--nav-ease-out-expo) both;
      }

      .nav-root[data-visible="1"][data-collapsed="0"] .panel-header {
        animation: nav-panel-section-enter 320ms 40ms var(--nav-ease-out-quart) both;
      }

      .nav-root[data-visible="1"][data-collapsed="0"] .panel-body-wrap {
        animation: nav-panel-section-enter 360ms 110ms var(--nav-ease-out-quart) both;
      }

      .nav-root[data-minimal="1"] .panel {
        width: max-content;
        max-width: 70vw;
        top: var(--nav-panel-offset);
      }

      .nav-root[data-minimal="1"] .panel-header {
        padding: 8px;
        align-items: center;
      }

      .nav-root[data-minimal="1"] .panel-title {
        display: none;
      }

      .nav-root[data-minimal="1"] .panel-actions {
        gap: 4px;
        flex-direction: column;
        align-items: center;
      }

      .nav-root[data-minimal="1"] .panel-toggle {
        padding: 4px 6px;
        font-size: 11px;
        letter-spacing: 0.6px;
      }

      .nav-root[data-minimal="1"] .panel-toggle-theme {
        min-width: 0;
        width: 28px;
        height: 28px;
        padding: 0;
        font-size: 13px;
      }

      .nav-root[data-minimal="1"] .panel-body {
        padding: 8px;
        gap: 8px;
        width: max-content;
        align-items: center;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .nav-root[data-minimal="1"] .panel-body::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
      }

      .nav-root[data-minimal="1"] .panel-body-wrap[data-scrollable="1"][data-scroll-top="1"] .scroll-hint-top,
      .nav-root[data-minimal="1"] .panel-body-wrap[data-scrollable="1"][data-scroll-bottom="1"] .scroll-hint-bottom {
        opacity: 1;
        transform: translate3d(0, 0, 0);
      }

      .nav-root[data-minimal="1"] .nav-item {
        width: 32px;
        height: 32px;
        min-width: 32px;
        min-height: 32px;
        flex: 0 0 32px;
        padding: 0;
        border-radius: 999px;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 0;
      }

      .nav-root[data-minimal="1"] .nav-item:hover {
        transform: scale(1.04);
      }

      .nav-root[data-minimal="1"] .nav-item:active {
        transform: scale(0.96);
      }

      .nav-root[data-minimal="1"] .nav-item.is-active {
        border-color: var(--nav-item-active-border);
        background: var(--nav-item-active-bg);
        box-shadow: 0 0 0 1px var(--nav-item-active-border);
        transform: translate3d(0, 0, 0);
      }

      .nav-root[data-minimal="1"] .nav-item.is-active .nav-item-minimal {
        color: var(--nav-item-active-text);
        font-weight: 700;
      }

      .nav-root[data-site="claude"][data-minimal="1"] .nav-item.is-active .nav-item-minimal {
        color: var(--nav-muted);
      }

      .nav-root[data-site="claude"][data-minimal="1"] .nav-item.is-active {
        border-color: transparent;
        box-shadow: none;
      }

      .fab {
        position: fixed;
        right: 16px;
        top: calc(var(--nav-panel-offset) + 12px);
        width: 48px;
        height: 48px;
        border-radius: 999px;
        border: 1px solid var(--nav-border);
        background: var(--nav-surface);
        color: var(--nav-text);
        box-shadow: var(--nav-shadow);
        cursor: pointer;
        pointer-events: auto;
        font-size: 12px;
        letter-spacing: 0.4px;
        cursor: grab;
        opacity: 1;
        visibility: visible;
        transform: translate3d(0, 0, 0) scale(1);
        transition:
          opacity var(--nav-surface-duration) var(--nav-ease-out-quart),
          transform var(--nav-surface-duration) var(--nav-ease-out-expo),
          border-color 180ms var(--nav-ease-out-quart),
          background-color 180ms var(--nav-ease-out-quart),
          color 180ms var(--nav-ease-out-quart),
          box-shadow var(--nav-surface-duration) var(--nav-ease-out-quart),
          visibility 0ms linear 0ms;
        will-change: transform, opacity;
      }

      .fab:hover {
        border-color: var(--nav-accent-strong);
        color: var(--nav-accent-strong);
        background: var(--nav-hover);
        transform: translate3d(0, -2px, 0) scale(1.02);
      }

      .fab:active {
        transform: translate3d(0, 0, 0) scale(0.96);
      }

      .fab:focus-visible {
        outline: 2px solid var(--nav-item-active-border);
        outline-offset: 2px;
      }

      .fab.dragging {
        cursor: grabbing;
        transition: none;
        transform: translate3d(0, 0, 0) scale(1);
      }

      .nav-preview {
        position: fixed;
        top: 0;
        left: 0;
        width: var(--preview-width, 260px);
        max-width: 360px;
        opacity: 0;
        visibility: hidden;
        transform: translate3d(12px, 0, 0) scale(0.985);
        transform-origin: top right;
        pointer-events: none;
        transition:
          opacity 180ms var(--nav-ease-out-quart),
          transform 220ms var(--nav-ease-out-expo),
          visibility 0ms linear 220ms;
        will-change: opacity, transform;
        z-index: 3;
        overflow: hidden;
      }

      .nav-preview[data-active="1"] {
        opacity: 1;
        visibility: visible;
        transform: translate3d(0, 0, 0) scale(1);
        pointer-events: auto;
        transition-delay: 0ms, 0ms, 0ms;
      }

      .nav-root[data-collapsed="1"] .nav-preview {
        opacity: 0;
        visibility: hidden;
        transform: translate3d(12px, 0, 0) scale(0.985);
        pointer-events: none;
      }

      .nav-preview-inner {
        background: var(--nav-surface);
        border: 1px solid var(--nav-border);
        border-radius: 14px;
        box-shadow: var(--nav-shadow);
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .nav-root[data-minimal="1"] .nav-preview-inner {
        box-shadow: none;
      }

      .nav-root[data-visible="1"][data-collapsed="1"] .fab {
        animation: nav-fab-enter 300ms var(--nav-ease-out-expo) both;
      }

      @media (prefers-reduced-motion: reduce) {
        .panel,
        .panel-header,
        .panel-body-wrap,
        .panel-toggle,
        .scroll-hint,
        .nav-item,
        .nav-item::after,
        .fab,
        .nav-preview {
          animation: none !important;
          transition-duration: 0ms !important;
          transition-delay: 0ms !important;
        }

        .panel,
        .panel-header,
        .panel-body-wrap,
        .panel-toggle,
        .nav-item,
        .fab,
        .nav-preview {
          transform: none !important;
        }
      }
    `;
