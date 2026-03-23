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
        transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease, transform 140ms ease;
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
        transition: opacity 160ms ease, transform 180ms cubic-bezier(0.22, 1, 0.36, 1), visibility 0ms linear 180ms;
      }

      .prompt-layer[data-open="1"] .prompt-panel {
        opacity: 1;
        transform: translateY(0) scale(1);
        visibility: visible;
        transition-delay: 0ms;
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
        transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease, transform 140ms ease,
          opacity 140ms ease;
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

      .prompt-action-button[data-armed="1"],
      .prompt-icon-button[data-armed="1"] {
        background: var(--prompt-danger-soft);
        border-color: color-mix(in srgb, var(--prompt-danger) 24%, transparent);
        color: var(--prompt-danger);
      }

      .prompt-action-button[disabled],
      .prompt-icon-button[disabled],
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
        min-height: 20px;
        font-size: 12px;
        line-height: var(--prompt-leading-snug);
        color: var(--prompt-danger);
        opacity: 1;
        transition: opacity 140ms ease;
      }

      .prompt-warning[data-visible="0"] {
        opacity: 0;
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
        scrollbar-gutter: stable both-edges;
        padding-right: 2px;
        display: grid;
        gap: 10px;
        align-content: start;
      }

      .prompt-list[data-empty="1"] {
        min-height: 0;
        align-content: center;
        padding-block: 8px;
      }

      .prompt-list::-webkit-scrollbar {
        width: 10px;
      }

      .prompt-list::-webkit-scrollbar-thumb {
        border-radius: 999px;
        background: color-mix(in srgb, var(--prompt-muted) 22%, transparent);
      }

      .prompt-item {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: start;
        gap: 10px;
        padding: 14px;
        border: 1px solid var(--prompt-surface-border);
        border-radius: 14px;
        background: var(--prompt-surface);
        transition: background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
        min-width: 0;
      }

      .prompt-item:hover,
      .prompt-item:focus-within {
        background: var(--prompt-surface-hover);
        border-color: color-mix(in srgb, var(--prompt-accent) 18%, var(--prompt-surface-border));
        box-shadow: 0 1px 0 color-mix(in srgb, var(--prompt-accent) 10%, transparent);
      }

      .prompt-item[data-armed="1"] {
        border-color: color-mix(in srgb, var(--prompt-danger) 24%, transparent);
        background: color-mix(in srgb, var(--prompt-danger-soft) 56%, var(--prompt-surface));
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
      }

      .prompt-item-head {
        min-width: 0;
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
      }

      .prompt-item-preview {
        margin: 0;
        font-size: 12.5px;
        line-height: var(--prompt-leading-loose);
        color: var(--prompt-secondary-text);
        overflow-wrap: anywhere;
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
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        flex-wrap: nowrap;
        cursor: default;
        align-self: start;
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

      .prompt-toast {
        position: absolute;
        right: 12px;
        bottom: 12px;
        max-width: calc(100% - 24px);
        padding: 9px 11px;
        border-radius: 10px;
        border: 1px solid var(--prompt-toast-border);
        background: var(--prompt-toast-bg);
        color: var(--prompt-toast-text);
        font-size: 12.5px;
        line-height: var(--prompt-leading-body);
        box-shadow: 0 10px 24px var(--prompt-toast-shadow);
        opacity: 0;
        transform: translateY(6px);
        pointer-events: none;
        transition: opacity 140ms ease, transform 180ms ease;
      }

      .prompt-toast[data-visible="1"] {
        opacity: 1;
        transform: translateY(0);
      }

      .prompt-toast[data-tone="error"] {
        background: color-mix(in srgb, var(--prompt-danger) 84%, black 16%);
        border-color: color-mix(in srgb, var(--prompt-danger) 52%, transparent);
        color: #fff7f7;
      }

      @keyframes prompt-spin {
        to {
          transform: rotate(360deg);
        }
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
        .prompt-search-shell,
        .prompt-action-button,
        .prompt-icon-button,
        .prompt-item,
        .prompt-item-main,
        .prompt-warning,
        .prompt-toast,
        .prompt-section {
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

  function createPromptLibraryUI() {
    const entryHost = document.createElement('span');
    entryHost.id = 'jumpnav-prompt-library-entry';
    entryHost.style.display = 'inline-flex';
    entryHost.style.alignItems = 'center';
    entryHost.style.height = '36px';
    entryHost.style.lineHeight = '0';
    entryHost.style.marginInlineStart = '8px';
    entryHost.style.verticalAlign = 'middle';
    entryHost.style.flex = '0 0 auto';

    const entryShadow = entryHost.attachShadow({ mode: 'open' });
    const entryRoot = createEntryRoot();
    entryShadow.appendChild(createStyleElement());
    entryShadow.appendChild(entryRoot.root);

    const panelHost = document.createElement('div');
    panelHost.id = 'jumpnav-prompt-library-panel';
    panelHost.style.position = 'fixed';
    panelHost.style.inset = '0';
    panelHost.style.zIndex = '2147483500';
    panelHost.style.pointerEvents = 'none';
    panelHost.style.display = 'block';

    const panelShadow = panelHost.attachShadow({ mode: 'open' });
    const panelRoot = createPanelRoot();
    panelShadow.appendChild(createStyleElement());
    panelShadow.appendChild(panelRoot.layer);
    (document.documentElement || document.body).appendChild(panelHost);

    const ui = {
      entryHost,
      panelHost,
      entryRoot: entryRoot.root,
      entryButton: entryRoot.button,
      panelRoot: panelRoot.layer,
      panel: panelRoot.panel,
      countText: panelRoot.countText,
      closeButton: panelRoot.closeButton,
      promptToggleButton: panelRoot.promptToggleButton,
      searchInput: panelRoot.searchInput,
      promptFormWrap: panelRoot.promptFormWrap,
      promptForm: panelRoot.promptForm,
      promptTitleInput: panelRoot.promptTitleInput,
      promptContentInput: panelRoot.promptContentInput,
      promptSaveButton: panelRoot.promptSaveButton,
      promptCancelButton: panelRoot.promptCancelButton,
      promptWarning: panelRoot.promptWarning,
      list: panelRoot.list,
      toast: panelRoot.toast
    };

    setTheme(ui, 'generic', 'light');
    setOpen(ui, false);
    return ui;
  }

  function createEntryRoot() {
    const root = document.createElement('div');
    root.className = 'prompt-ui prompt-entry';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'prompt-entry-button';
    button.setAttribute('aria-label', 'Open prompt library');

    const icon = document.createElement('span');
    icon.className = 'prompt-entry-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.appendChild(createSvgIcon('prompt'));

    const label = document.createElement('span');
    label.className = 'prompt-entry-label';
    label.textContent = 'Prompt';
    button.appendChild(icon);
    button.appendChild(label);

    root.appendChild(button);
    return { root, button };
  }

  function createPanelRoot() {
    const formSectionId = 'jumpnav-prompt-library-form';
    const layer = document.createElement('div');
    layer.className = 'prompt-ui prompt-layer';
    layer.dataset.open = '0';

    const panel = document.createElement('section');
    panel.id = 'jumpnav-prompt-library-dialog';
    panel.className = 'prompt-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-label', 'Prompt library');
    panel.setAttribute('aria-hidden', 'true');

    const header = document.createElement('div');
    header.className = 'prompt-header';

    const promptToggleButton = createIconButton('toggle-prompt-form', 'New prompt', 'plus');
    promptToggleButton.setAttribute('aria-controls', formSectionId);
    promptToggleButton.setAttribute('aria-expanded', 'false');

    const searchShell = document.createElement('label');
    searchShell.className = 'prompt-search-shell';
    const searchIcon = document.createElement('span');
    searchIcon.className = 'prompt-search-icon';
    searchIcon.setAttribute('aria-hidden', 'true');
    searchIcon.appendChild(createSvgIcon('search'));
    const searchInput = document.createElement('input');
    searchInput.className = 'prompt-search-input';
    searchInput.type = 'search';
    searchInput.placeholder = 'Search prompts';
    searchInput.setAttribute('aria-label', 'Search prompts');
    searchInput.autocomplete = 'off';
    searchShell.appendChild(searchIcon);
    searchShell.appendChild(searchInput);

    const closeButton = createIconButton('close-panel', 'Close', 'close');

    header.appendChild(promptToggleButton);
    header.appendChild(searchShell);
    header.appendChild(closeButton);

    const toolbar = document.createElement('div');
    toolbar.className = 'prompt-toolbar';

    const countText = document.createElement('div');
    countText.className = 'prompt-count';
    countText.textContent = '0 prompts';
    toolbar.appendChild(countText);

    const promptFormWrap = createExpandableSection();
    promptFormWrap.section.id = formSectionId;
    const promptForm = document.createElement('form');
    promptForm.className = 'prompt-form';
    promptForm.setAttribute('aria-busy', 'false');

    const promptTitleField = createField('Title');
    const promptTitleInput = document.createElement('input');
    promptTitleInput.className = 'prompt-input';
    promptTitleInput.type = 'text';
    promptTitleInput.name = 'title';
    promptTitleInput.placeholder = 'e.g. Weekly summary';
    promptTitleInput.autocomplete = 'off';
    promptTitleField.field.appendChild(promptTitleInput);

    const promptContentField = createField('Prompt');
    const promptContentInput = document.createElement('textarea');
    promptContentInput.className = 'prompt-textarea';
    promptContentInput.name = 'content';
    promptContentInput.placeholder = 'Write the full prompt you want to reuse.';
    promptContentField.field.appendChild(promptContentInput);

    const promptWarning = document.createElement('div');
    promptWarning.className = 'prompt-warning';
    promptWarning.dataset.visible = '0';
    promptWarning.setAttribute('role', 'status');
    promptWarning.setAttribute('aria-live', 'polite');
    promptWarning.setAttribute('aria-hidden', 'true');

    const promptFormActions = document.createElement('div');
    promptFormActions.className = 'prompt-form-actions';
    const promptCancelButton = createActionButton('Cancel', 'cancel-prompt-form');
    const promptSaveButton = createActionButton('Save', 'save-prompt');
    promptSaveButton.type = 'submit';
    promptSaveButton.dataset.tone = 'primary';
    promptFormActions.appendChild(promptCancelButton);
    promptFormActions.appendChild(promptSaveButton);

    promptForm.appendChild(promptTitleField.field);
    promptForm.appendChild(promptContentField.field);
    promptForm.appendChild(promptWarning);
    promptForm.appendChild(promptFormActions);
    promptFormWrap.inner.appendChild(promptForm);

    const list = document.createElement('div');
    list.className = 'prompt-list';
    list.setAttribute('role', 'list');

    const toast = document.createElement('div');
    toast.className = 'prompt-toast';
    toast.dataset.visible = '0';
    toast.dataset.tone = 'default';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');

    panel.appendChild(header);
    panel.appendChild(toolbar);
    panel.appendChild(promptFormWrap.section);
    panel.appendChild(list);
    panel.appendChild(toast);
    layer.appendChild(panel);

    return {
      layer,
      panel,
      countText,
      closeButton,
      promptToggleButton,
      searchInput,
      promptFormWrap: promptFormWrap.section,
      promptForm,
      promptTitleInput,
      promptContentInput,
      promptSaveButton,
      promptCancelButton,
      promptWarning,
      list,
      toast
    };
  }

  function createField(labelText) {
    const field = document.createElement('label');
    field.className = 'prompt-field';
    const label = document.createElement('span');
    label.className = 'prompt-label';
    label.textContent = labelText;
    field.appendChild(label);
    return { field, label };
  }

  function createExpandableSection() {
    const section = document.createElement('div');
    section.className = 'prompt-section';
    section.dataset.open = '0';
    const inner = document.createElement('div');
    inner.className = 'prompt-section-inner';
    section.appendChild(inner);
    return { section, inner };
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

  function mountEntry(ui, target) {
    if (!ui || !ui.entryHost) {
      return false;
    }
    if (!target || !target.container) {
      detachEntry(ui);
      return false;
    }

    const container = target.container;
    const referenceNode = target.referenceNode;

    if (target.inlineRow) {
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.flexWrap = 'nowrap';
      if (target.gap) {
        container.style.gap = target.gap;
      }
      ui.entryHost.style.marginInlineStart = target.hostMarginInlineStart || '0';
    } else {
      ui.entryHost.style.marginInlineStart = '8px';
    }

    ui.entryHost.style.alignSelf = target.hostAlignSelf || 'center';
    ui.entryHost.style.height = target.hostHeight || '36px';

    if (referenceNode && referenceNode.parentElement === container) {
      if (ui.entryHost.previousSibling !== referenceNode || ui.entryHost.parentElement !== container) {
        ui.entryHost.remove();
        referenceNode.insertAdjacentElement('afterend', ui.entryHost);
      }
      return true;
    }

    if (ui.entryHost.parentElement !== container) {
      ui.entryHost.remove();
      container.appendChild(ui.entryHost);
    }
    return true;
  }

  function detachEntry(ui) {
    if (ui && ui.entryHost && ui.entryHost.parentElement) {
      ui.entryHost.remove();
    }
  }

  function setTheme(ui, site, scheme) {
    applyThemeVars(ui.entryRoot, site, scheme);
    applyThemeVars(ui.panelRoot, site, scheme);
  }

  function applyThemeVars(root, site, scheme) {
    const safeSite = typeof site === 'string' ? site : 'generic';
    const safeScheme = scheme === 'dark' ? 'dark' : 'light';
    const vars = buildThemeVars(safeSite, safeScheme);
    root.dataset.site = safeSite;
    root.dataset.colorScheme = safeScheme;
    Object.keys(vars).forEach((key) => {
      root.style.setProperty(key, vars[key]);
    });
  }

  function buildThemeVars(site, scheme) {
    const preset = typeof ns.getUiThemePreset === 'function' ? ns.getUiThemePreset(site, scheme) : null;
    const nav = (preset && preset.nav) || {};
    const formula = (preset && preset.formula) || {};
    const fontFamilyBySite = {
      chatgpt:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI Variable", "Segoe UI", sans-serif',
      gemini: '"Google Sans Flex", "Google Sans Text", "Google Sans", Roboto, Arial, sans-serif',
      claude:
        '"Anthropic Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      generic: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    };

    const isDark = scheme === 'dark';
    const baseSurface = nav['--nav-surface'] || nav['--nav-bg'] || (isDark ? '#181b1f' : '#f9f9f9');
    const border = nav['--nav-border'] || (isDark ? '#2f343a' : '#efefef');
    const text = nav['--nav-text'] || (isDark ? '#e7eaee' : '#1f1f1f');
    const muted = nav['--nav-muted'] || (isDark ? '#a4adb7' : '#666666');
    const hover = nav['--nav-item-hover-bg'] || formula.hoverBg || (isDark ? '#242a31' : '#efefef');
    let panelBg = baseSurface;
    let itemBg = nav['--nav-item-bg'] || baseSurface;
    const activeBg = nav['--nav-item-active-bg'] || formula.activeBg || hover;
    const activeBorder = nav['--nav-item-active-border'] || border;
    const activeText =
      nav['--nav-item-active-text'] ||
      nav['--nav-item-active-color'] ||
      nav['--nav-accent-strong'] ||
      text;
    const shadow =
      nav['--nav-shadow'] || (isDark ? '0 20px 48px rgba(3, 8, 17, 0.58)' : '0 18px 42px rgba(23, 21, 16, 0.16)');
    const focusOutline = formula.outline || activeBorder;
    const focusRing = formula.ring || (isDark ? 'rgba(211, 217, 224, 0.18)' : 'rgba(31, 31, 31, 0.08)');
    let entryText = site === 'claude' ? nav['--nav-muted'] || nav['--nav-text'] || text : nav['--nav-text'] || text;
    const entryHover =
      site === 'gemini'
        ? '#F0F1F1'
        : nav['--nav-hover'] || hover;
    let promptPanelShadow = shadow;
    let promptPanelBorder = border;
    let promptInputBg = nav['--nav-button-bg'] || itemBg;
    let promptInputBorder = border;
    let promptSurface = itemBg;
    let promptSurfaceBorder = border;
    let promptSurfaceHover = hover;

    if (!isDark && site === 'gemini') {
      entryText = '#444746';
      panelBg = '#E9EEF6';
      itemBg = '#F8FAFD';
      promptPanelBorder = 'rgba(95, 111, 134, 0.16)';
      promptPanelShadow = '0 1px 2px rgba(60, 64, 67, 0.16), 0 2px 6px 2px rgba(60, 64, 67, 0.1)';
      promptInputBg = '#F8FAFD';
      promptInputBorder = '#D2D9E4';
      promptSurface = '#F8FAFD';
      promptSurfaceBorder = 'rgba(95, 111, 134, 0.14)';
      promptSurfaceHover = '#DDE4EE';
    }

    if (!isDark && site === 'claude') {
      panelBg = '#FFFFFF';
      itemBg = '#F5F4ED';
    }

    return {
      '--prompt-entry-bg': 'transparent',
      '--prompt-entry-border': 'transparent',
      '--prompt-entry-text': entryText,
      '--prompt-entry-hover': entryHover,
      '--prompt-panel-font-family': fontFamilyBySite[site] || fontFamilyBySite.generic,
      '--prompt-panel-font-size': '14px',
      '--prompt-panel-bg': panelBg,
      '--prompt-panel-border': promptPanelBorder,
      '--prompt-panel-shadow': promptPanelShadow,
      '--prompt-text': text,
      '--prompt-muted': muted,
      '--prompt-accent': activeText,
      '--prompt-accent-soft': hover,
      '--prompt-accent-strong': text,
      '--prompt-input-bg': promptInputBg,
      '--prompt-input-border': promptInputBorder,
      '--prompt-surface': promptSurface,
      '--prompt-surface-strong': panelBg,
      '--prompt-surface-border': promptSurfaceBorder,
      '--prompt-surface-hover': promptSurfaceHover,
      '--prompt-primary-bg': activeBg,
      '--prompt-primary-border': activeBorder,
      '--prompt-primary-text': activeText,
      '--prompt-secondary-text': muted,
      '--prompt-danger': isDark ? '#fda29b' : '#b42318',
      '--prompt-danger-soft': isDark ? 'rgba(253, 162, 155, 0.12)' : 'rgba(180, 35, 24, 0.08)',
      '--prompt-focus-outline': focusOutline,
      '--prompt-focus-ring': focusRing,
      '--prompt-toast-bg': formula.toastBg || (isDark ? 'rgba(24, 27, 31, 0.95)' : 'rgba(249, 249, 249, 0.97)'),
      '--prompt-toast-text': formula.toastText || text,
      '--prompt-toast-border': formula.toastBorder || border,
      '--prompt-toast-shadow': formula.toastShadow || 'rgba(23, 21, 16, 0.2)'
    };
  }

  function setOpen(ui, open) {
    ui.panelRoot.dataset.open = open ? '1' : '0';
    ui.entryButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    ui.panel.setAttribute('aria-hidden', open ? 'false' : 'true');
  }

  function positionPanel(ui, anchorRect, placement = {}) {
    if (!ui || !ui.panel || !anchorRect) {
      return;
    }

    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
    const gap = 12;
    const direction = placement && placement.direction === 'up' ? 'up' : 'down';
    const availableHeight =
      direction === 'up'
        ? Math.max(0, anchorRect.top - gap - 12)
        : Math.max(0, viewportHeight - anchorRect.bottom - gap - 12);

    const constrainedMaxHeight = Math.max(0, Math.min(720, availableHeight));
    ui.panel.style.maxHeight = `${constrainedMaxHeight}px`;

    const panelRect = ui.panel.getBoundingClientRect();
    const panelWidth = Math.min(panelRect.width || 315, Math.max(280, viewportWidth - 24));
    const fallbackHeight = Math.min(360, Math.max(96, constrainedMaxHeight));
    const panelHeight = Math.min(panelRect.height || fallbackHeight, viewportHeight - 24);
    const maxLeft = Math.max(12, viewportWidth - panelWidth - 12);
    const maxTop = Math.max(12, viewportHeight - panelHeight - 12);

    const left = clamp(anchorRect.left, 12, maxLeft);
    const top =
      direction === 'up'
        ? clamp(anchorRect.top - panelHeight - gap, 12, maxTop)
        : clamp(anchorRect.bottom + gap, 12, maxTop);
    const originY = direction === 'up' ? '100%' : '0%';
    const originX = clamp(anchorRect.left + anchorRect.width / 2 - left, 20, Math.max(20, panelWidth - 20));

    ui.panel.style.left = `${left}px`;
    ui.panel.style.top = `${top}px`;
    ui.panel.style.transformOrigin = `${originX}px ${originY}`;
  }

  function renderPrompts(ui, prompts, armedDeletePromptId, options = {}) {
    ui.list.textContent = '';
    ui.list.dataset.empty = prompts.length ? '0' : '1';
    if (!prompts.length) {
      ui.list.appendChild(createEmptyState(Boolean(options.hasQuery), options.query || ''));
      return;
    }

    prompts.forEach((prompt) => {
      ui.list.appendChild(createPromptItem(prompt, armedDeletePromptId, options));
    });
  }

  function createEmptyState(hasQuery, query) {
    const empty = document.createElement('div');
    empty.className = 'prompt-empty';

    const title = document.createElement('div');
    title.className = 'prompt-empty-title';
    title.textContent = hasQuery ? 'No matches found' : 'No prompts yet';

    const text = document.createElement('div');
    text.className = 'prompt-empty-text';
    text.textContent = hasQuery
      ? `No prompts match "${summarizeQuery(query)}". Try a shorter keyword or a broader phrase.`
      : 'Save a reusable prompt here, then click any item to insert it into the current composer.';

    empty.appendChild(title);
    empty.appendChild(text);
    return empty;
  }

  function createPromptItem(prompt, armedDeletePromptId, options = {}) {
    const query = typeof options.query === 'string' ? options.query.trim() : '';
    const busyAction = options.busyAction || '';
    const busyPromptId = options.busyPromptId || '';
    const isArmed = prompt.id === armedDeletePromptId;
    const hasBusyAction = Boolean(busyAction);
    const isCopying = busyAction === 'copy' && busyPromptId === prompt.id;
    const isDeleting = busyAction === 'delete' && busyPromptId === prompt.id;

    const item = document.createElement('article');
    item.className = 'prompt-item';
    item.dataset.promptId = prompt.id;
    item.dataset.armed = isArmed ? '1' : '0';
    item.setAttribute('role', 'listitem');

    const main = document.createElement('button');
    main.type = 'button';
    main.className = 'prompt-item-main';
    main.dataset.action = 'inject-prompt';
    main.dataset.promptId = prompt.id;
    main.disabled = hasBusyAction;
    main.setAttribute('aria-label', `Insert prompt: ${prompt.title}`);

    const head = document.createElement('div');
    head.className = 'prompt-item-head';

    const title = document.createElement('h3');
    title.className = 'prompt-item-title';
    applyHighlightedText(title, prompt.title, query);

    const actions = document.createElement('div');
    actions.className = 'prompt-item-actions';

    const copyButton = createIconButton('copy-prompt', 'Copy prompt', 'copy');
    copyButton.dataset.promptId = prompt.id;
    copyButton.dataset.busy = isCopying ? '1' : '0';
    copyButton.disabled = hasBusyAction;
    copyButton.setAttribute('aria-label', isCopying ? 'Copying prompt' : 'Copy prompt');
    copyButton.title = isCopying ? 'Copying prompt' : 'Copy prompt';

    const deleteButton = createIconButton('delete-prompt', 'Delete prompt', 'trash');
    deleteButton.dataset.promptId = prompt.id;
    deleteButton.dataset.tone = 'danger';
    deleteButton.dataset.armed = isArmed ? '1' : '0';
    deleteButton.dataset.busy = isDeleting ? '1' : '0';
    deleteButton.disabled = hasBusyAction;
    deleteButton.setAttribute('aria-label', isDeleting ? 'Deleting prompt' : isArmed ? 'Confirm delete prompt' : 'Delete prompt');
    deleteButton.title = isDeleting ? 'Deleting prompt' : isArmed ? 'Confirm delete prompt' : 'Delete prompt';

    actions.appendChild(copyButton);
    actions.appendChild(deleteButton);

    head.appendChild(title);

    const preview = document.createElement('p');
    preview.className = 'prompt-item-preview';
    applyHighlightedText(preview, prompt.content, query);

    main.appendChild(head);
    main.appendChild(preview);

    item.appendChild(main);
    item.appendChild(actions);
    return item;
  }

  function setCounts(ui, text) {
    ui.countText.textContent = text;
  }

  function setPromptFormVisible(ui, visible) {
    ui.promptFormWrap.dataset.open = visible ? '1' : '0';
    ui.promptToggleButton.dataset.active = visible ? '1' : '0';
    ui.promptToggleButton.setAttribute('aria-expanded', visible ? 'true' : 'false');
    ui.promptToggleButton.setAttribute('aria-label', visible ? 'Close prompt form' : 'New prompt');
    ui.promptToggleButton.title = visible ? 'Close prompt form' : 'New prompt';
  }

  function setDuplicateWarning(ui, text) {
    ui.promptWarning.textContent = text || '';
    ui.promptWarning.dataset.visible = text ? '1' : '0';
    ui.promptWarning.setAttribute('aria-hidden', text ? 'false' : 'true');
  }

  function setPromptFormState(ui, options = {}) {
    const saveLabel = options.saveLabel || 'Save';
    const saveLabelNode = ui.promptSaveButton.querySelector('.prompt-action-label');
    if (saveLabelNode) {
      saveLabelNode.textContent = saveLabel;
    }

    ui.promptSaveButton.disabled = Boolean(options.saveDisabled);
    ui.promptSaveButton.dataset.busy = options.saveBusy ? '1' : '0';
    ui.promptCancelButton.disabled = Boolean(options.cancelDisabled);
    ui.promptToggleButton.disabled = Boolean(options.toggleDisabled);
    ui.closeButton.disabled = Boolean(options.closeDisabled);
    ui.searchInput.disabled = Boolean(options.searchDisabled);
    ui.promptTitleInput.disabled = Boolean(options.fieldDisabled);
    ui.promptContentInput.disabled = Boolean(options.fieldDisabled);
    ui.promptForm.dataset.busy = options.saveBusy ? '1' : '0';
    ui.promptForm.setAttribute('aria-busy', options.saveBusy ? 'true' : 'false');
  }

  function showToast(ui, message, tone = 'default') {
    if (!ui || !ui.toast) {
      return;
    }
    ui.toast.textContent = message;
    ui.toast.dataset.tone = tone === 'error' ? 'error' : 'default';
    ui.toast.dataset.visible = '1';
    ui.toast.setAttribute('role', tone === 'error' ? 'alert' : 'status');
    ui.toast.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');

    window.clearTimeout(showToast._timer);
    showToast._timer = window.setTimeout(() => {
      ui.toast.dataset.visible = '0';
    }, 1600);
  }

  function destroy(ui) {
    if (!ui) {
      return;
    }
    if (ui.entryHost && ui.entryHost.parentElement) {
      ui.entryHost.remove();
    }
    if (ui.panelHost && ui.panelHost.parentElement) {
      ui.panelHost.remove();
    }
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function applyHighlightedText(node, text, query) {
    node.textContent = '';
    const source = typeof text === 'string' ? text : '';
    const normalizedQuery = typeof query === 'string' ? query.trim() : '';
    if (!normalizedQuery) {
      node.textContent = source;
      return;
    }

    const lowerSource = source.toLowerCase();
    const lowerQuery = normalizedQuery.toLowerCase();
    let cursor = 0;

    while (cursor < source.length) {
      const matchIndex = lowerSource.indexOf(lowerQuery, cursor);
      if (matchIndex === -1) {
        node.appendChild(document.createTextNode(source.slice(cursor)));
        break;
      }

      if (matchIndex > cursor) {
        node.appendChild(document.createTextNode(source.slice(cursor, matchIndex)));
      }

      const mark = document.createElement('mark');
      mark.textContent = source.slice(matchIndex, matchIndex + normalizedQuery.length);
      node.appendChild(mark);
      cursor = matchIndex + normalizedQuery.length;
    }
  }

  function summarizeQuery(query) {
    const normalized = typeof query === 'string' ? query.trim() : '';
    if (!normalized) {
      return 'this search';
    }
    return normalized.length > 32 ? `${normalized.slice(0, 29)}...` : normalized;
  }

  ns.promptLibraryUi = Object.assign({}, ns.promptLibraryUi, {
    createPromptLibraryUI,
    mountEntry,
    detachEntry,
    setTheme,
    setOpen,
    positionPanel,
    renderPrompts,
    setCounts,
    setPromptFormVisible,
    setDuplicateWarning,
    setPromptFormState,
    showToast,
    destroy
  });
  window.ChatGptNav = ns;
})();
