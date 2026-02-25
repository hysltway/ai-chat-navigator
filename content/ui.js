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

  function createStyleElement() {
    const style = document.createElement('style');
    style.textContent = ns.UI_STYLE_TEXT || '';
    return style;
  }

  function createUI() {
    const container = document.createElement('div');
    container.id = 'chatgpt-nav-root';
    const shadow = container.attachShadow({ mode: 'open' });
    const style = createStyleElement();
    const root = createRootElement();
    const panelElements = createPanelElements();
    const previewElements = createPreviewElements();
    const fab = createFabButton();

    root.appendChild(panelElements.panel);
    root.appendChild(previewElements.preview);
    root.appendChild(fab);

    shadow.appendChild(style);
    shadow.appendChild(root);
    document.body.appendChild(container);

    return {
      container,
      root,
      panel: panelElements.panel,
      bodyWrap: panelElements.bodyWrap,
      body: panelElements.body,
      title: panelElements.title,
      subtitle: panelElements.subtitle,
      toggle: panelElements.toggle,
      minimalToggle: panelElements.minimalToggle,
      themeToggle: panelElements.themeToggle,
      preview: previewElements.preview,
      previewInner: previewElements.previewInner,
      fab
    };
  }

  function createRootElement() {
    const root = document.createElement('div');
    root.className = 'nav-root';
    root.dataset.collapsed = '0';
    root.dataset.adaptiveMinimal = '0';
    root.dataset.colorScheme = 'light';
    root.dataset.site = getSiteKey();
    return root;
  }

  function createPanelElements() {
    const panel = document.createElement('div');
    panel.className = 'panel';
    const headerElements = createPanelHeaderElements();
    const bodyElements = createPanelBodyElements();
    panel.appendChild(headerElements.header);
    panel.appendChild(bodyElements.bodyWrap);
    return {
      panel,
      bodyWrap: bodyElements.bodyWrap,
      body: bodyElements.body,
      title: headerElements.title,
      subtitle: headerElements.subtitle,
      toggle: headerElements.toggle,
      minimalToggle: headerElements.minimalToggle,
      themeToggle: headerElements.themeToggle
    };
  }

  function createPanelHeaderElements() {
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
    const themeToggle = createToggleButton(
      'panel-toggle panel-toggle-theme',
      THEME_TOGGLE_ICONS.dark,
      'Switch to Dark mode'
    );
    const minimalToggle = createToggleButton('panel-toggle panel-toggle-minimal', MINIMAL_LABEL, MINIMAL_LABEL);
    minimalToggle.setAttribute('aria-pressed', 'false');
    const toggle = createToggleButton('panel-toggle', HIDE_LABEL, HIDE_LABEL);
    actions.appendChild(themeToggle);
    actions.appendChild(minimalToggle);
    actions.appendChild(toggle);
    header.appendChild(titleWrap);
    header.appendChild(actions);
    return { header, title, subtitle, toggle, minimalToggle, themeToggle };
  }

  function createToggleButton(className, text, ariaLabel) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = text;
    button.setAttribute('aria-label', ariaLabel);
    return button;
  }

  function createPanelBodyElements() {
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
    return { bodyWrap, body };
  }

  function createPreviewElements() {
    const preview = document.createElement('div');
    preview.className = 'nav-preview';
    preview.dataset.active = '0';
    preview.dataset.index = '';
    const previewInner = document.createElement('div');
    previewInner.className = 'nav-preview-inner';
    preview.appendChild(previewInner);
    return { preview, previewInner };
  }

  function createFabButton() {
    const fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'fab';
    fab.textContent = 'Nav';
    return fab;
  }

  function renderList(ui, messages, options = {}) {
    const minimalMode = Boolean(options.minimalMode);
    ui.body.textContent = '';
    ui.subtitle.textContent = `Prompts: ${messages.length}`;
    if (!messages.length) {
      ui.body.appendChild(createEmptyStateItem(minimalMode));
      return;
    }
    messages.forEach((message, index) => {
      ui.body.appendChild(createMessageItem(message, index, minimalMode));
    });
  }

  function createEmptyStateItem(minimalMode) {
    const empty = document.createElement('div');
    empty.className = 'nav-empty';
    if (!minimalMode) {
      empty.textContent = 'No prompts found yet.';
      return empty;
    }
    const words = ['No', 'prompts', 'found', 'yet.'];
    words.forEach((word) => {
      const span = document.createElement('span');
      span.textContent = word;
      empty.appendChild(span);
    });
    return empty;
  }

  function createMessageItem(message, index, minimalMode) {
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.dataset.index = String(index);
    item.tabIndex = 0;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', minimalMode ? `Prompt ${index + 1}` : message.title || `Prompt ${index + 1}`);
    item.title = minimalMode ? `Prompt ${index + 1}` : message.text;
    if (minimalMode) {
      const minimal = document.createElement('div');
      minimal.className = 'nav-item-minimal';
      minimal.textContent = `${index + 1}`;
      item.appendChild(minimal);
      return item;
    }
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
    return item;
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
    syncPreviewContent(ui, message, index);
    const layout = getPreviewLayout(ui.panel.getBoundingClientRect(), item.getBoundingClientRect(), options);
    applyPreviewLayout(ui, layout);
    ui.preview.dataset.active = '1';
  }

  function syncPreviewContent(ui, message, index) {
    if (ui.preview.dataset.index === index) {
      return;
    }
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

  function getPreviewLayout(panelRect, itemRect, options = {}) {
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
    const maxTop = Math.max(8, window.innerHeight - 8);
    const top = Math.min(Math.max(8, itemRect.top), maxTop);
    const overlay = !canAvoidContent && Number.isFinite(protectedRight) && left < minLeft;
    return {
      overlay: overlay ? '1' : '0',
      width: `${Math.max(minWidth, width)}px`,
      left: `${left}px`,
      top: `${top}px`
    };
  }

  function applyPreviewLayout(ui, layout) {
    ui.preview.dataset.overlay = layout.overlay;
    ui.preview.style.setProperty('--preview-width', layout.width);
    ui.preview.style.left = layout.left;
    ui.preview.style.right = 'auto';
    ui.preview.style.top = layout.top;
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
    if (host === 'claude.ai') {
      return 'claude';
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
