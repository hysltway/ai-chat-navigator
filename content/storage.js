(() => {
  'use strict';

  const ns = window.ChatGptNav;

  function createEnvironment(overrides = {}) {
    return {
      chromeRef: overrides.chromeRef || (typeof chrome !== 'undefined' ? chrome : null)
    };
  }

  function isStorageReady(chromeRef) {
    return (
      chromeRef &&
      chromeRef.storage &&
      chromeRef.storage.local &&
      typeof chromeRef.storage.local.get === 'function' &&
      typeof chromeRef.storage.local.set === 'function'
    );
  }

  function createStorageApi(environment = createEnvironment()) {
    const env = createEnvironment(environment);

    function getRaw(key) {
      if (!isStorageReady(env.chromeRef)) {
        return Promise.resolve({ found: false, value: undefined });
      }
      return new Promise((resolve) => {
        try {
          env.chromeRef.storage.local.get([key], (items) => {
            if (env.chromeRef.runtime && env.chromeRef.runtime.lastError) {
              resolve({ found: false, value: undefined });
              return;
            }
            const found = Object.prototype.hasOwnProperty.call(items || {}, key);
            resolve({
              found,
              value: found ? items[key] : undefined
            });
          });
        } catch (error) {
          resolve({ found: false, value: undefined });
        }
      });
    }

    function setRaw(key, value) {
      if (!isStorageReady(env.chromeRef)) {
        return Promise.resolve(false);
      }
      return new Promise((resolve) => {
        try {
          env.chromeRef.storage.local.set({ [key]: value }, () => {
            if (env.chromeRef.runtime && env.chromeRef.runtime.lastError) {
              resolve(false);
              return;
            }
            resolve(true);
          });
        } catch (error) {
          resolve(false);
        }
      });
    }

    function getBoolean(key) {
      return getRaw(key).then(({ found, value }) => {
        if (!found || typeof value !== 'boolean') {
          return null;
        }
        return value;
      });
    }

    function setBoolean(key, value) {
      return setRaw(key, Boolean(value));
    }

    function getJson(key) {
      return getRaw(key).then(({ found, value }) => {
        if (!found) {
          return null;
        }
        if (value && typeof value === 'object') {
          return value;
        }
        if (typeof value !== 'string') {
          return null;
        }
        try {
          return JSON.parse(value);
        } catch (error) {
          return null;
        }
      });
    }

    function setJson(key, value) {
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
})();
