(() => {
  'use strict';

  if (!window.ChatGptNav) {
    return;
  }

  if (window.ChatGptNav.formulaCopy && typeof window.ChatGptNav.formulaCopy.start === 'function') {
    window.ChatGptNav.formulaCopy.start();
  }

  if (window.ChatGptNav.core && typeof window.ChatGptNav.core.start === 'function') {
    window.ChatGptNav.core.start();
  }
})();
