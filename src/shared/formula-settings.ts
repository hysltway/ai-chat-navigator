export type FormulaFormat = 'mathml' | 'latex';
export type FormulaEngine = 'mathjax' | 'katex' | 'auto';

export interface FormulaSettings {
  enableFormulaCopy: boolean;
  formulaFormat: FormulaFormat;
  formulaEngine: FormulaEngine;
}

export interface JsonStorageApi {
  getJson(key: string): Promise<unknown> | unknown;
  setJson(key: string, value: unknown): Promise<unknown> | unknown;
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
};

export interface ChromeLike {
  storage?: {
    local?: ChromeStorageAreaLike;
  };
  runtime?: ChromeRuntimeLike;
}

export interface FormulaSettingsEnvironment {
  storageApi?: JsonStorageApi | null;
  chromeRef?: ChromeLike | null;
}

export interface FormulaSettingsApi {
  KEY: string;
  DEFAULTS: FormulaSettings;
  normalize(raw: unknown): FormulaSettings;
  readRaw(): Promise<unknown>;
  read(): Promise<FormulaSettings>;
  write(rawValue: unknown): Promise<boolean>;
}

export const FORMULA_SETTINGS_KEY = 'formula_copy_settings';

export const DEFAULT_FORMULA_SETTINGS: Readonly<FormulaSettings> = Object.freeze({
  enableFormulaCopy: true,
  formulaFormat: 'mathml',
  formulaEngine: 'mathjax'
});

function createDefaults(): FormulaSettings {
  return { ...DEFAULT_FORMULA_SETTINGS };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function normalizeFormulaSettings(raw: unknown): FormulaSettings {
  const normalized = createDefaults();
  if (!isRecord(raw)) {
    return normalized;
  }

  normalized.enableFormulaCopy = raw.enableFormulaCopy !== false;

  return normalized;
}

function isChromeStorageReady(
  chromeRef: ChromeLike | null | undefined
): chromeRef is ReadyChrome {
  return Boolean(
    chromeRef &&
      chromeRef.storage &&
      chromeRef.storage.local &&
      typeof chromeRef.storage.local.get === 'function' &&
      typeof chromeRef.storage.local.set === 'function'
  );
}

function hasStorageApi(storageApi: JsonStorageApi | null | undefined): storageApi is JsonStorageApi {
  return Boolean(
    storageApi &&
      typeof storageApi.getJson === 'function' &&
      typeof storageApi.setJson === 'function'
  );
}

function readRawFromChrome(chromeRef: ChromeLike | null | undefined): Promise<unknown> {
  if (!isChromeStorageReady(chromeRef)) {
    return Promise.resolve(null);
  }

  const storageArea = chromeRef.storage.local;

  return new Promise((resolve) => {
    try {
      storageArea.get([FORMULA_SETTINGS_KEY], (items) => {
        if (chromeRef.runtime && chromeRef.runtime.lastError) {
          resolve(null);
          return;
        }
        if (!Object.prototype.hasOwnProperty.call(items, FORMULA_SETTINGS_KEY)) {
          resolve(null);
          return;
        }
        resolve(items[FORMULA_SETTINGS_KEY]);
      });
    } catch {
      resolve(null);
    }
  });
}

function writeRawToChrome(
  chromeRef: ChromeLike | null | undefined,
  rawValue: FormulaSettings
): Promise<boolean> {
  if (!isChromeStorageReady(chromeRef)) {
    return Promise.resolve(false);
  }

  const storageArea = chromeRef.storage.local;

  return new Promise((resolve) => {
    try {
      storageArea.set({ [FORMULA_SETTINGS_KEY]: rawValue }, () => {
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

export function createFormulaSettingsApi(
  environment: FormulaSettingsEnvironment = {}
): FormulaSettingsApi {
  const storageApi = environment.storageApi ?? null;
  const chromeRef =
    environment.chromeRef ?? (typeof chrome !== 'undefined' ? (chrome as unknown as ChromeLike) : null);

  function readRaw(): Promise<unknown> {
    if (hasStorageApi(storageApi)) {
      return Promise.resolve(storageApi.getJson(FORMULA_SETTINGS_KEY)).catch(() => null);
    }
    return readRawFromChrome(chromeRef);
  }

  function read(): Promise<FormulaSettings> {
    return readRaw().then((raw) => normalizeFormulaSettings(raw));
  }

  function write(rawValue: unknown): Promise<boolean> {
    const normalized = normalizeFormulaSettings(rawValue);
    if (hasStorageApi(storageApi)) {
      return Promise.resolve(storageApi.setJson(FORMULA_SETTINGS_KEY, normalized))
        .then((saved) => Boolean(saved))
        .catch(() => false);
    }
    return writeRawToChrome(chromeRef, normalized);
  }

  return {
    KEY: FORMULA_SETTINGS_KEY,
    DEFAULTS: createDefaults(),
    normalize: normalizeFormulaSettings,
    readRaw,
    read,
    write
  };
}
