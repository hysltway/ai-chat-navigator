(() => {
  'use strict';

  const ns = window.ChatGptNav;
  if (!ns || !ns.formulaExtractor) {
    return;
  }

  const STORAGE_KEY = 'formula_copy_settings';
  const DEFAULT_SETTINGS = {
    enableFormulaCopy: true,
    formulaFormat: 'mathml',
    formulaEngine: 'mathjax'
  };
  const STYLE_ID = 'chatgpt-nav-formula-copy-style';
  const TOAST_ID = 'chatgpt-nav-formula-toast';
  const PROCESSED_FLAG = 'chatgptNavFormulaMarked';
  const DISPLAY_FLAG_CLASS = 'chatgpt-nav-formula-display';
  const COPYABLE_CLASS = 'chatgpt-nav-formula-copyable';
  const COPY_HINT_TITLE = 'Click to copy formula for MathML (Shift+Click for LaTeX)';
  const SUPPORTED_FORMATS = new Set(['mathml', 'latex']);
  const SUPPORTED_ENGINES = new Set(['mathjax', 'katex', 'auto']);
  const FALLBACK_FORMULA_THEME = {
    presets: {
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
    },
    darkSelectors: {}
  };

  let started = false;
  let settings = { ...DEFAULT_SETTINGS };
  let observer = null;
  let decorateRaf = null;

  function getPlatform() {
    const host = location.hostname;
    if (host === 'gemini.google.com') {
      return 'gemini';
    }
    if (host === 'claude.ai') {
      return 'claude';
    }
    if (host === 'chatgpt.com' || host === 'chat.openai.com') {
      return 'chatgpt';
    }
    return 'generic';
  }

  function normalizeSettings(raw) {
    if (!raw || typeof raw !== 'object') {
      return { ...DEFAULT_SETTINGS };
    }

    const normalized = { ...DEFAULT_SETTINGS };
    normalized.enableFormulaCopy = raw.enableFormulaCopy !== false;

    if (SUPPORTED_FORMATS.has(raw.formulaFormat)) {
      normalized.formulaFormat = raw.formulaFormat;
    }

    if (SUPPORTED_ENGINES.has(raw.formulaEngine)) {
      normalized.formulaEngine = raw.formulaEngine;
    }

    return normalized;
  }

  async function loadSettings() {
    const saved = await ns.storage.getJson(STORAGE_KEY);
    settings = normalizeSettings(saved);

    if (!saved) {
      await ns.storage.setJson(STORAGE_KEY, settings);
    }
  }

  function getFormulaThemeConfig() {
    const shared = ns.UI_FORMULA_THEME;
    if (!shared || typeof shared !== 'object') {
      return FALLBACK_FORMULA_THEME;
    }

    const presets = shared.presets && typeof shared.presets === 'object' ? shared.presets : null;
    const darkSelectors =
      shared.darkSelectors && typeof shared.darkSelectors === 'object' ? shared.darkSelectors : null;

    return {
      presets: presets || FALLBACK_FORMULA_THEME.presets,
      darkSelectors: darkSelectors || FALLBACK_FORMULA_THEME.darkSelectors
    };
  }

  function toThemeVars(theme) {
    return `
      --chatgpt-nav-formula-outline: ${theme.outline};
      --chatgpt-nav-formula-ring: ${theme.ring};
      --chatgpt-nav-formula-hover-bg: ${theme.hoverBg};
      --chatgpt-nav-formula-active-bg: ${theme.activeBg};
      --chatgpt-nav-formula-toast-bg: ${theme.toastBg};
      --chatgpt-nav-formula-toast-text: ${theme.toastText};
      --chatgpt-nav-formula-toast-border: ${theme.toastBorder};
      --chatgpt-nav-formula-toast-shadow: ${theme.toastShadow};
    `;
  }

  function buildThemeCss(platform) {
    const themeConfig = getFormulaThemeConfig();
    const presets = themeConfig.presets || FALLBACK_FORMULA_THEME.presets;
    const darkSelectors = themeConfig.darkSelectors || FALLBACK_FORMULA_THEME.darkSelectors;
    const defaultPreset = FALLBACK_FORMULA_THEME.presets.generic;
    const presetCandidate = presets[platform] || presets.generic || defaultPreset;
    const preset = {
      light: presetCandidate.light || defaultPreset.light,
      dark: presetCandidate.dark || defaultPreset.dark
    };
    const darkSelector = darkSelectors[platform];
    const lightVars = toThemeVars(preset.light);
    const darkVars = toThemeVars(preset.dark);

    if (darkSelector) {
      return `
        :root {
          ${lightVars}
        }
        ${darkSelector} {
          ${darkVars}
        }
      `;
    }

    return `
      :root {
        ${lightVars}
      }
      @media (prefers-color-scheme: dark) {
        :root {
          ${darkVars}
        }
      }
    `;
  }

  function ensureStyle(platform) {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      ${buildThemeCss(platform)}
      .${COPYABLE_CLASS} {
        border-radius: 10px;
        cursor: pointer !important;
        transition: background-color 120ms ease;
      }
      .${COPYABLE_CLASS}:hover {
        background: var(--chatgpt-nav-formula-hover-bg);
      }
      .${COPYABLE_CLASS}:active {
        background: var(--chatgpt-nav-formula-active-bg);
      }
      .${COPYABLE_CLASS}:focus-visible {
        outline: none;
        background: var(--chatgpt-nav-formula-hover-bg);
      }
      .${COPYABLE_CLASS} .katex,
      .${COPYABLE_CLASS} .MathJax,
      .${COPYABLE_CLASS} .MathJax_SVG {
        border-radius: inherit;
      }
      #${TOAST_ID} {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translate(-50%, -6px);
        z-index: 2147483647;
        min-width: 160px;
        max-width: min(90vw, 420px);
        padding: 9px 13px;
        border-radius: 10px;
        font-size: 12.5px;
        font-weight: 500;
        line-height: 1.4;
        background: var(--chatgpt-nav-formula-toast-bg);
        color: var(--chatgpt-nav-formula-toast-text);
        border: 1px solid var(--chatgpt-nav-formula-toast-border);
        box-shadow: 0 10px 28px var(--chatgpt-nav-formula-toast-shadow);
        backdrop-filter: blur(8px);
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        pointer-events: none;
        opacity: 0;
        transition: opacity 160ms ease, transform 180ms ease;
      }
      #${TOAST_ID}.visible {
        opacity: 1;
        transform: translate(-50%, 0);
      }
      #${TOAST_ID}.error {
        background: rgba(146, 24, 37, 0.95);
        color: #fff7f9;
        border-color: rgba(254, 202, 202, 0.42);
      }
    `;

    document.documentElement.appendChild(style);
  }

  function getOrCreateToast() {
    let toast = document.getElementById(TOAST_ID);
    if (toast) {
      return toast;
    }

    toast = document.createElement('div');
    toast.id = TOAST_ID;
    document.body.appendChild(toast);
    return toast;
  }

  function showToast(message, isError) {
    const toast = getOrCreateToast();
    toast.textContent = message;
    toast.classList.toggle('error', Boolean(isError));
    toast.classList.add('visible');

    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(() => {
      toast.classList.remove('visible');
    }, 1400);
  }

  function shouldDecorateNode(node, platform, formulaSelector) {
    if (!node || !platform || platform !== 'gemini') {
      return true;
    }
    if (typeof node.querySelector !== 'function') {
      return true;
    }
    return !node.querySelector(formulaSelector);
  }

  function decorateFormulaElements() {
    const platform = getPlatform();
    const formulaSelector = ns.formulaExtractor.getFormulaSelector(platform);
    const formulaNodes = document.querySelectorAll(formulaSelector);
    formulaNodes.forEach((node) => {
      const canDecorate = shouldDecorateNode(node, platform, formulaSelector);
      const shouldEnable = settings.enableFormulaCopy && canDecorate;

      node.dataset[PROCESSED_FLAG] = '1';
      node.classList.toggle(COPYABLE_CLASS, shouldEnable);

      if (shouldEnable) {
        node.classList.toggle(DISPLAY_FLAG_CLASS, ns.formulaExtractor.isDisplayFormula(node));
      } else {
        node.classList.remove(DISPLAY_FLAG_CLASS);
      }

      if (!shouldEnable && node.title === COPY_HINT_TITLE) {
        node.title = '';
      } else if (shouldEnable && !node.title) {
        node.title = COPY_HINT_TITLE;
      }
    });
  }

  function scheduleDecorate() {
    if (decorateRaf) {
      return;
    }
    decorateRaf = window.requestAnimationFrame(() => {
      decorateRaf = null;
      decorateFormulaElements();
    });
  }

  function observeFormulaDom() {
    if (observer) {
      return;
    }

    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          scheduleDecorate();
          return;
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function shouldSkipClick(event) {
    if (!event || event.button !== 0) {
      return true;
    }

    if (event.altKey || event.metaKey || event.ctrlKey) {
      return true;
    }

    const selection = window.getSelection ? window.getSelection() : null;
    if (selection && selection.toString && selection.toString().trim()) {
      return true;
    }

    return false;
  }

  async function writeClipboard(text) {
    if (!text) {
      return false;
    }

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (error) {
      // Fallback below.
    }

    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.select();
      const ok = document.execCommand('copy');
      textarea.remove();
      return Boolean(ok);
    } catch (error) {
      return false;
    }
  }

  async function buildPayload(formulaElement, latexCode, targetFormat) {
    if (targetFormat === 'latex') {
      return latexCode;
    }

    const extractedMathml = ns.formulaExtractor.extractMathML(formulaElement);
    if (extractedMathml && ns.formulaConverter && typeof ns.formulaConverter.cleanMathML === 'function') {
      const cleaned = ns.formulaConverter.cleanMathML(extractedMathml);
      if (cleaned) {
        return cleaned;
      }
    }

    if (extractedMathml) {
      return extractedMathml;
    }

    if (ns.formulaConverter && typeof ns.formulaConverter.latexToMathML === 'function') {
      const converted = await ns.formulaConverter.latexToMathML(latexCode, {
        displayMode: ns.formulaExtractor.isDisplayFormula(formulaElement, latexCode),
        engine: settings.formulaEngine
      });
      if (converted) {
        return converted;
      }
    }

    return latexCode;
  }

  async function handleFormulaClick(event) {
    if (!settings.enableFormulaCopy || shouldSkipClick(event)) {
      return;
    }

    const platform = getPlatform();
    const formulaElement = ns.formulaExtractor.resolveFormulaElement(event.target, platform);
    if (!formulaElement) {
      return;
    }

    const latexCode = ns.formulaExtractor.extractLatex(formulaElement);
    if (!latexCode) {
      return;
    }

    if (platform === 'gemini') {
      // Gemini pages often have other click interceptors on formula nodes.
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }

    const targetFormat = event.shiftKey ? 'latex' : settings.formulaFormat;
    const payload = await buildPayload(formulaElement, latexCode, targetFormat);
    const copied = await writeClipboard(payload);

    if (copied) {
      const isMathml = payload !== latexCode && targetFormat === 'mathml';
      showToast(isMathml ? 'Copied formula (MathML)' : 'Copied formula (LaTeX)', false);
      return;
    }

    showToast('Failed to copy formula', true);
  }

  function attachStorageListener() {
    if (!chrome.storage || !chrome.storage.onChanged) {
      return;
    }
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local' || !changes[STORAGE_KEY]) {
        return;
      }
      settings = normalizeSettings(changes[STORAGE_KEY].newValue);
      scheduleDecorate();
    });
  }

  async function start() {
    if (started) {
      return;
    }
    started = true;

    const platform = getPlatform();
    ensureStyle(platform);
    await loadSettings();
    attachStorageListener();

    if (ns.formulaConverter && typeof ns.formulaConverter.warmup === 'function') {
      ns.formulaConverter.warmup();
    }

    window.addEventListener('click', handleFormulaClick, true);

    decorateFormulaElements();
    observeFormulaDom();
  }

  ns.formulaCopy = {
    start
  };
})();
