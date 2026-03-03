(() => {
  'use strict';

  const LINKS = {
    repo: 'https://github.com/hysltway/JumpNav',
    store: 'https://chromewebstore.google.com/detail/jumpnav-the-most-elegant/kkemkfabmgjcjlileggigaaemcheapep',
    bug: 'https://github.com/hysltway/JumpNav/issues/new?labels=bug&title=%5BBug%5D%20',
    feature: 'https://github.com/hysltway/JumpNav/issues/new?labels=enhancement&title=%5BFeature%5D%20'
  };
  const FORMULA_SETTINGS_KEY = 'formula_copy_settings';
  const DEFAULT_FORMULA_SETTINGS = {
    enableFormulaCopy: true,
    formulaFormat: 'mathml',
    formulaEngine: 'mathjax'
  };
  const SUPPORTED_FORMATS = new Set(['mathml', 'latex']);
  const SUPPORTED_ENGINES = new Set(['mathjax', 'katex', 'auto']);

  document.addEventListener('DOMContentLoaded', () => {
    syncVersionPill();
    bindLinkButtons();
    initFormulaSettings();
  });

  function syncVersionPill() {
    const versionPill = document.getElementById('version-pill');
    if (!versionPill) {
      return;
    }

    try {
      if (chrome.runtime && typeof chrome.runtime.getManifest === 'function') {
        const manifest = chrome.runtime.getManifest();
        if (manifest && manifest.version) {
          versionPill.textContent = `v${manifest.version}`;
        }
      }
    } catch (error) {
      // Keep the fallback text from popup.html.
    }
  }

  function bindLinkButtons() {
    const buttons = document.querySelectorAll('[data-link]');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const linkKey = button.dataset.link;
        openLink(linkKey);
      });
    });
  }

  function openLink(linkKey) {
    const url = LINKS[linkKey];
    if (!url) {
      return;
    }
    if (typeof chrome !== 'undefined' && chrome.tabs && typeof chrome.tabs.create === 'function') {
      chrome.tabs.create({ url });
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function normalizeFormulaSettings(raw) {
    const normalized = { ...DEFAULT_FORMULA_SETTINGS };
    if (!raw || typeof raw !== 'object') {
      return normalized;
    }

    normalized.enableFormulaCopy = raw.enableFormulaCopy !== false;

    if (SUPPORTED_FORMATS.has(raw.formulaFormat)) {
      normalized.formulaFormat = raw.formulaFormat;
    }

    if (SUPPORTED_ENGINES.has(raw.formulaEngine)) {
      normalized.formulaEngine = raw.formulaEngine;
    }

    return normalized;
  }

  function readFormulaSettings() {
    return new Promise((resolve) => {
      if (!chrome.storage || !chrome.storage.local) {
        resolve({ ...DEFAULT_FORMULA_SETTINGS });
        return;
      }

      chrome.storage.local.get([FORMULA_SETTINGS_KEY], (items) => {
        if (chrome.runtime && chrome.runtime.lastError) {
          resolve({ ...DEFAULT_FORMULA_SETTINGS });
          return;
        }
        resolve(normalizeFormulaSettings(items ? items[FORMULA_SETTINGS_KEY] : null));
      });
    });
  }

  function writeFormulaSettings(nextSettings) {
    return new Promise((resolve) => {
      if (!chrome.storage || !chrome.storage.local) {
        resolve(false);
        return;
      }

      chrome.storage.local.set({ [FORMULA_SETTINGS_KEY]: nextSettings }, () => {
        if (chrome.runtime && chrome.runtime.lastError) {
          resolve(false);
          return;
        }
        resolve(true);
      });
    });
  }

  function updateEngineFieldState(formatSelect, engineSelect) {
    const isLatexOnly = formatSelect.value === 'latex';
    engineSelect.disabled = isLatexOnly;
    engineSelect.title = isLatexOnly ? 'MathML engine is used only when format is MathML.' : '';
  }

  async function initFormulaSettings() {
    const enabledInput = document.getElementById('formula-enabled');
    const formatSelect = document.getElementById('formula-format');
    const engineSelect = document.getElementById('formula-engine');

    if (!enabledInput || !formatSelect || !engineSelect) {
      return;
    }

    const settings = await readFormulaSettings();

    enabledInput.checked = settings.enableFormulaCopy;
    formatSelect.value = settings.formulaFormat;
    engineSelect.value = settings.formulaEngine;
    updateEngineFieldState(formatSelect, engineSelect);

    const persistSettings = async () => {
      const next = normalizeFormulaSettings({
        enableFormulaCopy: enabledInput.checked,
        formulaFormat: formatSelect.value,
        formulaEngine: engineSelect.value
      });
      updateEngineFieldState(formatSelect, engineSelect);
      await writeFormulaSettings(next);
    };

    enabledInput.addEventListener('change', persistSettings);
    formatSelect.addEventListener('change', persistSettings);
    engineSelect.addEventListener('change', persistSettings);
  }
})();
