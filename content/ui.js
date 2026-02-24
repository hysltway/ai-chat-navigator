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
        --nav-bg: #f4f7fc;
        --nav-surface: #ffffff;
        --nav-border: #dbe3ef;
        --nav-text: #162033;
        --nav-muted: #64748b;
        --nav-accent: #dfe9f8;
        --nav-accent-strong: #2f5f9a;
        --nav-hover: #eef4ff;
        --nav-accent-shadow: rgba(43, 90, 153, 0.14);
        --nav-item-bg: #f8fbff;
        --nav-item-hover-bg: #f0f6ff;
        --nav-item-active-bg: #e8f1ff;
        --nav-item-hover-border: #cfdcf1;
        --nav-item-active-border: #b8cceb;
        --nav-item-active-text: #203a66;
        --nav-item-indicator-color: #3f6fb1;
        --nav-item-active-color: #2d4f84;
        --nav-item-active-shadow: rgba(34, 76, 132, 0.14);
        --nav-control-hover-border: #c9d8ef;
        --nav-control-hover-text: #244772;
        --nav-control-active-border: #a9c4e8;
        --nav-control-active-bg: #e5effd;
        --nav-control-active-text: #1e3d66;
        --nav-shadow: 0 14px 34px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.05);
        --nav-button-bg: #ffffff;
        --nav-active-text: #203a66;
        --nav-panel-offset: 88px;
        --nav-panel-max-height: calc(100vh - 176px);
        font-family: "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif;
      }

      .nav-root[data-color-scheme="light"][data-site="chatgpt"] {
        --nav-bg: #f7f8fa;
        --nav-surface: #fcfdff;
        --nav-border: #dfe4eb;
        --nav-text: #1f2937;
        --nav-muted: #687385;
        --nav-accent: #e6ebf2;
        --nav-accent-strong: #334155;
        --nav-hover: #f1f4f8;
        --nav-item-bg: #f7f9fc;
        --nav-item-hover-bg: #eef3f9;
        --nav-item-active-bg: #e7edf7;
        --nav-item-hover-border: #d7dfeb;
        --nav-item-active-border: #c5d2e6;
        --nav-item-active-text: #253449;
        --nav-item-indicator-color: #3f5b82;
        --nav-item-active-color: #2f4766;
        --nav-item-active-shadow: rgba(47, 71, 102, 0.14);
        --nav-control-hover-border: #ccd7e6;
        --nav-control-hover-text: #334a68;
        --nav-control-active-border: #b7c8df;
        --nav-control-active-bg: #e2eaf7;
        --nav-control-active-text: #2f4766;
        --nav-shadow: 0 14px 34px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.05);
        --nav-button-bg: #fcfdff;
      }

      .nav-root[data-color-scheme="light"][data-site="gemini"] {
        --nav-bg: #f2f6fd;
        --nav-surface: #f9fbff;
        --nav-border: #d2ddec;
        --nav-text: #1d2b3f;
        --nav-muted: #5a6e88;
        --nav-accent: #dbe8fb;
        --nav-accent-strong: #1f57a6;
        --nav-hover: #e8f0fd;
        --nav-item-bg: #eef4fd;
        --nav-item-hover-bg: #e2ecfb;
        --nav-item-active-bg: #d7e6fb;
        --nav-item-hover-border: #c5d8f4;
        --nav-item-active-border: #aac7ef;
        --nav-item-active-text: #17478f;
        --nav-item-indicator-color: #2b67be;
        --nav-item-active-color: #1d57ab;
        --nav-item-active-shadow: rgba(28, 88, 171, 0.18);
        --nav-control-hover-border: #bcd3f3;
        --nav-control-hover-text: #225aa8;
        --nav-control-active-border: #9fc0ea;
        --nav-control-active-bg: #d9e8fb;
        --nav-control-active-text: #174b95;
        --nav-shadow: 0 14px 36px rgba(31, 71, 129, 0.17), 0 2px 8px rgba(31, 71, 129, 0.08);
        --nav-button-bg: #f8fbff;
      }

      .nav-root[data-color-scheme="dark"] {
        --nav-bg: #0f1620;
        --nav-surface: #141e2a;
        --nav-border: #253447;
        --nav-text: #e5edf7;
        --nav-muted: #9db0c6;
        --nav-accent: #223448;
        --nav-accent-strong: #7bb8ff;
        --nav-hover: #1b2838;
        --nav-accent-shadow: rgba(104, 170, 244, 0.2);
        --nav-item-bg: #192636;
        --nav-item-hover-bg: #223247;
        --nav-item-active-bg: #263a52;
        --nav-item-hover-border: #355271;
        --nav-item-active-border: #4f79a8;
        --nav-item-active-text: #eff6ff;
        --nav-item-indicator-color: #7fb8f5;
        --nav-item-active-color: #9dcbff;
        --nav-item-active-shadow: rgba(77, 121, 168, 0.28);
        --nav-control-hover-border: #4b6f97;
        --nav-control-hover-text: #b6d8ff;
        --nav-control-active-border: #6a95c7;
        --nav-control-active-bg: rgba(106, 149, 199, 0.24);
        --nav-control-active-text: #edf5ff;
        --nav-shadow: 0 20px 48px rgba(3, 8, 17, 0.58), 0 2px 10px rgba(3, 8, 17, 0.35);
        --nav-button-bg: #182434;
        --nav-active-text: #e7f2ff;
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

      .panel-body {
        flex: 1 1 auto;
        min-height: 0;
        overflow: auto;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background: var(--nav-surface);
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
      }

      .nav-root[data-minimal="1"] .nav-item {
        width: 32px;
        height: 32px;
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

    const empty = document.createElement('div');
    empty.className = 'nav-empty';
    empty.textContent = 'No prompts found yet.';

    body.appendChild(empty);

    panel.appendChild(header);
    panel.appendChild(body);

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
