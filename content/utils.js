(() => {
  'use strict';

  const ns = window.ChatGptNav;
  const HIDDEN_TEXT_SELECTORS = [
    '.cdk-visually-hidden',
    '.visually-hidden',
    '.sr-only',
    '[aria-hidden="true"]',
    '[hidden]',
    '[style*="display:none"]',
    '[style*="display: none"]',
    '[style*="visibility:hidden"]',
    '[style*="visibility: hidden"]'
  ].join(',');

  function normalizeText(value) {
    return value.replace(/\s+/g, ' ').trim();
  }

  function getTextWithoutHidden(node) {
    if (!node) {
      return '';
    }
    const source = typeof node.cloneNode === 'function' ? node.cloneNode(true) : node;
    if (source && typeof source.querySelectorAll === 'function') {
      source.querySelectorAll(HIDDEN_TEXT_SELECTORS).forEach((hidden) => {
        hidden.remove();
      });
    }
    return normalizeText(source.textContent || '');
  }

  function truncate(value, maxLen) {
    if (value.length <= maxLen) {
      return value;
    }
    return `${value.slice(0, maxLen - 3)}...`;
  }

  ns.utils = {
    normalizeText,
    getTextWithoutHidden,
    truncate
  };
})();
