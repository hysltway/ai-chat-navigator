(() => {
  'use strict';

  const globalRef = window;
  const DEFAULT_CONFIG = Object.freeze({
    previewMax: 96,
    debounceMs: 300,
    pollMs: 1500
  });

  function createNamespace(overrides = {}) {
    const existingNamespace = overrides.existingNamespace || globalRef.ChatGptNav || {};
    return Object.assign({}, existingNamespace, {
      CONFIG: Object.assign({}, DEFAULT_CONFIG, existingNamespace.CONFIG || {})
    });
  }

  globalRef.ChatGptNav = createNamespace();
})();
