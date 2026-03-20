(() => {
  'use strict';

  const ns = window.ChatGptNav;

  let state;
  let config;
  let callbacks;
  let MANUAL_NAV_SCROLL_LOCK_MS;
  let FAB_RIGHT_OFFSET;
  let FAB_VERTICAL_PADDING;
  let windowRef;
  let documentRef;
  let locationRef;

  function initNavigationApi(ctx) {
    ({
      state,
      config,
      callbacks,
      MANUAL_NAV_SCROLL_LOCK_MS,
      FAB_RIGHT_OFFSET,
      FAB_VERTICAL_PADDING
    } = ctx);

    windowRef = ctx.windowRef || window;
    documentRef = ctx.documentRef || document;
    locationRef = ctx.locationRef || location;
  }

  function attachUiHandlers() {
    state.ui.toggle.addEventListener('click', () => {
      callbacks.setCollapsed(true);
    });

    state.ui.themeToggle.addEventListener('click', (event) => {
      callbacks.handleThemeToggle(event);
    });

    state.ui.minimalToggle.addEventListener('click', () => {
      const nextMinimal = !state.effectiveMinimalMode;
      if (state.adaptiveMinimalMode) {
        state.manualModeOverride = true;
        state.adaptiveMinimalMode = false;
        if (ns.ui.setAdaptiveMinimal) {
          ns.ui.setAdaptiveMinimal(state.ui, false);
        }
      }
      callbacks.setMinimalMode(nextMinimal);
    });

    state.ui.fab.addEventListener('click', () => {
      if (state.ui.fab.dataset.suppressClick === '1') {
        state.ui.fab.dataset.suppressClick = '0';
        return;
      }
      callbacks.setCollapsed(false);
    });

    state.ui.body.addEventListener('click', (event) => {
      const item = event.target.closest('.nav-item');
      if (!item) {
        return;
      }
      activateNavItem(item);
    });
    state.ui.body.addEventListener('keydown', handleItemKeydown);

    state.ui.body.addEventListener('pointerover', callbacks.handleItemPointerOver);
    state.ui.body.addEventListener('pointerout', callbacks.handleItemPointerOut);
    state.ui.body.addEventListener('focusin', callbacks.handleItemFocusIn);
    state.ui.body.addEventListener('focusout', callbacks.handleItemFocusOut);
    state.ui.body.addEventListener('scroll', callbacks.scheduleMinimalScrollHintUpdate, { passive: true });
    state.ui.panel.addEventListener('wheel', handlePanelWheel, { passive: false });

    state.ui.preview.addEventListener('pointerenter', callbacks.handlePreviewPointerEnter);
    state.ui.preview.addEventListener('pointerleave', callbacks.handlePreviewPointerLeave);
    state.ui.preview.addEventListener('click', callbacks.handlePreviewClick);
  }

  function handleItemKeydown(event) {
    if (!event) {
      return;
    }
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }
    const item = event.target && event.target.closest ? event.target.closest('.nav-item') : null;
    if (!item || !state.ui.body.contains(item)) {
      return;
    }
    event.preventDefault();
    activateNavItem(item);
  }

  function activateNavItem(item) {
    if (!item) {
      return;
    }
    const index = Number(item.dataset.index);
    const message = state.messages[index];
    if (!message || !message.node) {
      return;
    }
    state.suppressEnsureVisibleUntil = Date.now() + MANUAL_NAV_SCROLL_LOCK_MS;
    callbacks.setActiveIndex(index, true);
    callbacks.snapNavListToEdge(index);
    callbacks.scrollToMessage(message.node);
  }

  function handlePanelWheel(event) {
    if (!state.ui || !state.ui.body) {
      return;
    }
    const scroller = state.ui.body;
    const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    if (maxScroll <= 1) {
      return;
    }
    const before = scroller.scrollTop;
    scroller.scrollTop += event.deltaY;
    if (scroller.scrollTop !== before) {
      event.preventDefault();
      callbacks.scheduleMinimalScrollHintUpdate();
    }
  }

  function initFabDrag() {
    const fab = state.ui.fab;
    const storageKey = 'chatgpt-nav-fab-position';
    let dragging = false;
    let moved = false;
    let startY = 0;
    let startTop = 0;

    const initialTop = fab.getBoundingClientRect().top;
    applyFabPosition(fab, initialTop);
    loadFabPosition(storageKey).then((saved) => {
      if (!saved || typeof saved.top !== 'number') {
        return;
      }
      applyFabPosition(fab, saved.top);
    });

    windowRef.addEventListener('resize', () => {
      const rect = fab.getBoundingClientRect();
      applyFabPosition(fab, rect.top);
    });

    fab.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) {
        return;
      }
      const rect = fab.getBoundingClientRect();
      dragging = true;
      moved = false;
      startY = event.clientY;
      startTop = rect.top;
      fab.classList.add('dragging');
      fab.setPointerCapture(event.pointerId);
    });

    fab.addEventListener('pointermove', (event) => {
      if (!dragging) {
        return;
      }
      const dy = event.clientY - startY;
      if (!moved && Math.abs(dy) > 3) {
        moved = true;
      }
      applyFabPosition(fab, startTop + dy);
    });

    fab.addEventListener('pointerup', (event) => {
      if (!dragging) {
        return;
      }
      dragging = false;
      fab.classList.remove('dragging');
      fab.releasePointerCapture(event.pointerId);
      if (moved) {
        fab.dataset.suppressClick = '1';
        saveFabPosition(storageKey, fab);
      }
    });

    fab.addEventListener('pointercancel', (event) => {
      if (!dragging) {
        return;
      }
      dragging = false;
      fab.classList.remove('dragging');
      fab.releasePointerCapture(event.pointerId);
    });
  }

  function applyFabPosition(fab, top) {
    const clampedTop = getClampedFabTop(fab, top);
    fab.style.left = 'auto';
    fab.style.top = `${clampedTop}px`;
    fab.style.right = `${FAB_RIGHT_OFFSET}px`;
    fab.style.bottom = 'auto';
  }

  function getClampedFabTop(fab, top) {
    const rect = fab.getBoundingClientRect();
    const height = rect.height > 0 ? rect.height : 48;
    const minTop = FAB_VERTICAL_PADDING;
    const maxTop = Math.max(minTop, windowRef.innerHeight - height - FAB_VERTICAL_PADDING);
    return clamp(top, minTop, maxTop);
  }

  function saveFabPosition(key, fab) {
    const rect = fab.getBoundingClientRect();
    const payload = { top: rect.top };
    if (ns.storage && typeof ns.storage.setJson === 'function') {
      ns.storage.setJson(key, payload);
    }
    try {
      windowRef.localStorage.setItem(key, JSON.stringify(payload));
    } catch (error) {
      // Ignore storage failures.
    }
  }

  function loadFabPosition(key) {
    const legacyValue = loadLegacyFabPosition(key);
    if (!ns.storage || typeof ns.storage.getJson !== 'function') {
      return Promise.resolve(legacyValue);
    }
    return ns.storage
      .getJson(key)
      .then((storedValue) => {
        const normalized = normalizeFabPosition(storedValue);
        if (normalized) {
          return normalized;
        }
        if (legacyValue) {
          ns.storage.setJson(key, legacyValue);
        }
        return legacyValue;
      })
      .catch(() => legacyValue);
  }

  function loadLegacyFabPosition(key) {
    try {
      const raw = windowRef.localStorage.getItem(key);
      if (!raw) {
        return null;
      }
      return normalizeFabPosition(raw);
    } catch (error) {
      return null;
    }
  }

  function normalizeFabPosition(value) {
    let parsed = value;
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch (error) {
        return null;
      }
    }
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    if (typeof parsed.top !== 'number') {
      return null;
    }
    return { top: parsed.top };
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function startUrlPolling() {
    if (state.pollTimer) {
      return;
    }
    state.pollTimer = windowRef.setInterval(() => {
      if (callbacks.ensureUiMounted) {
        callbacks.ensureUiMounted();
      }
      if (locationRef.href !== state.url) {
        handleRouteChange('poll');
      }
    }, config.pollMs);
  }

  function handleRouteChange(source) {
    state.url = locationRef.href;
    callbacks.refreshThemeTrackingTargets();
    callbacks.syncColorScheme();
    callbacks.cancelPendingBubbleHighlight();
    state.signature = '';
    state.messages = [];
    state.conversationIndexReady = false;
    state.conversationIndexUrl = '';
    state.activeIndex = null;
    callbacks.renderMessages();
    if (state.observer) {
      state.observer.disconnect();
      state.observer = null;
    }
    state.root = null;
    scheduleRebuild(source);
  }

  function scheduleRebuild(reason) {
    if (state.rebuildTimer) {
      clearTimeout(state.rebuildTimer);
    }
    state.rebuildTimer = setTimeout(() => {
      state.rebuildTimer = null;
      callbacks.rebuild(reason);
    }, config.debounceMs);
  }

  function handlePotentialRouteChange(source) {
    if (locationRef.href !== state.url) {
      handleRouteChange(source);
    }
  }

  function hydrateMinimalModePreference() {
    Promise.resolve(callbacks.loadMinimalMode()).then((storedValue) => {
      if (typeof storedValue !== 'boolean') {
        return;
      }
      if (storedValue === state.minimalMode) {
        return;
      }
      state.minimalMode = storedValue;
      callbacks.syncAdaptiveMode(true);
    });
  }

  ns.coreNavigationController = {
    initNavigationApi,
    attachUiHandlers,
    initFabDrag,
    startUrlPolling,
    handleRouteChange,
    scheduleRebuild,
    handlePotentialRouteChange,
    hydrateMinimalModePreference
  };
})();
