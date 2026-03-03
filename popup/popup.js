(() => {
  'use strict';

  const LINKS = {
    repo: 'https://github.com/hysltway/JumpNav',
    store: 'https://chromewebstore.google.com/detail/jumpnav-the-most-elegant/kkemkfabmgjcjlileggigaaemcheapep',
    bug: 'https://github.com/hysltway/JumpNav/issues/new?labels=bug&title=%5BBug%5D%20',
    feature: 'https://github.com/hysltway/JumpNav/issues/new?labels=enhancement&title=%5BFeature%5D%20'
  };
  function updateEngineFieldState(formatSelect, engineSelect) {
    const isLatexOnly = formatSelect.value === 'latex';
    engineSelect.disabled = isLatexOnly;
    engineSelect.title = isLatexOnly ? 'MathML engine is used only when format is MathML.' : '';
  }

  function createEnvironment(overrides = {}) {
    const chromeRef = overrides.chromeRef || (typeof chrome !== 'undefined' ? chrome : null);
    return {
      documentRef: overrides.documentRef || document,
      windowRef: overrides.windowRef || window,
      chromeRef,
      formulaSettingsApi:
        overrides.formulaSettingsApi || getFormulaSettingsApi(chromeRef)
    };
  }

  function getFormulaSettingsApi(chromeRef) {
    if (
      window.JumpNavFormulaSettings &&
      typeof window.JumpNavFormulaSettings.createFormulaSettingsApi === 'function'
    ) {
      return window.JumpNavFormulaSettings.createFormulaSettingsApi({ chromeRef });
    }
    return createFallbackFormulaSettingsApi(chromeRef);
  }

  function createFallbackFormulaSettingsApi(chromeRef) {
    const key = 'formula_copy_settings';
    const defaults = {
      enableFormulaCopy: true,
      formulaFormat: 'mathml',
      formulaEngine: 'mathjax'
    };
    const supportedFormats = new Set(['mathml', 'latex']);
    const supportedEngines = new Set(['mathjax', 'katex', 'auto']);

    const normalize = (raw) => {
      const normalized = { ...defaults };
      if (!raw || typeof raw !== 'object') {
        return normalized;
      }
      normalized.enableFormulaCopy = raw.enableFormulaCopy !== false;
      if (supportedFormats.has(raw.formulaFormat)) {
        normalized.formulaFormat = raw.formulaFormat;
      }
      if (supportedEngines.has(raw.formulaEngine)) {
        normalized.formulaEngine = raw.formulaEngine;
      }
      return normalized;
    };

    const read = () =>
      new Promise((resolve) => {
        if (
          !chromeRef ||
          !chromeRef.storage ||
          !chromeRef.storage.local ||
          typeof chromeRef.storage.local.get !== 'function'
        ) {
          resolve({ ...defaults });
          return;
        }
        chromeRef.storage.local.get([key], (items) => {
          if (chromeRef.runtime && chromeRef.runtime.lastError) {
            resolve({ ...defaults });
            return;
          }
          resolve(normalize(items ? items[key] : null));
        });
      });

    const write = (rawValue) =>
      new Promise((resolve) => {
        if (
          !chromeRef ||
          !chromeRef.storage ||
          !chromeRef.storage.local ||
          typeof chromeRef.storage.local.set !== 'function'
        ) {
          resolve(false);
          return;
        }
        chromeRef.storage.local.set({ [key]: normalize(rawValue) }, () => {
          if (chromeRef.runtime && chromeRef.runtime.lastError) {
            resolve(false);
            return;
          }
          resolve(true);
        });
      });

    return {
      KEY: key,
      DEFAULTS: { ...defaults },
      normalize,
      read,
      write
    };
  }

  function createPopupController(environment = createEnvironment()) {
    const env = createEnvironment(environment);

    function start() {
      env.documentRef.addEventListener('DOMContentLoaded', () => {
        syncVersionPill();
        bindLinkButtons();
        initFormulaSettings();
      });
    }

    function syncVersionPill() {
      const versionPill = env.documentRef.getElementById('version-pill');
      if (!versionPill) {
        return;
      }
      try {
        if (env.chromeRef && env.chromeRef.runtime && typeof env.chromeRef.runtime.getManifest === 'function') {
          const manifest = env.chromeRef.runtime.getManifest();
          if (manifest && manifest.version) {
            versionPill.textContent = `v${manifest.version}`;
          }
        }
      } catch (error) {
        // Keep the fallback text from popup.html.
      }
    }

    function bindLinkButtons() {
      const buttons = env.documentRef.querySelectorAll('[data-link]');
      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          openLink(button.dataset.link);
        });
      });
    }

    function openLink(linkKey) {
      const url = LINKS[linkKey];
      if (!url) {
        return;
      }
      if (env.chromeRef && env.chromeRef.tabs && typeof env.chromeRef.tabs.create === 'function') {
        env.chromeRef.tabs.create({ url });
        return;
      }
      env.windowRef.open(url, '_blank', 'noopener,noreferrer');
    }

    async function initFormulaSettings() {
      const enabledInput = env.documentRef.getElementById('formula-enabled');
      const formatSelect = env.documentRef.getElementById('formula-format');
      const engineSelect = env.documentRef.getElementById('formula-engine');

      if (!enabledInput || !formatSelect || !engineSelect) {
        return;
      }

      const settings = await env.formulaSettingsApi.read();
      enabledInput.checked = settings.enableFormulaCopy;
      formatSelect.value = settings.formulaFormat;
      engineSelect.value = settings.formulaEngine;
      updateEngineFieldState(formatSelect, engineSelect);

      const persistSettings = async () => {
        const nextSettings = env.formulaSettingsApi.normalize({
          enableFormulaCopy: enabledInput.checked,
          formulaFormat: formatSelect.value,
          formulaEngine: engineSelect.value
        });
        updateEngineFieldState(formatSelect, engineSelect);
        await env.formulaSettingsApi.write(nextSettings);
      };

      enabledInput.addEventListener('change', persistSettings);
      formatSelect.addEventListener('change', persistSettings);
      engineSelect.addEventListener('change', persistSettings);
    }

    return {
      start
    };
  }

  const popupController = createPopupController();
  popupController.start();
})();
