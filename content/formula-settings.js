(() => {
  'use strict';

  const globalRef = window;
  const ns = globalRef.ChatGptNav || {};

  const KEY = 'formula_copy_settings';
  const DEFAULTS = Object.freeze({
    enableFormulaCopy: true,
    formulaFormat: 'mathml',
    formulaEngine: 'mathjax'
  });
  const SUPPORTED_FORMATS = new Set(['mathml', 'latex']);
  const SUPPORTED_ENGINES = new Set(['mathjax', 'katex', 'auto']);

  function createDefaults() {
    return { ...DEFAULTS };
  }

  function normalize(raw) {
    const normalized = createDefaults();
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

  function createEnvironment(overrides = {}) {
    return {
      storageApi: overrides.storageApi || null,
      chromeRef:
        overrides.chromeRef || (typeof chrome !== 'undefined' ? chrome : null)
    };
  }

  function hasStorageApi(storageApi) {
    return Boolean(storageApi && typeof storageApi.getJson === 'function' && typeof storageApi.setJson === 'function');
  }

  function isChromeStorageReady(chromeRef) {
    return Boolean(
      chromeRef &&
        chromeRef.storage &&
        chromeRef.storage.local &&
        typeof chromeRef.storage.local.get === 'function' &&
        typeof chromeRef.storage.local.set === 'function'
    );
  }

  function readRawFromChrome(chromeRef) {
    if (!isChromeStorageReady(chromeRef)) {
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      try {
        chromeRef.storage.local.get([KEY], (items) => {
          if (chromeRef.runtime && chromeRef.runtime.lastError) {
            resolve(null);
            return;
          }
          if (!items || !Object.prototype.hasOwnProperty.call(items, KEY)) {
            resolve(null);
            return;
          }
          resolve(items[KEY]);
        });
      } catch (error) {
        resolve(null);
      }
    });
  }

  function writeRawToChrome(chromeRef, rawValue) {
    if (!isChromeStorageReady(chromeRef)) {
      return Promise.resolve(false);
    }

    return new Promise((resolve) => {
      try {
        chromeRef.storage.local.set({ [KEY]: rawValue }, () => {
          if (chromeRef.runtime && chromeRef.runtime.lastError) {
            resolve(false);
            return;
          }
          resolve(true);
        });
      } catch (error) {
        resolve(false);
      }
    });
  }

  function createFormulaSettingsApi(environment = createEnvironment()) {
    const env = createEnvironment(environment);

    function readRaw() {
      if (hasStorageApi(env.storageApi)) {
        return Promise.resolve(env.storageApi.getJson(KEY)).catch(() => null);
      }
      return readRawFromChrome(env.chromeRef);
    }

    function read() {
      return readRaw().then((raw) => normalize(raw));
    }

    function write(rawValue) {
      const normalized = normalize(rawValue);
      if (hasStorageApi(env.storageApi)) {
        return Promise.resolve(env.storageApi.setJson(KEY, normalized))
          .then((saved) => Boolean(saved))
          .catch(() => false);
      }
      return writeRawToChrome(env.chromeRef, normalized);
    }

    return {
      KEY,
      DEFAULTS: createDefaults(),
      normalize,
      readRaw,
      read,
      write
    };
  }

  const formulaSettingsApi = createFormulaSettingsApi();

  ns.formulaSettings = Object.assign({}, ns.formulaSettings, formulaSettingsApi, { createFormulaSettingsApi });
  globalRef.ChatGptNav = ns;
  globalRef.JumpNavFormulaSettings = Object.assign(
    {},
    globalRef.JumpNavFormulaSettings,
    formulaSettingsApi,
    { createFormulaSettingsApi }
  );
})();
