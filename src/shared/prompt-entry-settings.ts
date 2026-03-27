import type { ChromeLike } from './formula-settings';

export interface BooleanStorageApi {
  getBoolean(key: string): Promise<boolean | null> | boolean | null;
  setBoolean(key: string, value: boolean): Promise<boolean> | boolean;
}

interface ChromeStorageAreaLike {
  get(keys: string[], callback: (items: Record<string, unknown>) => void): void;
  set(items: Record<string, unknown>, callback: () => void): void;
}

interface ChromeRuntimeLike {
  lastError?: unknown;
}

type ReadyChrome = ChromeLike & {
  storage: {
    local: ChromeStorageAreaLike;
  };
  runtime?: ChromeRuntimeLike;
};

export interface PromptEntrySettingsEnvironment {
  storageApi?: BooleanStorageApi | null;
  chromeRef?: ChromeLike | null;
}

export interface PromptEntrySettingsApi {
  KEY: string;
  DEFAULT_ENABLED: boolean;
  normalize(raw: unknown): boolean;
  readRaw(): Promise<unknown>;
  read(): Promise<boolean>;
  write(rawValue: unknown): Promise<boolean>;
}

export const PROMPT_ENTRY_ENABLED_KEY = 'prompt_library_entry_enabled';
export const DEFAULT_PROMPT_ENTRY_ENABLED = true;

export function normalizePromptEntryEnabled(raw: unknown): boolean {
  return raw !== false;
}

function isChromeStorageReady(chromeRef: ChromeLike | null | undefined): chromeRef is ReadyChrome {
  return Boolean(
    chromeRef &&
      chromeRef.storage &&
      chromeRef.storage.local &&
      typeof chromeRef.storage.local.get === 'function' &&
      typeof chromeRef.storage.local.set === 'function'
  );
}

function hasBooleanStorageApi(storageApi: BooleanStorageApi | null | undefined): storageApi is BooleanStorageApi {
  return Boolean(
    storageApi &&
      typeof storageApi.getBoolean === 'function' &&
      typeof storageApi.setBoolean === 'function'
  );
}

function readRawFromChrome(chromeRef: ChromeLike | null | undefined): Promise<unknown> {
  if (!isChromeStorageReady(chromeRef)) {
    return Promise.resolve(null);
  }

  const storageArea = chromeRef.storage.local;

  return new Promise((resolve) => {
    try {
      storageArea.get([PROMPT_ENTRY_ENABLED_KEY], (items) => {
        if (chromeRef.runtime && chromeRef.runtime.lastError) {
          resolve(null);
          return;
        }
        if (!Object.prototype.hasOwnProperty.call(items, PROMPT_ENTRY_ENABLED_KEY)) {
          resolve(null);
          return;
        }
        resolve(items[PROMPT_ENTRY_ENABLED_KEY]);
      });
    } catch {
      resolve(null);
    }
  });
}

function writeRawToChrome(chromeRef: ChromeLike | null | undefined, rawValue: boolean): Promise<boolean> {
  if (!isChromeStorageReady(chromeRef)) {
    return Promise.resolve(false);
  }

  const storageArea = chromeRef.storage.local;

  return new Promise((resolve) => {
    try {
      storageArea.set({ [PROMPT_ENTRY_ENABLED_KEY]: rawValue }, () => {
        if (chromeRef.runtime && chromeRef.runtime.lastError) {
          resolve(false);
          return;
        }
        resolve(true);
      });
    } catch {
      resolve(false);
    }
  });
}

export function createPromptEntrySettingsApi(
  environment: PromptEntrySettingsEnvironment = {}
): PromptEntrySettingsApi {
  const storageApi = environment.storageApi ?? null;
  const chromeRef =
    environment.chromeRef ?? (typeof chrome !== 'undefined' ? (chrome as unknown as ChromeLike) : null);

  function readRaw(): Promise<unknown> {
    if (hasBooleanStorageApi(storageApi)) {
      return Promise.resolve(storageApi.getBoolean(PROMPT_ENTRY_ENABLED_KEY)).catch(() => null);
    }
    return readRawFromChrome(chromeRef);
  }

  function read(): Promise<boolean> {
    return readRaw().then((raw) => normalizePromptEntryEnabled(raw));
  }

  function write(rawValue: unknown): Promise<boolean> {
    const normalized = normalizePromptEntryEnabled(rawValue);
    if (hasBooleanStorageApi(storageApi)) {
      return Promise.resolve(storageApi.setBoolean(PROMPT_ENTRY_ENABLED_KEY, normalized))
        .then((saved) => Boolean(saved))
        .catch(() => false);
    }
    return writeRawToChrome(chromeRef, normalized);
  }

  return {
    KEY: PROMPT_ENTRY_ENABLED_KEY,
    DEFAULT_ENABLED: DEFAULT_PROMPT_ENTRY_ENABLED,
    normalize: normalizePromptEntryEnabled,
    readRaw,
    read,
    write
  };
}
