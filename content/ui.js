(() => {
  'use strict';

  const ns = window.ChatGptNav;
  const MINIMAL_LABEL = 'Minimal';
  const MINIMAL_LABEL_SHORT = 'M';
  const HIDE_LABEL = 'Hide';
  const HIDE_LABEL_SHORT = 'H';
  const THEME_TOGGLE_ICONS = {
    dark: '🌙',
    light: '☀'
  };

  function createUI() {
    const container = document.createElement('div');
    container.id = 'chatgpt-nav-root';
    const shadow = container.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      .nav-root, .nav-root * {
        box-sizing: border-box;
      }

      .nav-root {
        position: fixed;
        inset: 0;
        z-index: 2147483000;
        pointer-events: none;
        --nav-bg: #f9f9f9;
        --nav-surface: #f9f9f9;
        --nav-border: #efefef;
        --nav-text: #1f1f1f;
        --nav-muted: #666666;
        --nav-accent: #efefef;
        --nav-accent-strong: #1f1f1f;
        --nav-hover: #efefef;
        --nav-accent-shadow: rgba(0, 0, 0, 0.06);
        --nav-item-bg: #f4f4f4;
        --nav-item-hover-bg: #efefef;
        --nav-item-active-bg: #eaeaea;
        --nav-item-hover-border: #efefef;
        --nav-item-active-border: #eaeaea;
        --nav-item-active-text: #1f1f1f;
        --nav-item-indicator-color: #1f1f1f;
        --nav-item-active-color: #1f1f1f;
        --nav-item-active-shadow: rgba(0, 0, 0, 0.06);
        --nav-control-hover-border: #efefef;
        --nav-control-hover-text: #1f1f1f;
        --nav-control-active-border: #eaeaea;
        --nav-control-active-bg: #eaeaea;
        --nav-control-active-text: #1f1f1f;
        --nav-shadow: 0 18px 42px rgba(23, 21, 16, 0.16);
        --nav-button-bg: #f9f9f9;
        --nav-active-text: #1f1f1f;
        --nav-scrollbar-size: 10px;
        --nav-scrollbar-track: rgba(31, 31, 31, 0.06);
        --nav-scrollbar-thumb: rgba(31, 31, 31, 0.22);
        --nav-scrollbar-thumb-hover: rgba(31, 31, 31, 0.34);
        --nav-scrollbar-thumb-active: rgba(31, 31, 31, 0.44);
        --nav-panel-offset: 88px;
        --nav-panel-max-height: calc(100vh - 176px);
        font-family: "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif;
      }

      .nav-root[data-color-scheme="light"][data-site="chatgpt"] {
        --nav-bg: #f9f9f9;
        --nav-surface: #f9f9f9;
        --nav-border: #efefef;
        --nav-text: #1f1f1f;
        --nav-muted: #666666;
        --nav-accent: #efefef;
        --nav-accent-strong: #1f1f1f;
        --nav-hover: #efefef;
        --nav-item-bg: #f4f4f4;
        --nav-item-hover-bg: #efefef;
        --nav-item-active-bg: #eaeaea;
        --nav-item-hover-border: #efefef;
        --nav-item-active-border: #eaeaea;
        --nav-item-active-text: #1f1f1f;
        --nav-item-indicator-color: #1f1f1f;
        --nav-item-active-color: #1f1f1f;
        --nav-item-active-shadow: rgba(0, 0, 0, 0.06);
        --nav-control-hover-border: #efefef;
        --nav-control-hover-text: #1f1f1f;
        --nav-control-active-border: #eaeaea;
        --nav-control-active-bg: #eaeaea;
        --nav-control-active-text: #1f1f1f;
        --nav-button-bg: #f9f9f9;
      }

      .nav-root[data-color-scheme="light"][data-site="gemini"] {
        --nav-bg: #f3f6fc;
        --nav-surface: #f3f6fc;
        --nav-border: #dce1e9;
        --nav-text: #1f2a3d;
        --nav-muted: #546377;
        --nav-accent: #dce1e9;
        --nav-accent-strong: #0842a0;
        --nav-hover: #dce1e9;
        --nav-item-bg: #e9eef6;
        --nav-item-hover-bg: #dce1e9;
        --nav-item-active-bg: #d3e3fd;
        --nav-item-hover-border: #dce1e9;
        --nav-item-active-border: #d3e3fd;
        --nav-item-active-text: #0842a0;
        --nav-item-indicator-color: #0842a0;
        --nav-item-active-color: #0842a0;
        --nav-item-active-shadow: rgba(8, 66, 160, 0.16);
        --nav-control-hover-border: #dce1e9;
        --nav-control-hover-text: #0842a0;
        --nav-control-active-border: #d3e3fd;
        --nav-control-active-bg: #d3e3fd;
        --nav-control-active-text: #0842a0;
        --nav-button-bg: #f3f6fc;
      }

      .nav-root[data-color-scheme="dark"] {
        --nav-bg: #121417;
        --nav-surface: #181b1f;
        --nav-border: #2f343a;
        --nav-text: #e7eaee;
        --nav-muted: #a4adb7;
        --nav-accent: #2a3037;
        --nav-accent-strong: #c9d0d8;
        --nav-hover: #242a31;
        --nav-accent-shadow: rgba(170, 178, 187, 0.18);
        --nav-item-bg: #21262c;
        --nav-item-hover-bg: #2a3037;
        --nav-item-active-bg: #303740;
        --nav-item-hover-border: #4a545f;
        --nav-item-active-border: #66727d;
        --nav-item-active-text: #f1f4f7;
        --nav-item-indicator-color: #d3d9e0;
        --nav-item-active-color: #e5eaf0;
        --nav-item-active-shadow: rgba(10, 12, 15, 0.38);
        --nav-control-hover-border: #4f5964;
        --nav-control-hover-text: #e1e6eb;
        --nav-control-active-border: #6d7883;
        --nav-control-active-bg: rgba(160, 169, 178, 0.18);
        --nav-control-active-text: #f1f4f7;
        --nav-shadow: 0 20px 48px rgba(3, 8, 17, 0.58), 0 2px 10px rgba(3, 8, 17, 0.35);
        --nav-button-bg: #22272e;
        --nav-active-text: #f0f4f8;
        --nav-scrollbar-track: rgba(232, 236, 241, 0.1);
        --nav-scrollbar-thumb: rgba(232, 236, 241, 0.34);
        --nav-scrollbar-thumb-hover: rgba(232, 236, 241, 0.48);
        --nav-scrollbar-thumb-active: rgba(232, 236, 241, 0.62);
      }

      .panel {
        position: fixed;
        top: var(--nav-panel-offset);
        right: 16px;
        width: 280px;
        max-height: var(--nav-panel-max-height);
        height: auto;
        display: flex;
        flex-direction: column;
        pointer-events: auto;
        background: var(--nav-surface);
        border: 1px solid var(--nav-border);
        border-radius: 16px;
        box-shadow: var(--nav-shadow);
        overflow: hidden;
      }

      .panel-header {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 12px 14px 10px 14px;
        border-bottom: 1px solid var(--nav-border);
        background: var(--nav-surface);
      }

      .panel-title {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .panel-title strong {
        font-size: 14px;
        letter-spacing: 0.3px;
        color: var(--nav-text);
      }

      .panel-title span {
        font-size: 12px;
        color: var(--nav-muted);
      }

      .panel-actions {
        display: flex;
        gap: 6px;
        align-items: center;
        justify-content: flex-start;
        flex-wrap: nowrap;
        width: 100%;
      }

      .panel-toggle {
        border: 1px solid var(--nav-border);
        background: var(--nav-button-bg);
        color: var(--nav-text);
        font-size: 12px;
        border-radius: 999px;
        padding: 6px 10px;
        cursor: pointer;
        white-space: nowrap;
      }

      .panel-toggle:hover {
        border-color: var(--nav-control-hover-border);
        color: var(--nav-control-hover-text);
        background: var(--nav-hover);
      }

      .panel-toggle.is-active {
        border-color: var(--nav-control-active-border);
        background: var(--nav-control-active-bg);
        color: var(--nav-control-active-text);
      }

      .panel-toggle-theme {
        width: 32px;
        height: 32px;
        min-width: 32px;
        padding: 0;
        border-radius: 999px;
        text-align: center;
        font-size: 15px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .panel-body-wrap {
        position: relative;
        display: flex;
        flex-direction: column;
        flex: 1 1 auto;
        min-height: 0;
        overflow: hidden;
        background: var(--nav-surface);
      }

      .panel-body {
        flex: 1 1 auto;
        min-height: 0;
        max-height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
        scrollbar-width: thin;
        scrollbar-color: var(--nav-scrollbar-thumb) var(--nav-scrollbar-track);
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: var(--nav-surface);
      }

      .panel-body::-webkit-scrollbar {
        width: var(--nav-scrollbar-size);
      }

      .panel-body::-webkit-scrollbar-track {
        background: var(--nav-scrollbar-track);
        border-radius: 999px;
      }

      .panel-body::-webkit-scrollbar-thumb {
        background: var(--nav-scrollbar-thumb);
        border-radius: 999px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }

      .panel-body::-webkit-scrollbar-thumb:hover {
        background: var(--nav-scrollbar-thumb-hover);
        background-clip: padding-box;
      }

      .panel-body::-webkit-scrollbar-thumb:active {
        background: var(--nav-scrollbar-thumb-active);
        background-clip: padding-box;
      }

      .scroll-hint {
        position: absolute;
        left: 0;
        right: 0;
        height: 20px;
        opacity: 0;
        pointer-events: none;
        transition: opacity 180ms ease;
        z-index: 2;
      }

      .scroll-hint::before {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--nav-surface);
      }

      .scroll-hint-top {
        top: 0;
      }

      .scroll-hint-top::before {
        -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
        mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
      }

      .scroll-hint-bottom {
        bottom: 0;
      }

      .scroll-hint-bottom::before {
        -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
        mask-image: linear-gradient(to top, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
      }

      .nav-item {
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid transparent;
        background: var(--nav-item-bg);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 4px;
        position: relative;
        transition: border-color 160ms ease, background-color 160ms ease, box-shadow 220ms ease,
          transform 160ms ease;
      }

      .nav-item:hover {
        border-color: var(--nav-item-hover-border);
        background: var(--nav-item-hover-bg);
        box-shadow: 0 6px 16px var(--nav-item-active-shadow);
        transform: translateY(-1px);
      }

      .nav-item.is-active {
        border-color: var(--nav-item-active-border);
        background: var(--nav-item-active-bg);
        box-shadow: 0 6px 16px var(--nav-item-active-shadow);
        transform: none;
      }

      .nav-item.is-active::after {
        content: '';
        position: absolute;
        right: -2px;
        top: -2px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--nav-item-indicator-color);
        box-shadow: 0 0 0 2px var(--nav-surface);
      }

      .nav-item.is-active .nav-item-title,
      .nav-item.is-active .nav-item-preview,
      .nav-item.is-active .nav-item-minimal {
        color: var(--nav-item-active-text);
      }

      .nav-root[data-minimal="1"] .nav-item {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 6px 8px;
        gap: 0;
      }

      .nav-item-title {
        font-size: 13px;
        color: var(--nav-text);
        font-weight: 600;
        line-height: 1.35;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .nav-item-preview {
        font-size: 12px;
        color: var(--nav-muted);
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .nav-item-minimal {
        font-size: 11px;
        color: var(--nav-muted);
        letter-spacing: 0.9px;
        text-transform: uppercase;
      }

      .nav-empty {
        font-size: 12px;
        color: var(--nav-muted);
        text-align: center;
        margin-top: 24px;
      }

      .nav-root[data-minimal="1"] .nav-empty {
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: center;
        margin-top: 12px;
      }

      .nav-root[data-minimal="1"] .nav-empty span {
        display: block;
        line-height: 1.2;
        letter-spacing: 0.6px;
        text-transform: uppercase;
      }

      .nav-root[data-collapsed="1"] .panel {
        display: none;
      }

      .nav-root[data-collapsed="0"] .fab {
        display: none;
      }

      .nav-root[data-minimal="1"] .panel {
        width: max-content;
        max-width: 70vw;
        top: var(--nav-panel-offset);
        transform: none;
      }

      .nav-root[data-minimal="1"] .panel-header {
        padding: 8px;
        align-items: center;
      }

      .nav-root[data-minimal="1"] .panel-title {
        display: none;
      }

      .nav-root[data-minimal="1"] .panel-actions {
        gap: 4px;
        flex-direction: column;
        align-items: center;
      }

      .nav-root[data-minimal="1"] .panel-toggle {
        padding: 4px 6px;
        font-size: 11px;
        letter-spacing: 0.6px;
      }

      .nav-root[data-minimal="1"] .panel-toggle-theme {
        min-width: 0;
        width: 28px;
        height: 28px;
        padding: 0;
        font-size: 13px;
      }

      .nav-root[data-minimal="1"] .panel-body {
        padding: 8px;
        gap: 8px;
        width: max-content;
        align-items: center;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      .nav-root[data-minimal="1"] .panel-body::-webkit-scrollbar {
        width: 0;
        height: 0;
        display: none;
      }

      .nav-root[data-minimal="1"] .panel-body-wrap[data-scrollable="1"][data-scroll-top="1"] .scroll-hint-top,
      .nav-root[data-minimal="1"] .panel-body-wrap[data-scrollable="1"][data-scroll-bottom="1"] .scroll-hint-bottom {
        opacity: 1;
      }

      .nav-root[data-minimal="1"] .nav-item {
        width: 32px;
        height: 32px;
        min-width: 32px;
        min-height: 32px;
        flex: 0 0 32px;
        padding: 0;
        border-radius: 999px;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 0;
      }

      .nav-root[data-minimal="1"] .nav-item.is-active {
        border-color: var(--nav-item-active-border);
        background: var(--nav-item-active-bg);
        box-shadow: 0 0 0 1px var(--nav-item-active-border);
      }

      .nav-root[data-minimal="1"] .nav-item.is-active .nav-item-minimal {
        color: var(--nav-item-active-text);
        font-weight: 700;
      }

      .fab {
        position: fixed;
        right: 16px;
        top: calc(var(--nav-panel-offset) + 12px);
        width: 48px;
        height: 48px;
        border-radius: 999px;
        border: 1px solid var(--nav-border);
        background: var(--nav-surface);
        color: var(--nav-text);
        box-shadow: var(--nav-shadow);
        cursor: pointer;
        pointer-events: auto;
        font-size: 12px;
        letter-spacing: 0.4px;
        cursor: grab;
      }

      .fab:hover {
        border-color: var(--nav-accent-strong);
        color: var(--nav-accent-strong);
        background: var(--nav-hover);
      }

      .fab.dragging {
        cursor: grabbing;
      }

      .nav-preview {
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        max-width: 360px;
        opacity: 0;
        transform: translateX(12px);
        pointer-events: none;
        transition: width 180ms ease, opacity 160ms ease, transform 180ms ease;
        will-change: width, opacity, transform;
        z-index: 3;
        overflow: hidden;
      }

      .nav-preview[data-active="1"] {
        width: var(--preview-width, 260px);
        opacity: 1;
        transform: translateX(0);
        pointer-events: auto;
      }

      .nav-preview-inner {
        background: var(--nav-surface);
        border: 1px solid var(--nav-border);
        border-radius: 14px;
        box-shadow: var(--nav-shadow);
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .nav-root[data-minimal="1"] .nav-preview-inner {
        box-shadow: none;
      }

      @media (prefers-reduced-motion: reduce) {
        .nav-preview {
          transition-duration: 0ms;
        }
      }
    `;

    const root = document.createElement('div');
    root.className = 'nav-root';
    root.dataset.collapsed = '0';
    root.dataset.adaptiveMinimal = '0';
    root.dataset.colorScheme = 'light';
    root.dataset.site = getSiteKey();

    const panel = document.createElement('div');
    panel.className = 'panel';

    const header = document.createElement('div');
    header.className = 'panel-header';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'panel-title';
    const title = document.createElement('strong');
    title.textContent = 'ChatGPT Navigator';
    const subtitle = document.createElement('span');
    subtitle.textContent = 'Prompts: 0';
    titleWrap.appendChild(title);
    titleWrap.appendChild(subtitle);

    const actions = document.createElement('div');
    actions.className = 'panel-actions';

    const themeToggle = document.createElement('button');
    themeToggle.type = 'button';
    themeToggle.className = 'panel-toggle panel-toggle-theme';
    themeToggle.textContent = THEME_TOGGLE_ICONS.dark;
    themeToggle.setAttribute('aria-label', 'Switch to Dark mode');

    const minimalToggle = document.createElement('button');
    minimalToggle.type = 'button';
    minimalToggle.className = 'panel-toggle panel-toggle-minimal';
    minimalToggle.textContent = MINIMAL_LABEL;
    minimalToggle.setAttribute('aria-pressed', 'false');
    minimalToggle.setAttribute('aria-label', MINIMAL_LABEL);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'panel-toggle';
    toggle.textContent = HIDE_LABEL;
    toggle.setAttribute('aria-label', HIDE_LABEL);

    actions.appendChild(themeToggle);
    actions.appendChild(minimalToggle);
    actions.appendChild(toggle);

    header.appendChild(titleWrap);
    header.appendChild(actions);

    const body = document.createElement('div');
    body.className = 'panel-body';
    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'panel-body-wrap';
    bodyWrap.dataset.scrollable = '0';
    bodyWrap.dataset.scrollTop = '0';
    bodyWrap.dataset.scrollBottom = '0';
    const scrollHintTop = document.createElement('div');
    scrollHintTop.className = 'scroll-hint scroll-hint-top';
    const scrollHintBottom = document.createElement('div');
    scrollHintBottom.className = 'scroll-hint scroll-hint-bottom';

    const empty = document.createElement('div');
    empty.className = 'nav-empty';
    empty.textContent = 'No prompts found yet.';

    body.appendChild(empty);
    bodyWrap.appendChild(body);
    bodyWrap.appendChild(scrollHintTop);
    bodyWrap.appendChild(scrollHintBottom);

    panel.appendChild(header);
    panel.appendChild(bodyWrap);

    const preview = document.createElement('div');
    preview.className = 'nav-preview';
    preview.dataset.active = '0';
    preview.dataset.index = '';

    const previewInner = document.createElement('div');
    previewInner.className = 'nav-preview-inner';
    preview.appendChild(previewInner);

    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'fab';
    fab.textContent = 'Nav';

    root.appendChild(panel);
    root.appendChild(preview);
    root.appendChild(fab);

    shadow.appendChild(style);
    shadow.appendChild(root);
    document.body.appendChild(container);

    return {
      container,
      root,
      panel,
      bodyWrap,
      body,
      title,
      subtitle,
      toggle,
      minimalToggle,
      themeToggle,
      preview,
      previewInner,
      fab
    };
  }

  function renderList(ui, messages, options = {}) {
    const minimalMode = Boolean(options.minimalMode);
    ui.body.textContent = '';

    ui.subtitle.textContent = `Prompts: ${messages.length}`;

    if (!messages.length) {
      const empty = document.createElement('div');
      empty.className = 'nav-empty';
      if (minimalMode) {
        const words = ['No', 'prompts', 'found', 'yet.'];
        words.forEach((word) => {
          const span = document.createElement('span');
          span.textContent = word;
          empty.appendChild(span);
        });
      } else {
        empty.textContent = 'No prompts found yet.';
      }
      ui.body.appendChild(empty);
      return;
    }

    messages.forEach((message, index) => {
      const item = document.createElement('div');
      item.className = 'nav-item';
      item.dataset.index = String(index);
      item.tabIndex = 0;
      item.setAttribute('role', 'button');
      item.setAttribute(
        'aria-label',
        minimalMode ? `Prompt ${index + 1}` : message.title || `Prompt ${index + 1}`
      );
      item.title = minimalMode ? `Prompt ${index + 1}` : message.text;

      if (minimalMode) {
        const minimal = document.createElement('div');
        minimal.className = 'nav-item-minimal';
        minimal.textContent = `${index + 1}`;
        item.appendChild(minimal);
      } else {
        const title = document.createElement('div');
        title.className = 'nav-item-title';
        title.textContent = message.title;

        item.appendChild(title);

        if (message.preview) {
          const preview = document.createElement('div');
          preview.className = 'nav-item-preview';
          preview.textContent = message.preview;
          item.appendChild(preview);
        }
      }

      ui.body.appendChild(item);
    });
  }

  function setCollapsed(ui, collapsed) {
    ui.root.dataset.collapsed = collapsed ? '1' : '0';
  }

  function setMinimalMode(ui, enabled) {
    ui.root.dataset.minimal = enabled ? '1' : '0';
    ui.minimalToggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    ui.minimalToggle.classList.toggle('is-active', enabled);
    ui.minimalToggle.textContent = enabled ? MINIMAL_LABEL_SHORT : MINIMAL_LABEL;
    ui.toggle.textContent = enabled ? HIDE_LABEL_SHORT : HIDE_LABEL;
    ui.minimalToggle.setAttribute('aria-label', MINIMAL_LABEL);
    ui.toggle.setAttribute('aria-label', HIDE_LABEL);
    setThemeToggle(ui, ui.root.dataset.colorScheme || 'light');
  }

  function setAdaptiveMinimal(ui, enabled) {
    ui.root.dataset.adaptiveMinimal = enabled ? '1' : '0';
    if (enabled) {
      ui.minimalToggle.title = 'Adaptive minimal mode is active';
    } else {
      ui.minimalToggle.removeAttribute('title');
    }
  }

  function setThemeToggle(ui, colorScheme) {
    if (!ui || !ui.themeToggle) {
      return;
    }
    const normalized = colorScheme === 'dark' ? 'dark' : 'light';
    const nextScheme = normalized === 'dark' ? 'light' : 'dark';
    const nextModeLabel = nextScheme === 'dark' ? 'Dark' : 'Light';
    const nextIcon = THEME_TOGGLE_ICONS[nextScheme];
    ui.themeToggle.dataset.nextScheme = nextScheme;
    ui.themeToggle.textContent = nextIcon;
    ui.themeToggle.setAttribute('aria-label', `Switch to ${nextModeLabel} mode`);
    ui.themeToggle.title = `Switch to ${nextModeLabel} mode`;
  }

  function setColorScheme(ui, colorScheme) {
    const normalized = colorScheme === 'dark' ? 'dark' : 'light';
    ui.root.dataset.colorScheme = normalized;
    setThemeToggle(ui, normalized);
  }

  function setActiveIndex(ui, index) {
    const activeIndex = Number.isFinite(index) ? index : null;
    const items = ui.body.querySelectorAll('.nav-item');
    items.forEach((item) => {
      const itemIndex = Number(item.dataset.index);
      const isActive = activeIndex !== null && itemIndex === activeIndex;
      item.classList.toggle('is-active', isActive);
      if (isActive) {
        item.setAttribute('aria-current', 'true');
      } else {
        item.removeAttribute('aria-current');
      }
    });
  }

  function showPreview(ui, message, item, options = {}) {
    if (!message || !item) {
      return;
    }
    const index = String(item.dataset.index || '');
    if (ui.preview.dataset.index !== index) {
      ui.previewInner.textContent = '';
      const title = document.createElement('div');
      title.className = 'nav-item-title';
      title.textContent = message.title;
      ui.previewInner.appendChild(title);

      if (message.preview) {
        const previewText = document.createElement('div');
        previewText.className = 'nav-item-preview';
        previewText.textContent = message.preview;
        ui.previewInner.appendChild(previewText);
      }
      ui.preview.dataset.index = index;
    }

    const panelRect = ui.panel.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    const gap = 12;
    const viewportPadding = 8;
    const minWidth = 180;
    const maxWidth = Math.min(360, Math.floor(window.innerWidth * 0.56));
    const protectedRight = Number.isFinite(options.contentRight)
      ? Math.max(0, Math.floor(options.contentRight))
      : null;
    const minLeft = Number.isFinite(protectedRight)
      ? Math.max(viewportPadding, protectedRight + gap)
      : viewportPadding;

    const safeAvailable = panelRect.left - gap - minLeft;
    const canAvoidContent = Number.isFinite(safeAvailable) && safeAvailable >= minWidth;
    let width = canAvoidContent ? Math.min(maxWidth, Math.floor(safeAvailable)) : minWidth;
    if (!Number.isFinite(width) || width <= 0) {
      width = minWidth;
    }

    let left = panelRect.left - gap - width;
    if (canAvoidContent && left < minLeft) {
      left = minLeft;
    }
    const viewportRight = window.innerWidth - viewportPadding;
    const maxLeft = Math.max(viewportPadding, viewportRight - width);
    left = Math.min(Math.max(viewportPadding, left), maxLeft);

    const overlapsContent = !canAvoidContent && Number.isFinite(protectedRight) && left < minLeft;
    ui.preview.dataset.overlay = overlapsContent ? '1' : '0';
    ui.preview.style.setProperty('--preview-width', `${Math.max(minWidth, width)}px`);
    ui.preview.style.left = `${left}px`;
    ui.preview.style.right = 'auto';

    const maxTop = Math.max(8, window.innerHeight - 8);
    const top = Math.min(Math.max(8, itemRect.top), maxTop);
    ui.preview.style.top = `${top}px`;

    ui.preview.dataset.active = '1';
  }

  function hidePreview(ui, keepContent = false) {
    ui.preview.dataset.active = '0';
    if (!keepContent) {
      ui.preview.dataset.index = '';
      ui.previewInner.textContent = '';
    }
  }

  function setTitle(ui, text) {
    ui.title.textContent = text;
  }

  function getSiteKey() {
    const host = location.hostname;
    if (host === 'gemini.google.com') {
      return 'gemini';
    }
    return 'chatgpt';
  }

  ns.ui = {
    createUI,
    renderList,
    setCollapsed,
    setMinimalMode,
    setAdaptiveMinimal,
    setThemeToggle,
    setColorScheme,
    setActiveIndex,
    showPreview,
    hidePreview,
    setTitle
  };
})();
