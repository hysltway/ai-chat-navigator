import { ns } from './namespace';
import type {
  CoreNavigationConfig,
  CoreNavigationControllerApi,
  CoreState,
  NavigationApiContext,
  NavigationCallbacks
} from './types';

interface FabPosition {
  top: number;
}

let state: CoreState;
let config: CoreNavigationConfig;
let callbacks: NavigationCallbacks;
let MANUAL_NAV_SCROLL_LOCK_MS = 0;
let FAB_RIGHT_OFFSET = 0;
let FAB_VERTICAL_PADDING = 0;
let windowRef: Window = window;
let documentRef: Document = document;
let locationRef: Location = location;

function initNavigationApi(ctx: NavigationApiContext): void {
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

function attachUiHandlers(): void {
  if (!state.ui) {
    return;
  }

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
      ns.ui?.setAdaptiveMinimal?.(state.ui!, false);
    }
    callbacks.setMinimalMode(nextMinimal);
  });

  state.ui.fab.addEventListener('click', () => {
    if (state.ui && state.ui.fab.dataset.suppressClick === '1') {
      state.ui.fab.dataset.suppressClick = '0';
      return;
    }
    callbacks.setCollapsed(false);
  });

  state.ui.body.addEventListener('click', (event) => {
    const item = getNavItemFromEventTarget(event.target);
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

function getNavItemFromEventTarget(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) {
    return null;
  }
  const item = target.closest('.nav-item');
  return item instanceof HTMLElement ? item : null;
}

function handleItemKeydown(event: KeyboardEvent): void {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return;
  }
  const item = getNavItemFromEventTarget(event.target);
  if (!item || !state.ui?.body.contains(item)) {
    return;
  }
  event.preventDefault();
  activateNavItem(item);
}

function activateNavItem(item: HTMLElement): void {
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

function handlePanelWheel(event: WheelEvent): void {
  if (!state.ui?.body) {
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

function initFabDrag(): void {
  if (!state.ui) {
    return;
  }

  const fab = state.ui.fab;
  const storageKey = 'chatgpt-nav-fab-position';
  let dragging = false;
  let moved = false;
  let startY = 0;
  let startTop = 0;

  const initialTop = fab.getBoundingClientRect().top;
  applyFabPosition(fab, initialTop);
  void loadFabPosition(storageKey).then((saved) => {
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

function applyFabPosition(fab: HTMLElement, top: number): void {
  const clampedTop = getClampedFabTop(fab, top);
  fab.style.left = 'auto';
  fab.style.top = `${clampedTop}px`;
  fab.style.right = `${FAB_RIGHT_OFFSET}px`;
  fab.style.bottom = 'auto';
}

function getClampedFabTop(fab: HTMLElement, top: number): number {
  const rect = fab.getBoundingClientRect();
  const height = rect.height > 0 ? rect.height : 48;
  const minTop = FAB_VERTICAL_PADDING;
  const maxTop = Math.max(minTop, windowRef.innerHeight - height - FAB_VERTICAL_PADDING);
  return clamp(top, minTop, maxTop);
}

function saveFabPosition(key: string, fab: HTMLElement): void {
  const rect = fab.getBoundingClientRect();
  const payload: FabPosition = { top: rect.top };
  if (ns.storage && typeof ns.storage.setJson === 'function') {
    void ns.storage.setJson(key, payload);
  }
  try {
    windowRef.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore storage failures.
  }
}

function loadFabPosition(key: string): Promise<FabPosition | null> {
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
        void ns.storage?.setJson(key, legacyValue);
      }
      return legacyValue;
    })
    .catch(() => legacyValue);
}

function loadLegacyFabPosition(key: string): FabPosition | null {
  try {
    const raw = windowRef.localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return normalizeFabPosition(raw);
  } catch {
    return null;
  }
}

function normalizeFabPosition(value: unknown): FabPosition | null {
  let parsed = value;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }
  const top = (parsed as { top?: unknown }).top;
  if (typeof top !== 'number') {
    return null;
  }
  return { top };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function startUrlPolling(): void {
  if (state.pollTimer) {
    return;
  }
  state.pollTimer = windowRef.setInterval(() => {
    callbacks.ensureUiMounted();
    if (locationRef.href !== state.url) {
      handleRouteChange('poll');
    }
  }, config.pollMs);
}

function handleRouteChange(source: string): void {
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

function scheduleRebuild(reason: string): void {
  if (state.rebuildTimer) {
    windowRef.clearTimeout(state.rebuildTimer);
  }
  state.rebuildTimer = windowRef.setTimeout(() => {
    state.rebuildTimer = null;
    callbacks.rebuild(reason);
  }, config.debounceMs);
}

function handlePotentialRouteChange(source: string): void {
  if (locationRef.href !== state.url) {
    handleRouteChange(source);
  }
}

function hydrateMinimalModePreference(): void {
  void Promise.resolve(callbacks.loadMinimalMode()).then((storedValue) => {
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
} satisfies CoreNavigationControllerApi;
