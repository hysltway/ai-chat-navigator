import { ns } from './namespace';
import type { ChromeLike } from '../shared/formula-settings';
import type { StorageApi, StorageGetRawResult } from './types';

interface StorageEnvironment {
  chromeRef?: ChromeLike | null;
}

type ReadyChrome = ChromeLike & {
  storage: NonNullable<ChromeLike['storage']> & {
    local: NonNullable<NonNullable<ChromeLike['storage']>['local']>;
  };
};

function createEnvironment(overrides: StorageEnvironment = {}): { chromeRef: ChromeLike | null } {
  return {
    chromeRef: overrides.chromeRef || (typeof chrome !== 'undefined' ? (chrome as unknown as ChromeLike) : null)
  };
}

function isStorageReady(chromeRef: ChromeLike | null): chromeRef is ReadyChrome {
  return Boolean(
    chromeRef &&
      chromeRef.storage &&
      chromeRef.storage.local &&
      typeof chromeRef.storage.local.get === 'function' &&
      typeof chromeRef.storage.local.set === 'function'
  );
}

function createStorageApi(environment: StorageEnvironment = createEnvironment()): StorageApi {
  const env = createEnvironment(environment);

  function getRaw<T = unknown>(key: string): Promise<StorageGetRawResult<T>> {
    if (!isStorageReady(env.chromeRef)) {
      return Promise.resolve({ found: false, value: undefined });
    }
    const chromeRef = env.chromeRef;

    return new Promise((resolve) => {
      try {
        chromeRef.storage.local.get([key], (items: Record<string, unknown>) => {
          if (chromeRef.runtime && chromeRef.runtime.lastError) {
            resolve({ found: false, value: undefined });
            return;
          }
          const found = Object.prototype.hasOwnProperty.call(items || {}, key);
          resolve({
            found,
            value: found ? (items[key] as T) : undefined
          });
        });
      } catch {
        resolve({ found: false, value: undefined });
      }
    });
  }

  function setRaw(key: string, value: unknown): Promise<boolean> {
    if (!isStorageReady(env.chromeRef)) {
      return Promise.resolve(false);
    }
    const chromeRef = env.chromeRef;

    return new Promise((resolve) => {
      try {
        chromeRef.storage.local.set({ [key]: value }, () => {
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

  function getBoolean(key: string): Promise<boolean | null> {
    return getRaw<boolean>(key).then(({ found, value }) => {
      if (!found || typeof value !== 'boolean') {
        return null;
      }
      return value;
    });
  }

  function setBoolean(key: string, value: boolean): Promise<boolean> {
    return setRaw(key, Boolean(value));
  }

  function getJson<T = unknown>(key: string): Promise<T | null> {
    return getRaw<T | string>(key).then(({ found, value }) => {
      if (!found) {
        return null;
      }
      if (value && typeof value === 'object') {
        return value as T;
      }
      if (typeof value !== 'string') {
        return null;
      }
      try {
        return JSON.parse(value) as T;
      } catch {
        return null;
      }
    });
  }

  function setJson(key: string, value: unknown): Promise<boolean> {
    return setRaw(key, value);
  }

  return {
    getRaw,
    setRaw,
    getBoolean,
    setBoolean,
    getJson,
    setJson
  };
}

const storageApi = createStorageApi();
ns.storage = Object.assign({}, ns.storage, storageApi, { createStorageApi });
