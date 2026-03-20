(() => {
  'use strict';

  const ns = window.ChatGptNav || {};

  if (!ns.promptLibraryStore || !ns.promptLibrarySite || !ns.promptLibraryUi) {
    return;
  }

  const PROMPT_LIBRARY_BOOT_FLAG = 'jumpnavPromptLibraryInjected';
  const ROUTE_POLL_MS = 1200;
  const ENVIRONMENT_SYNC_DEBOUNCE_MS = 140;

  const state = {
    started: false,
    booted: false,
    store: null,
    siteApi: null,
    ui: null,
    library: null,
    siteId: 'generic',
    colorScheme: 'light',
    open: false,
    mounted: false,
    url: location.href,
    filter: {
      query: ''
    },
    promptFormVisible: false,
    duplicateWarning: '',
    duplicateConfirmToken: '',
    pendingDeleteKind: '',
    pendingDeleteId: '',
    pendingDeleteTimer: null,
    environmentSyncTimer: null,
    environmentObserver: null,
    themeObserver: null,
    panelResizeObserver: null,
    routePollTimer: null,
    positionRaf: null
  };

  function start() {
    if (state.started) {
      return;
    }
    state.started = true;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot, { once: true });
    } else {
      boot();
    }
  }

  async function boot() {
    if (state.booted || document.documentElement.dataset[PROMPT_LIBRARY_BOOT_FLAG] === '1') {
      return;
    }

    document.documentElement.dataset[PROMPT_LIBRARY_BOOT_FLAG] = '1';
    state.booted = true;

    state.store = ns.promptLibraryStore.createPromptLibraryStore({
      storageApi: ns.storage
    });
    state.siteApi = ns.promptLibrarySite.createPromptLibrarySiteApi();
    state.ui = ns.promptLibraryUi.createPromptLibraryUI();

    bindUiEvents();
    bindGlobalEvents();

    state.library = await state.store.read();
    state.siteId = state.siteApi.getCurrentSiteId();
    state.colorScheme = state.siteApi.getColorScheme(state.siteId);
    ns.promptLibraryUi.setTheme(state.ui, state.siteId, state.colorScheme);

    render();
    syncEnvironment();
    startObservers();
    startRoutePolling();
    attachStorageListener();
  }

  function bindUiEvents() {
    state.ui.entryButton.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
    });

    state.ui.entryButton.addEventListener('click', (event) => {
      event.stopPropagation();
      if (!state.open) {
        syncEnvironment();
      }
      setOpen(!state.open);
    });

    state.ui.closeButton.addEventListener('click', () => {
      setOpen(false);
    });

    state.ui.promptToggleButton.addEventListener('click', () => {
      clearPendingDelete();
      togglePromptForm();
    });

    state.ui.searchInput.addEventListener('input', () => {
      clearPendingDelete();
      state.filter.query = state.ui.searchInput.value || '';
      render();
    });

    state.ui.list.addEventListener('click', (event) => {
      const actionNode = event.target.closest('[data-action]');
      if (!actionNode) {
        return;
      }

      const action = actionNode.dataset.action || '';
      const promptId = actionNode.dataset.promptId || actionNode.closest('[data-prompt-id]')?.dataset.promptId || '';
      if (!promptId) {
        return;
      }

      if (action === 'copy-prompt') {
        handleCopyPrompt(promptId);
        return;
      }

      if (action === 'delete-prompt') {
        handleDeletePrompt(promptId);
        return;
      }

      if (action === 'inject-prompt') {
        handleInjectPrompt(promptId);
      }
    });

    state.ui.promptForm.addEventListener('submit', (event) => {
      event.preventDefault();
      handleSavePrompt();
    });

    state.ui.promptCancelButton.addEventListener('click', () => {
      clearPendingDelete();
      closePromptForm();
    });

    state.ui.promptTitleInput.addEventListener('input', clearDuplicateReminder);
    state.ui.promptContentInput.addEventListener('input', clearDuplicateReminder);
  }

  function bindGlobalEvents() {
    document.addEventListener(
      'pointerdown',
      (event) => {
        if (!state.open) {
          return;
        }
        if (isEventInsideUi(event)) {
          return;
        }
        setOpen(false);
      },
      true
    );

    document.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Escape' && state.open) {
          setOpen(false);
        }
      },
      true
    );

    window.addEventListener('resize', () => {
      schedulePosition();
    });

    window.addEventListener(
      'scroll',
      () => {
        schedulePosition();
      },
      true
    );
  }

  function startObservers() {
    if (state.environmentObserver) {
      state.environmentObserver.disconnect();
    }
    state.environmentObserver = new MutationObserver(() => {
      scheduleEnvironmentSync();
    });

    if (document.body) {
      state.environmentObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    if (state.themeObserver) {
      state.themeObserver.disconnect();
    }
    state.themeObserver = new MutationObserver(() => {
      scheduleEnvironmentSync();
    });

    if (document.documentElement) {
      state.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: state.siteApi.THEME_ATTRIBUTE_FILTER
      });
    }
    if (document.body) {
      state.themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: state.siteApi.THEME_ATTRIBUTE_FILTER
      });
    }

    if (typeof window.matchMedia === 'function') {
      const colorSchemeMql = window.matchMedia('(prefers-color-scheme: dark)');
      if (typeof colorSchemeMql.addEventListener === 'function') {
        colorSchemeMql.addEventListener('change', scheduleEnvironmentSync);
      } else if (typeof colorSchemeMql.addListener === 'function') {
        colorSchemeMql.addListener(scheduleEnvironmentSync);
      }
    }

    if (state.panelResizeObserver) {
      state.panelResizeObserver.disconnect();
    }
    if (typeof ResizeObserver === 'function' && state.ui && state.ui.panel) {
      state.panelResizeObserver = new ResizeObserver(() => {
        if (state.open) {
          schedulePosition();
        }
      });
      state.panelResizeObserver.observe(state.ui.panel);
    }
  }

  function startRoutePolling() {
    if (state.routePollTimer) {
      return;
    }
    state.routePollTimer = window.setInterval(() => {
      if (location.href === state.url) {
        return;
      }
      state.url = location.href;
      scheduleEnvironmentSync();
    }, ROUTE_POLL_MS);
  }

  function scheduleEnvironmentSync() {
    if (state.environmentSyncTimer) {
      window.clearTimeout(state.environmentSyncTimer);
    }
    state.environmentSyncTimer = window.setTimeout(() => {
      state.environmentSyncTimer = null;
      syncEnvironment();
    }, ENVIRONMENT_SYNC_DEBOUNCE_MS);
  }

  function syncEnvironment() {
    if (!state.ui || !state.siteApi) {
      return;
    }

    state.siteId = state.siteApi.getCurrentSiteId();
    state.colorScheme = state.siteApi.getColorScheme(state.siteId);
    ns.promptLibraryUi.setTheme(state.ui, state.siteId, state.colorScheme);

    const mounted = ns.promptLibraryUi.mountEntry(state.ui, state.siteApi.findMountTarget(state.siteId));
    state.mounted = Boolean(mounted && state.ui.entryHost.isConnected);

    if (!state.mounted && state.open) {
      setOpen(false);
      return;
    }

    if (state.open) {
      schedulePosition();
    }
  }

  function render() {
    if (!state.library || !state.ui) {
      return;
    }

    const prompts = state.store.filterPrompts(state.library, state.filter).map(buildPromptViewModel);

    ns.promptLibraryUi.renderPrompts(state.ui, prompts, state.pendingDeleteKind === 'prompt' ? state.pendingDeleteId : '', {
      hasQuery: Boolean((state.filter.query || '').trim())
    });
    ns.promptLibraryUi.setCounts(state.ui, buildCountText(prompts.length, state.library.prompts.length));
    ns.promptLibraryUi.setPromptFormVisible(state.ui, state.promptFormVisible);
    ns.promptLibraryUi.setDuplicateWarning(state.ui, state.duplicateWarning);
    schedulePosition();
  }

  function buildCountText(filteredCount, totalCount) {
    const hasFilter = Boolean((state.filter.query || '').trim());
    if (!hasFilter) {
      return `${totalCount} ${totalCount === 1 ? 'prompt' : 'prompts'}`;
    }
    return `${filteredCount} / ${totalCount} prompts`;
  }

  function buildPromptViewModel(prompt) {
    return {
      id: prompt.id,
      title: prompt.title,
      content: prompt.content
    };
  }

  function setOpen(open) {
    if (open) {
      syncEnvironment();
      if (!state.mounted) {
        return;
      }
      if (state.ui.panelHost && !state.ui.panelHost.isConnected) {
        (document.documentElement || document.body).appendChild(state.ui.panelHost);
      }
    }

    state.open = Boolean(open);
    ns.promptLibraryUi.setOpen(state.ui, state.open);

    if (!state.open) {
      resetPanelEphemeralState();
      return;
    }

    schedulePosition();
    window.setTimeout(() => {
      if (state.open) {
        state.ui.searchInput.focus();
      }
    }, 40);
  }

  function schedulePosition() {
    if (!state.open || !state.mounted) {
      return;
    }
    if (state.positionRaf) {
      return;
    }
    state.positionRaf = window.requestAnimationFrame(() => {
      state.positionRaf = null;
      if (!state.open || !state.ui.entryHost.isConnected) {
        return;
      }
      const placement =
        state.siteApi && typeof state.siteApi.getPanelPlacement === 'function'
          ? state.siteApi.getPanelPlacement(state.siteId)
          : { direction: 'down', anchor: 'top-left', mode: 'new' };
      ns.promptLibraryUi.positionPanel(state.ui, state.ui.entryButton.getBoundingClientRect(), placement);
    });
  }

  function togglePromptForm() {
    if (state.promptFormVisible) {
      closePromptForm();
      return;
    }

    state.promptFormVisible = true;
    clearDuplicateReminder();
    resetPromptForm();
    render();

    window.setTimeout(() => {
      state.ui.promptTitleInput.focus();
    }, 50);
  }

  function closePromptForm() {
    state.promptFormVisible = false;
    clearDuplicateReminder();
    clearPendingDelete();
    render();
  }

  function resetPromptForm() {
    state.ui.promptTitleInput.value = '';
    state.ui.promptContentInput.value = '';
  }

  function clearDuplicateReminder() {
    state.duplicateWarning = '';
    state.duplicateConfirmToken = '';
    ns.promptLibraryUi.setDuplicateWarning(state.ui, '');
  }

  async function handleSavePrompt() {
    clearPendingDelete();

    const title = normalizeTitle(state.ui.promptTitleInput.value);
    const content = normalizeContent(state.ui.promptContentInput.value);

    if (!title || !content) {
      ns.promptLibraryUi.showToast(state.ui, 'Title and prompt are required.', 'error');
      return;
    }

    const duplicateToken = title.toLowerCase();
    const hasDuplicateTitle = state.store.hasDuplicateTitle(state.library, title);
    if (hasDuplicateTitle && state.duplicateConfirmToken !== duplicateToken) {
      state.duplicateConfirmToken = duplicateToken;
      state.duplicateWarning = 'A prompt with this title already exists. Click save again to keep both.';
      ns.promptLibraryUi.setDuplicateWarning(state.ui, state.duplicateWarning);
      return;
    }

    const result = await state.store.createPrompt({
      title,
      content
    });

    state.library = result.library;
    state.promptFormVisible = false;
    clearDuplicateReminder();
    render();
    ns.promptLibraryUi.showToast(
      state.ui,
      hasDuplicateTitle ? 'Prompt saved. A prompt with the same title already exists.' : 'Prompt saved.'
    );
  }

  async function handleDeletePrompt(promptId) {
    const prompt = findPromptById(promptId);
    if (!prompt) {
      return;
    }

    if (!isPendingDelete('prompt', promptId)) {
      armDelete('prompt', promptId, `Click again to delete "${prompt.title}"`);
      return;
    }

    clearPendingDelete();
    state.library = await state.store.deletePrompt(promptId);
    render();
    ns.promptLibraryUi.showToast(state.ui, 'Prompt deleted.');
  }

  function handleInjectPrompt(promptId) {
    clearPendingDelete();

    const prompt = findPromptById(promptId);
    if (!prompt) {
      return;
    }

    const result = state.siteApi.insertPromptContent(prompt.content, state.siteId);
    if (!result.ok) {
      ns.promptLibraryUi.showToast(state.ui, `Insert failed: ${result.reason}`, 'error');
      return;
    }

    setOpen(false);
  }

  async function handleCopyPrompt(promptId) {
    clearPendingDelete();

    const prompt = findPromptById(promptId);
    if (!prompt) {
      return;
    }

    const copyResult = await writeClipboard(prompt.content);
    if (!copyResult.ok) {
      ns.promptLibraryUi.showToast(state.ui, `Copy failed: ${copyResult.reason}`, 'error');
      return;
    }

    state.library = await state.store.markCopied(promptId);
    ns.promptLibraryUi.showToast(state.ui, 'Prompt copied.');
  }

  function findPromptById(promptId) {
    return state.library.prompts.find((prompt) => prompt.id === promptId) || null;
  }

  function isPendingDelete(kind, id) {
    return Boolean(kind && id && state.pendingDeleteKind === kind && state.pendingDeleteId === id);
  }

  function armDelete(kind, id, message) {
    clearPendingDelete();
    state.pendingDeleteKind = kind;
    state.pendingDeleteId = id;
    render();
    ns.promptLibraryUi.showToast(state.ui, message || 'Click again to confirm deletion.', 'error');
    state.pendingDeleteTimer = window.setTimeout(() => {
      clearPendingDelete(true);
    }, 2200);
  }

  function clearPendingDelete(shouldRender) {
    if (state.pendingDeleteTimer) {
      window.clearTimeout(state.pendingDeleteTimer);
      state.pendingDeleteTimer = null;
    }

    const changed = Boolean(state.pendingDeleteKind || state.pendingDeleteId);
    state.pendingDeleteKind = '';
    state.pendingDeleteId = '';
    if (changed && shouldRender) {
      render();
    }
  }

  function resetPanelEphemeralState() {
    const hadVisibleState = state.promptFormVisible;
    const hadPendingDelete = Boolean(state.pendingDeleteKind || state.pendingDeleteId);
    state.promptFormVisible = false;
    clearDuplicateReminder();
    clearPendingDelete(false);
    if (hadVisibleState || hadPendingDelete) {
      render();
    }
  }

  async function writeClipboard(text) {
    if (!text) {
      return { ok: false, reason: 'Nothing to copy.' };
    }

    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        return { ok: true, reason: '' };
      }
    } catch (error) {
      const fallback = await fallbackCopy(text);
      if (fallback.ok) {
        return fallback;
      }
      return {
        ok: false,
        reason: normalizeCopyError(error) || fallback.reason
      };
    }

    return fallbackCopy(text);
  }

  async function fallbackCopy(text) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      textarea.style.inset = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand('copy');
      textarea.remove();
      if (copied) {
        return { ok: true, reason: '' };
      }
      return { ok: false, reason: 'Browser blocked clipboard access.' };
    } catch (error) {
      return {
        ok: false,
        reason: normalizeCopyError(error) || 'Browser blocked clipboard access.'
      };
    }
  }

  function normalizeCopyError(error) {
    if (!error) {
      return '';
    }
    if (typeof error.message === 'string' && error.message.trim()) {
      return error.message.trim();
    }
    return 'Browser blocked clipboard access.';
  }

  function attachStorageListener() {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.onChanged) {
      return;
    }

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'local' || !changes[state.store.STORAGE_KEY]) {
        return;
      }

      const nextValue = changes[state.store.STORAGE_KEY].newValue;
      state.library = state.store.normalizeLibrary(nextValue, () => new Date().toISOString());
      render();
    });
  }

  function isEventInsideUi(event) {
    if (!event || typeof event.composedPath !== 'function') {
      return false;
    }
    const path = event.composedPath();
    return path.includes(state.ui.entryHost) || path.includes(state.ui.panelHost);
  }

  function normalizeTitle(value) {
    if (typeof value !== 'string') {
      return '';
    }
    return value.replace(/\s+/g, ' ').trim();
  }

  function normalizeContent(value) {
    if (typeof value !== 'string') {
      return '';
    }
    return value.replace(/\r\n/g, '\n').trim();
  }

  ns.promptLibrary = Object.assign({}, ns.promptLibrary, {
    start
  });
  window.ChatGptNav = ns;
})();
