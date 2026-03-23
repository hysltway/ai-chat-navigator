(() => {
  'use strict';

  const ns = window.ChatGptNav || {};
  const uiStyle = ns.promptLibraryUiStyle || {};

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
    const entryHover = site === 'gemini' ? '#F0F1F1' : nav['--nav-hover'] || hover;
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

    if (!isDark && site === 'chatgpt') {
      panelBg = '#FFFFFF';
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
      '--prompt-focus-ring': focusRing
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

  function renderPrompts(ui, prompts, options = {}) {
    ui.list.textContent = '';

    if (!prompts.length) {
      const shouldShowEmptyState = !options.hideEmptyState;
      ui.list.dataset.empty = shouldShowEmptyState ? '1' : '0';
      if (shouldShowEmptyState) {
        ui.list.appendChild(createEmptyState(Boolean(options.hasQuery), options.query || ''));
      }
      return;
    }

    ui.list.dataset.empty = '0';
    prompts.forEach((prompt) => {
      ui.list.appendChild(createPromptItem(prompt, options));
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

  function createPromptItem(prompt, options = {}) {
    const query = typeof options.query === 'string' ? options.query.trim() : '';
    const busyAction = options.busyAction || '';
    const busyPromptId = options.busyPromptId || '';
    const hasBusyAction = Boolean(busyAction);
    const isCopying = busyAction === 'copy' && busyPromptId === prompt.id;
    const isDeleting = busyAction === 'delete' && busyPromptId === prompt.id;

    const item = document.createElement('article');
    item.className = 'prompt-item';
    item.dataset.promptId = prompt.id;
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

    const copyButton = uiStyle.createIconButton('copy-prompt', 'Copy prompt', 'copy');
    copyButton.dataset.promptId = prompt.id;
    copyButton.dataset.busy = isCopying ? '1' : '0';
    copyButton.disabled = hasBusyAction;
    copyButton.setAttribute('aria-label', isCopying ? 'Copying prompt' : 'Copy prompt');
    copyButton.title = isCopying ? 'Copying prompt' : 'Copy prompt';

    const deleteButton = uiStyle.createIconButton('delete-prompt', 'Delete prompt', 'trash');
    deleteButton.dataset.promptId = prompt.id;
    deleteButton.dataset.tone = 'danger';
    deleteButton.dataset.busy = isDeleting ? '1' : '0';
    deleteButton.disabled = hasBusyAction;
    deleteButton.setAttribute('aria-label', isDeleting ? 'Deleting prompt' : 'Delete prompt');
    deleteButton.title = isDeleting ? 'Deleting prompt' : 'Delete prompt';

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
    const nextState = visible ? '1' : '0';
    const hasChanged = ui.panel.dataset.formOpen !== nextState;
    ui.promptFormWrap.dataset.open = visible ? '1' : '0';
    ui.panel.dataset.formOpen = nextState;
    ui.promptToggleButton.dataset.active = visible ? '1' : '0';
    ui.promptToggleButton.setAttribute('aria-expanded', visible ? 'true' : 'false');
    ui.promptToggleButton.setAttribute('aria-label', visible ? 'Close prompt form' : 'New prompt');
    ui.promptToggleButton.title = visible ? 'Close prompt form' : 'New prompt';
    if (hasChanged && !visible) {
      ui.panel.scrollTop = 0;
    }
  }

  function setDuplicateWarning(ui, text) {
    const warningText = text || '';
    const visible = Boolean(warningText);
    ui.promptWarning.textContent = warningText;
    ui.promptWarning.hidden = !visible;
    ui.promptWarning.setAttribute('aria-hidden', visible ? 'false' : 'true');
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

  ns.promptLibraryUiRender = Object.assign({}, ns.promptLibraryUiRender, {
    setTheme,
    setOpen,
    positionPanel,
    renderPrompts,
    setCounts,
    setPromptFormVisible,
    setDuplicateWarning,
    setPromptFormState,
    destroy
  });
  window.ChatGptNav = ns;
})();
