(() => {
  'use strict';

  const ns = window.ChatGptNav || {};

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const ICON_MARKUP = Object.freeze({
    prompt:
      '<path d="M4.75 3.25h6.5a1 1 0 0 1 1 1v7.5a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-7.5a1 1 0 0 1 1-1Z" /><path d="M6 6h4.5" /><path d="M6 8.25h4.5" /><path d="M6 10.5h3" />',
    plus: '<path d="M8 3.25v9.5M3.25 8h9.5" />',
    close: '<path d="M4.25 4.25l7.5 7.5M11.75 4.25l-7.5 7.5" />',
    search: '<circle cx="7" cy="7" r="3.75" /><path d="M10.25 10.25l2.5 2.5" />',
    copy:
      '<rect x="5.25" y="5.25" width="6.5" height="6.5" rx="1.5" /><path d="M4.75 9.5h-.5A1.25 1.25 0 0 1 3 8.25v-4A1.25 1.25 0 0 1 4.25 3h4A1.25 1.25 0 0 1 9.5 4.25v.5" />',
    trash:
      '<path d="M3.75 5h8.5" /><path d="M6.5 5V4a.75.75 0 0 1 .75-.75h1.5A.75.75 0 0 1 9.5 4v1" /><path d="M5.5 6.25l.4 5.1a1 1 0 0 0 1 .9h2.2a1 1 0 0 0 1-.9l.4-5.1" />'
  });

  function createStyleElement() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        box-sizing: border-box;
        font: inherit;
        color: inherit;
      }

      .prompt-ui,
      .prompt-ui * {
        box-sizing: border-box;
      }

      .prompt-ui {
        color: var(--prompt-text);
        font-family: inherit;
        letter-spacing: normal;
        font-kerning: normal;
        text-rendering: optimizeLegibility;
        --prompt-ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
        --prompt-ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
        --prompt-leading-tight: 1.25;
        --prompt-leading-snug: 1.4;
        --prompt-leading-body: 1.6;
        --prompt-leading-loose: 1.7;
        --prompt-tracking-meta: 0.01em;
        --prompt-weight-medium: 500;
        --prompt-weight-semibold: 600;
      }

      .prompt-entry {
        display: inline-flex;
        align-items: center;
        align-self: center;
        min-height: 36px;
        flex: 0 0 auto;
      }

      .prompt-entry-button {
        appearance: none;
        border: 1px solid var(--prompt-entry-border);
        background: var(--prompt-entry-bg);
        color: var(--prompt-entry-text);
        height: 34px;
        min-height: 34px;
        padding: 0 12px;
        border-radius: 12px;
        font: inherit;
        font-size: 13px;
        font-weight: var(--prompt-weight-medium);
        line-height: var(--prompt-leading-tight);
        letter-spacing: var(--prompt-tracking-meta);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        white-space: nowrap;
        cursor: pointer;
        transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease,
          transform 140ms var(--prompt-ease-out-quart);
        text-align: center;
        -webkit-tap-highlight-color: transparent;
      }

      .prompt-entry-icon {
        display: none;
        flex: 0 0 auto;
      }

      .prompt-entry-icon svg {
        width: 20px;
        height: 20px;
        display: block;
      }

      .prompt-entry-label {
        display: inline-flex;
        align-items: center;
      }

      .prompt-ui[data-site="gemini"] .prompt-entry {
        min-height: 40px;
      }

      .prompt-ui[data-site="gemini"] .prompt-entry-button {
        height: 36px;
        min-height: 36px;
        min-width: 72px;
        padding: 0 5px;
        border-radius: 18px;
        border-color: transparent;
        background: transparent;
        color: var(--prompt-entry-text);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        font-size: 14px;
        font-weight: 400;
      }

      .prompt-ui[data-site="gemini"] .prompt-entry-icon {
        width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        align-self: center;
      }

      .prompt-ui[data-site="gemini"] .prompt-entry-label {
        min-height: 20px;
        line-height: 20px;
        align-self: center;
      }

      .prompt-ui[data-site="gemini"] .prompt-entry-button:hover {
        background: var(--prompt-entry-hover);
        border-color: transparent;
      }

      .prompt-ui[data-site="claude"] .prompt-entry {
        min-height: 32px;
      }

      .prompt-ui[data-site="claude"] .prompt-entry-button {
        height: 32px;
        min-height: 32px;
        padding: 0 10px;
        border-radius: 10px;
        font-size: 12.5px;
      }

      .prompt-entry-button:hover {
        background: var(--prompt-entry-hover);
      }

      .prompt-entry-button:active,
      .prompt-action-button:active,
      .prompt-icon-button:active,
      .prompt-item-main:active {
        transform: translateY(1px);
      }

      .prompt-entry-button:focus-visible,
      .prompt-item-main:focus-visible,
      .prompt-action-button:focus-visible,
      .prompt-icon-button:focus-visible,
      .prompt-helper-button:focus-visible,
      .prompt-search-input:focus-visible,
      .prompt-input:focus-visible,
      .prompt-textarea:focus-visible {
        outline: 2px solid var(--prompt-focus-outline);
        outline-offset: 2px;
      }

      .prompt-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }

      .prompt-panel {
        position: fixed;
        left: 12px;
        top: 12px;
        width: min(328px, calc(100vw - 24px));
        max-height: min(78vh, 720px);
        display: grid;
        grid-template-rows: auto auto auto minmax(0, 1fr);
        gap: 10px;
        padding: 12px;
        border-radius: 16px;
        border: 1px solid var(--prompt-panel-border);
        background: var(--prompt-panel-bg);
        color: var(--prompt-text);
        font-family: var(--prompt-panel-font-family, inherit);
        font-size: var(--prompt-panel-font-size, 14px);
        line-height: var(--prompt-leading-body);
        backdrop-filter: blur(12px);
        box-shadow: var(--prompt-panel-shadow);
        overflow: hidden;
        pointer-events: auto;
        opacity: 0;
        transform: translateY(6px) scale(0.992);
        visibility: hidden;
        will-change: transform, opacity;
        transition: opacity 180ms var(--prompt-ease-out-quart), transform 220ms var(--prompt-ease-out-quint),
          visibility 0ms linear 220ms;
      }

      .prompt-panel[data-form-open="1"] {
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-gutter: auto;
        scrollbar-width: thin;
        scrollbar-color: color-mix(in srgb, var(--prompt-muted) 20%, transparent) transparent;
        -webkit-overflow-scrolling: touch;
      }

      .prompt-layer[data-open="1"] .prompt-panel {
        opacity: 1;
        transform: translateY(0) scale(1);
        visibility: visible;
        transition-delay: 0ms;
      }

      .prompt-header,
      .prompt-toolbar,
      .prompt-section,
      .prompt-list {
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 180ms var(--prompt-ease-out-quart), transform 220ms var(--prompt-ease-out-quint);
      }

      .prompt-layer[data-open="1"] .prompt-header,
      .prompt-layer[data-open="1"] .prompt-toolbar,
      .prompt-layer[data-open="1"] .prompt-section,
      .prompt-layer[data-open="1"] .prompt-list {
        opacity: 1;
        transform: translateY(0);
      }

      .prompt-layer[data-open="1"] .prompt-header {
        transition-delay: 24ms;
      }

      .prompt-layer[data-open="1"] .prompt-toolbar {
        transition-delay: 56ms;
      }

      .prompt-layer[data-open="1"] .prompt-section {
        transition-delay: 88ms;
      }

      .prompt-layer[data-open="1"] .prompt-list {
        transition-delay: 116ms;
      }

      .prompt-header {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }

      .prompt-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-height: 20px;
      }

      .prompt-panel[data-form-open="1"] .prompt-toolbar {
        display: none;
      }

      .prompt-count {
        font-size: 12px;
        line-height: var(--prompt-leading-snug);
        letter-spacing: var(--prompt-tracking-meta);
        font-variant-numeric: tabular-nums;
        color: var(--prompt-muted);
      }

      .prompt-search-shell {
        min-width: 0;
        min-height: 44px;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        border: 1px solid var(--prompt-input-border);
        border-radius: 12px;
        background: var(--prompt-input-bg);
        transition: border-color 140ms ease, box-shadow 140ms ease, background-color 140ms ease;
      }

      .prompt-search-shell:hover,
      .prompt-search-shell:focus-within {
        border-color: color-mix(in srgb, var(--prompt-accent) 22%, var(--prompt-input-border));
      }

      .prompt-search-shell:focus-within {
        box-shadow: 0 0 0 3px var(--prompt-focus-ring);
      }

      .prompt-search-icon {
        width: 16px;
        height: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--prompt-muted);
        flex: 0 0 auto;
      }

      .prompt-search-icon svg {
        width: 16px;
        height: 16px;
      }

      .prompt-search-input {
        width: 100%;
        min-width: 0;
        border: none;
        background: transparent;
        color: var(--prompt-text);
        font: inherit;
        font-size: 13px;
        line-height: var(--prompt-leading-body);
        padding: 0;
        margin: 0;
        appearance: none;
      }

      .prompt-search-input::placeholder {
        color: color-mix(in srgb, var(--prompt-muted) 82%, transparent);
      }

      .prompt-search-input:focus {
        outline: none;
      }

      .prompt-search-input::-webkit-search-decoration,
      .prompt-search-input::-webkit-search-cancel-button,
      .prompt-search-input::-webkit-search-results-button,
      .prompt-search-input::-webkit-search-results-decoration {
        -webkit-appearance: none;
      }

      .prompt-action-button,
      .prompt-icon-button {
        appearance: none;
        border: 1px solid var(--prompt-surface-border);
        background: transparent;
        color: var(--prompt-secondary-text);
        cursor: pointer;
        transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease,
          transform 140ms var(--prompt-ease-out-quart), opacity 140ms ease;
        -webkit-tap-highlight-color: transparent;
      }

      .prompt-action-button:hover,
      .prompt-icon-button:hover {
        background: var(--prompt-surface-hover);
        border-color: color-mix(in srgb, var(--prompt-accent) 18%, var(--prompt-surface-border));
        color: var(--prompt-accent-strong);
      }

      .prompt-icon-button[data-active="1"],
      .prompt-icon-button[data-active="1"]:hover {
        background: var(--prompt-surface-hover);
        border-color: color-mix(in srgb, var(--prompt-accent) 18%, var(--prompt-surface-border));
        color: var(--prompt-accent-strong);
      }

      .prompt-action-button[data-tone="primary"] {
        background: var(--prompt-primary-bg);
        border-color: var(--prompt-primary-border);
        color: var(--prompt-primary-text);
      }

      .prompt-action-button[data-tone="primary"]:hover {
        background: color-mix(in srgb, var(--prompt-primary-bg) 90%, white 10%);
        border-color: var(--prompt-primary-border);
        color: var(--prompt-primary-text);
      }

      .prompt-action-button[data-tone="danger"],
      .prompt-icon-button[data-tone="danger"] {
        color: var(--prompt-danger);
      }

      .prompt-action-button[data-tone="danger"]:hover,
      .prompt-icon-button[data-tone="danger"]:hover {
        background: var(--prompt-danger-soft);
        border-color: color-mix(in srgb, var(--prompt-danger) 22%, transparent);
        color: var(--prompt-danger);
      }

      .prompt-action-button[disabled],
      .prompt-icon-button[disabled],
      .prompt-helper-button[disabled],
      .prompt-item-main[disabled] {
        opacity: 0.56;
        cursor: not-allowed;
        pointer-events: none;
      }

      .prompt-action-button {
        min-height: 34px;
        padding: 0 12px;
        border-radius: 10px;
        font: inherit;
        font-size: 12.5px;
        font-weight: var(--prompt-weight-medium);
        line-height: var(--prompt-leading-tight);
        letter-spacing: var(--prompt-tracking-meta);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .prompt-icon-button {
        width: 34px;
        height: 34px;
        padding: 0;
        border-radius: 10px;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }

      .prompt-icon-button[data-busy="1"] svg {
        opacity: 0;
      }

      .prompt-icon-button[data-busy="1"]::after {
        content: '';
        position: absolute;
        inset: 9px;
        border-radius: 999px;
        border: 1.5px solid currentColor;
        border-right-color: transparent;
        animation: prompt-spin 720ms linear infinite;
      }

      .prompt-action-button svg,
      .prompt-icon-button svg {
        width: 16px;
        height: 16px;
      }

      .prompt-input,
      .prompt-textarea {
        width: 100%;
        border: 1px solid var(--prompt-input-border);
        border-radius: 12px;
        background: var(--prompt-input-bg);
        color: var(--prompt-text);
        font: inherit;
        font-size: 13px;
        line-height: var(--prompt-leading-body);
        transition: border-color 140ms ease, box-shadow 140ms ease, background-color 140ms ease;
      }

      .prompt-input:hover,
      .prompt-textarea:hover,
      .prompt-input:focus,
      .prompt-textarea:focus {
        border-color: color-mix(in srgb, var(--prompt-accent) 22%, var(--prompt-input-border));
      }

      .prompt-input:focus,
      .prompt-textarea:focus {
        outline: none;
        box-shadow: 0 0 0 3px var(--prompt-focus-ring);
      }

      .prompt-input {
        min-height: 44px;
        padding: 0 14px;
      }

      .prompt-textarea {
        min-height: 144px;
        padding: 12px 14px;
        resize: vertical;
      }

      .prompt-input::placeholder,
      .prompt-textarea::placeholder {
        color: color-mix(in srgb, var(--prompt-muted) 82%, transparent);
      }

      .prompt-section {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 220ms cubic-bezier(0.22, 1, 0.36, 1);
      }

      .prompt-section[data-open="1"] {
        grid-template-rows: 1fr;
      }

      .prompt-section-inner {
        min-height: 0;
        overflow: hidden;
      }

      .prompt-form {
        margin-top: 0;
        padding-top: 12px;
        border-top: 1px solid var(--prompt-surface-border);
        display: grid;
        gap: 12px;
      }

      .prompt-section[data-open="1"] .prompt-form {
        animation: prompt-fade-up 220ms var(--prompt-ease-out-quint) both;
        transform-origin: top;
      }

      .prompt-field {
        display: grid;
        gap: 6px;
        min-width: 0;
      }

      .prompt-label {
        font-size: 12px;
        font-weight: var(--prompt-weight-medium);
        line-height: var(--prompt-leading-snug);
        letter-spacing: var(--prompt-tracking-meta);
        color: var(--prompt-secondary-text);
      }

      .prompt-warning {
        font-size: 12px;
        line-height: var(--prompt-leading-snug);
        color: var(--prompt-danger);
      }

      .prompt-warning[hidden] {
        display: none;
      }

      .prompt-helper {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        min-width: 0;
      }

      .prompt-helper[hidden] {
        display: none;
      }

      .prompt-helper-text {
        font-size: 12px;
        line-height: var(--prompt-leading-snug);
        color: var(--prompt-muted);
      }

      .prompt-helper-button {
        appearance: none;
        border: none;
        background: transparent;
        padding: 0;
        margin: 0;
        color: var(--prompt-accent-strong);
        font: inherit;
        font-size: 12px;
        font-weight: var(--prompt-weight-medium);
        line-height: var(--prompt-leading-snug);
        letter-spacing: var(--prompt-tracking-meta);
        cursor: pointer;
        text-decoration: underline;
        text-decoration-thickness: 0.08em;
        text-underline-offset: 0.16em;
        transition: color 140ms ease, transform 140ms var(--prompt-ease-out-quart);
        -webkit-tap-highlight-color: transparent;
      }

      .prompt-helper-button:hover {
        color: var(--prompt-accent);
        transform: translateX(1px);
      }

      .prompt-form-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        flex-wrap: wrap;
      }

      .prompt-list {
        min-height: 0;
        overflow-y: auto;
        overflow-x: hidden;
        overscroll-behavior: contain;
        scrollbar-gutter: auto;
        scrollbar-width: thin;
        scrollbar-color: color-mix(in srgb, var(--prompt-muted) 18%, transparent) transparent;
        display: grid;
        gap: 10px;
        align-content: start;
      }

      .prompt-list[data-empty="1"] {
        min-height: 0;
        align-content: center;
        padding-block: 8px;
      }

      .prompt-panel[data-form-open="1"]::-webkit-scrollbar,
      .prompt-list::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      .prompt-panel[data-form-open="1"]::-webkit-scrollbar-track,
      .prompt-list::-webkit-scrollbar-track {
        background: transparent;
      }

      .prompt-panel[data-form-open="1"]::-webkit-scrollbar-thumb,
      .prompt-list::-webkit-scrollbar-thumb {
        border-radius: 999px;
        border: 2px solid transparent;
        background-clip: padding-box;
        background: color-mix(in srgb, var(--prompt-muted) 18%, transparent);
      }

      .prompt-panel[data-form-open="1"]:hover::-webkit-scrollbar-thumb,
      .prompt-list:hover::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--prompt-muted) 28%, transparent);
      }

      .prompt-item {
        position: relative;
        display: block;
        padding: 14px;
        border: 1px solid var(--prompt-surface-border);
        border-radius: 14px;
        background: var(--prompt-surface);
        transition: background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease,
          transform 180ms var(--prompt-ease-out-quart);
        min-width: 0;
      }

      .prompt-item:hover,
      .prompt-item:focus-within {
        background: var(--prompt-surface-hover);
        border-color: color-mix(in srgb, var(--prompt-accent) 18%, var(--prompt-surface-border));
        box-shadow: 0 1px 0 color-mix(in srgb, var(--prompt-accent) 10%, transparent);
        transform: translateY(-1px);
      }

      .prompt-item-main {
        appearance: none;
        border: none;
        background: transparent;
        color: inherit;
        padding: 0;
        margin: 0;
        display: grid;
        align-content: start;
        gap: 8px;
        min-width: 0;
        text-align: left;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: transform 140ms var(--prompt-ease-out-quart);
        width: 100%;
      }

      .prompt-item-head {
        min-width: 0;
        padding-right: 80px;
      }

      .prompt-item-title {
        margin: 0;
        min-width: 0;
        font-size: 14px;
        line-height: var(--prompt-leading-snug);
        font-weight: var(--prompt-weight-semibold);
        letter-spacing: -0.01em;
        color: var(--prompt-accent-strong);
        overflow-wrap: anywhere;
        word-break: break-all;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .prompt-item-preview {
        margin: 0;
        font-size: 12.5px;
        line-height: var(--prompt-leading-loose);
        color: var(--prompt-secondary-text);
        overflow-wrap: anywhere;
        word-break: break-all;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        white-space: pre-wrap;
      }

      .prompt-item-title mark,
      .prompt-item-preview mark {
        background: color-mix(in srgb, var(--prompt-accent) 16%, transparent);
        color: inherit;
        border-radius: 4px;
        padding: 0 0.08em;
        box-decoration-break: clone;
        -webkit-box-decoration-break: clone;
      }

      .prompt-item-actions {
        position: absolute;
        top: 6px;
        right: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        flex-wrap: nowrap;
        cursor: default;
        opacity: 0.82;
        transform: translateY(2px);
        transition: opacity 180ms var(--prompt-ease-out-quart), transform 180ms var(--prompt-ease-out-quart);
      }

      .prompt-item:hover .prompt-item-actions,
      .prompt-item:focus-within .prompt-item-actions {
        opacity: 1;
        transform: translateY(0);
      }

      .prompt-empty {
        padding-top: 0;
        border-top: none;
        display: grid;
        gap: 6px;
      }

      .prompt-empty-title {
        font-size: 13px;
        line-height: var(--prompt-leading-snug);
        font-weight: var(--prompt-weight-semibold);
        letter-spacing: -0.01em;
        color: var(--prompt-accent-strong);
      }

      .prompt-empty-text {
        max-width: 30ch;
        font-size: 12.5px;
        line-height: var(--prompt-leading-loose);
        color: var(--prompt-muted);
      }

      @keyframes prompt-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes prompt-fade-up {
        from {
          opacity: 0;
          transform: translateY(8px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .prompt-helper:not([hidden]),
      .prompt-warning:not([hidden]),
      .prompt-empty {
        animation: prompt-fade-up 200ms var(--prompt-ease-out-quart) both;
      }

      @media (max-width: 640px) {
        .prompt-panel {
          width: calc(100vw - 16px);
          max-height: calc(100vh - 16px);
          padding: 12px;
          border-radius: 14px;
          gap: 8px;
        }

        .prompt-form-actions {
          justify-content: flex-start;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .prompt-panel,
        .prompt-header,
        .prompt-toolbar,
        .prompt-list,
        .prompt-search-shell,
        .prompt-action-button,
        .prompt-icon-button,
        .prompt-helper-button,
        .prompt-helper,
        .prompt-warning,
        .prompt-item,
        .prompt-item-main,
        .prompt-item-actions,
        .prompt-section,
        .prompt-form,
        .prompt-empty {
          transition: none !important;
          animation: none !important;
        }

        .prompt-icon-button[data-busy="1"]::after {
          animation: none !important;
          border-right-color: currentColor;
        }
      }
    `;
    return style;
  }

  function createActionButton(text, action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'prompt-action-button';
    button.dataset.action = action;
    const label = document.createElement('span');
    label.className = 'prompt-action-label';
    label.textContent = text;
    button.appendChild(label);
    return button;
  }

  function createIconButton(action, label, iconName) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'prompt-icon-button';
    button.dataset.action = action;
    button.setAttribute('aria-label', label);
    button.title = label;
    button.appendChild(createSvgIcon(iconName));
    return button;
  }

  function createSvgIcon(iconName) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.6');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = ICON_MARKUP[iconName] || ICON_MARKUP.plus;
    return svg;
  }

  ns.promptLibraryUiStyle = Object.assign({}, ns.promptLibraryUiStyle, {
    createStyleElement,
    createActionButton,
    createIconButton,
    createSvgIcon
  });
  window.ChatGptNav = ns;
})();
