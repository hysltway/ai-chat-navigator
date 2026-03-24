declare const __JUMPNAV_DEV_SERVER__: string;

const POLL_MS = 1200;
const DEV_RELOAD_MESSAGE_TYPE = 'jumpnav-dev-reload';
const DEV_RELOAD_PENDING_KEY = 'jumpnav-dev-reload-pending';
const DEV_RELOAD_TAB_URLS = [
  'https://chatgpt.com/*',
  'https://chat.openai.com/*',
  'https://gemini.google.com/*',
  'https://claude.ai/*'
];

let runtimeReloadRequested = false;

interface VersionPayload {
  version?: number | string;
}

interface DevReloadMessage {
  type?: string;
}

function getVersionUrl() {
  return __JUMPNAV_DEV_SERVER__ ? `${__JUMPNAV_DEV_SERVER__}/version` : '';
}

async function readVersion(): Promise<string | null> {
  const versionUrl = getVersionUrl();
  if (!versionUrl) {
    return null;
  }

  try {
    const response = await fetch(versionUrl, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as VersionPayload;
    if (typeof payload.version === 'number' || typeof payload.version === 'string') {
      return String(payload.version);
    }
  } catch {
  }

  return null;
}

function startPolling(onVersionChange: () => void, scheduleNext: (callback: () => void, delay: number) => void) {
  if (!getVersionUrl()) {
    return;
  }

  let currentVersion: string | null = null;

  const tick = async () => {
    const nextVersion = await readVersion();
    if (!nextVersion) {
      scheduleNext(tick, POLL_MS);
      return;
    }
    if (currentVersion === null) {
      currentVersion = nextVersion;
      scheduleNext(tick, POLL_MS);
      return;
    }
    if (nextVersion !== currentVersion) {
      onVersionChange();
      return;
    }
    scheduleNext(tick, POLL_MS);
  };

  void tick();
}

function hasRuntimeMessaging(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id) && typeof chrome.runtime.sendMessage === 'function';
}

function hasRuntimeReloadControls(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id) && typeof chrome.runtime.reload === 'function';
}

function hasStorageAccess(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);
}

function hasTabsAccess(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.tabs?.query) && typeof chrome.tabs.reload === 'function';
}

function sendRuntimeMessage(message: DevReloadMessage): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!hasRuntimeMessaging()) {
      reject(new Error('runtime messaging unavailable'));
      return;
    }

    try {
      chrome.runtime.sendMessage(message, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

function storageGet<T>(key: string): Promise<T | null> {
  return new Promise((resolve, reject) => {
    if (!hasStorageAccess()) {
      resolve(null);
      return;
    }

    try {
      chrome.storage.local.get([key], (items) => {
        if (chrome.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve((items[key] as T | undefined) ?? null);
      });
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

function storageSet(key: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!hasStorageAccess()) {
      resolve();
      return;
    }

    try {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

function storageRemove(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!hasStorageAccess()) {
      resolve();
      return;
    }

    try {
      chrome.storage.local.remove(key, () => {
        if (chrome.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

function queryTabs(): Promise<chrome.tabs.Tab[]> {
  return new Promise((resolve, reject) => {
    if (!hasTabsAccess()) {
      resolve([]);
      return;
    }

    try {
      chrome.tabs.query({ url: DEV_RELOAD_TAB_URLS }, (tabs) => {
        if (chrome.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(Array.isArray(tabs) ? tabs : []);
      });
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

function reloadTab(tabId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!hasTabsAccess()) {
      resolve();
      return;
    }

    try {
      chrome.tabs.reload(tabId, () => {
        if (chrome.runtime?.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve();
      });
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

async function markPendingRuntimeReload(): Promise<void> {
  await storageSet(DEV_RELOAD_PENDING_KEY, Date.now());
}

async function reloadSupportedTabsAfterRuntimeRestart(): Promise<void> {
  const pending = await storageGet<number>(DEV_RELOAD_PENDING_KEY);
  if (!pending) {
    return;
  }

  await storageRemove(DEV_RELOAD_PENDING_KEY);

  const tabs = await queryTabs();
  await Promise.all(
    tabs
      .map((tab) => tab.id)
      .filter((tabId): tabId is number => Number.isInteger(tabId))
      .map((tabId) => reloadTab(tabId).catch(() => undefined))
  );
}

async function requestRuntimeReload(): Promise<void> {
  if (!hasRuntimeMessaging()) {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    return;
  }

  try {
    await sendRuntimeMessage({ type: DEV_RELOAD_MESSAGE_TYPE });
  } catch {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }
}

export function startDocumentDevReload(): void {
  if (typeof window === 'undefined') {
    return;
  }

  startPolling(
    () => {
      window.location.reload();
    },
    (callback, delay) => {
      window.setTimeout(callback, delay);
    }
  );
}

export function startContentDevReload(): void {
  if (typeof window === 'undefined') {
    return;
  }

  startPolling(
    () => {
      void requestRuntimeReload();
    },
    (callback, delay) => {
      window.setTimeout(callback, delay);
    }
  );
}

export function startRuntimeDevReload(): void {
  if (!hasRuntimeReloadControls()) {
    return;
  }

  chrome.runtime.onMessage.addListener((message: DevReloadMessage) => {
    if (!message || message.type !== DEV_RELOAD_MESSAGE_TYPE || runtimeReloadRequested) {
      return;
    }

    runtimeReloadRequested = true;
    void markPendingRuntimeReload()
      .catch(() => undefined)
      .finally(() => {
        chrome.runtime.reload();
      });
  });

  void reloadSupportedTabsAfterRuntimeRestart().catch(() => {
    void storageRemove(DEV_RELOAD_PENDING_KEY).catch(() => undefined);
  });
}
