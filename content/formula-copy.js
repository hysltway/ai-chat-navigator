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

  const SUPPORTED_FORMATS = new Set(['mathml', 'latex']);
  const SUPPORTED_ENGINES = new Set(['mathjax', 'katex', 'auto']);

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

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .chatgpt-nav-formula-copyable {
        cursor: pointer !important;
      }
      .chatgpt-nav-formula-copyable:hover {
        outline: 1px dashed rgba(59, 130, 246, 0.45);
        outline-offset: 2px;
      }
      #${TOAST_ID} {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 2147483647;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12px;
        line-height: 1.4;
        background: rgba(15, 23, 42, 0.92);
        color: #f8fafc;
        border: 1px solid rgba(255, 255, 255, 0.12);
        pointer-events: none;
        opacity: 0;
        transition: opacity 160ms ease;
      }
      #${TOAST_ID}.visible {
        opacity: 1;
      }
      #${TOAST_ID}.error {
        background: rgba(153, 27, 27, 0.94);
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

  function decorateFormulaElements() {
    const formulaSelector = ns.formulaExtractor.getFormulaSelector(getPlatform());
    const formulaNodes = document.querySelectorAll(formulaSelector);
    formulaNodes.forEach((node) => {
      if (node.dataset[PROCESSED_FLAG]) {
        node.classList.toggle('chatgpt-nav-formula-copyable', settings.enableFormulaCopy);
        if (!settings.enableFormulaCopy && node.title === 'Click to copy formula (Shift+Click for LaTeX)') {
          node.title = '';
        } else if (settings.enableFormulaCopy && !node.title) {
          node.title = 'Click to copy formula (Shift+Click for LaTeX)';
        }
        return;
      }
      node.dataset[PROCESSED_FLAG] = '1';
      if (settings.enableFormulaCopy) {
        node.classList.add('chatgpt-nav-formula-copyable');
        if (!node.title) {
          node.title = 'Click to copy formula (Shift+Click for LaTeX)';
        }
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

    ensureStyle();
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
