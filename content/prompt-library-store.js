(() => {
  'use strict';

  const ns = window.ChatGptNav || {};

  const STORAGE_KEY = 'prompt_library_v1';
  const VERSION = 2;

  function createEnvironment(overrides = {}) {
    return {
      storageApi: overrides.storageApi || ns.storage || null,
      now: typeof overrides.now === 'function' ? overrides.now : () => new Date().toISOString()
    };
  }

  function hasStorageApi(storageApi) {
    return Boolean(storageApi && typeof storageApi.getJson === 'function' && typeof storageApi.setJson === 'function');
  }

  function createPromptLibraryStore(environment = createEnvironment()) {
    const env = createEnvironment(environment);

    async function read() {
      const raw = await readRaw();
      const normalized = normalizeLibrary(raw, env.now);
      if (!raw || !isSerializedEqual(raw, normalized)) {
        await writeRaw(normalized);
      }
      return normalized;
    }

    async function write(library) {
      const normalized = normalizeLibrary(library, env.now);
      await writeRaw(normalized);
      return normalized;
    }

    async function createPrompt(draft) {
      const library = await read();
      const prompt = createPromptRecord(draft, env.now);
      library.prompts = sortPrompts([prompt].concat(library.prompts));
      library.updatedAt = env.now();
      await writeRaw(library);
      return { library, prompt };
    }

    async function deletePrompt(promptId) {
      const library = await read();
      library.prompts = library.prompts.filter((prompt) => prompt.id !== promptId);
      library.updatedAt = env.now();
      await writeRaw(library);
      return library;
    }

    async function markCopied(promptId) {
      const library = await read();
      const now = env.now();
      let changed = false;

      library.prompts = library.prompts.map((prompt) => {
        if (prompt.id !== promptId) {
          return prompt;
        }
        changed = true;
        return {
          ...prompt,
          copyCount: sanitizeCount(prompt.copyCount) + 1,
          lastCopiedAt: now
        };
      });

      if (!changed) {
        return library;
      }

      library.updatedAt = now;
      await writeRaw(library);
      return library;
    }

    function filterPrompts(library, filter = {}) {
      const normalized = normalizeLibrary(library, env.now);
      const query = normalizeQuery(filter.query);
      if (!query) {
        return sortPrompts(normalized.prompts);
      }

      return sortPrompts(
        normalized.prompts.filter((prompt) => {
          const haystack = `${prompt.title}\n${prompt.content}`.toLowerCase();
          return haystack.includes(query);
        })
      );
    }

    function hasDuplicateTitle(library, title) {
      const normalizedTitle = normalizeLineText(title).toLowerCase();
      if (!normalizedTitle) {
        return false;
      }

      return normalizeLibrary(library, env.now).prompts.some(
        (prompt) => prompt.title.trim().toLowerCase() === normalizedTitle
      );
    }

    function readRaw() {
      if (!hasStorageApi(env.storageApi)) {
        return Promise.resolve(null);
      }
      return Promise.resolve(env.storageApi.getJson(STORAGE_KEY)).catch(() => null);
    }

    function writeRaw(value) {
      if (!hasStorageApi(env.storageApi)) {
        return Promise.resolve(false);
      }
      return Promise.resolve(env.storageApi.setJson(STORAGE_KEY, normalizeLibrary(value, env.now))).catch(() => false);
    }

    return {
      STORAGE_KEY,
      VERSION,
      read,
      write,
      createPrompt,
      deletePrompt,
      markCopied,
      filterPrompts,
      hasDuplicateTitle,
      normalizeLibrary
    };
  }

  function normalizeLibrary(rawLibrary, nowFn) {
    const now = typeof nowFn === 'function' ? nowFn() : new Date().toISOString();
    const raw = rawLibrary && typeof rawLibrary === 'object' ? rawLibrary : {};
    const prompts = sortPrompts(
      (Array.isArray(raw.prompts) ? raw.prompts : [])
        .map((prompt) => normalizePrompt(prompt, now))
        .filter(Boolean)
    );

    return {
      version: VERSION,
      updatedAt: normalizeTimestamp(raw.updatedAt, now),
      prompts
    };
  }

  function normalizePrompt(rawPrompt, now) {
    const source = rawPrompt && typeof rawPrompt === 'object' ? rawPrompt : {};
    const title = normalizeLineText(source.title);
    const content = normalizeContentText(source.content);
    if (!title || !content) {
      return null;
    }

    const id = normalizeOptionalText(source.id) || createId('prompt');
    const createdAt = normalizeTimestamp(source.createdAt, now);
    const updatedAt = normalizeTimestamp(source.updatedAt, createdAt);

    return {
      id,
      title,
      content,
      createdAt,
      updatedAt,
      copyCount: sanitizeCount(source.copyCount),
      lastCopiedAt: normalizeNullableTimestamp(source.lastCopiedAt)
    };
  }

  function createPromptRecord(draft, nowFn) {
    const now = nowFn();
    return {
      id: createId('prompt'),
      title: normalizeLineText(draft && draft.title),
      content: normalizeContentText(draft && draft.content),
      createdAt: now,
      updatedAt: now,
      copyCount: 0,
      lastCopiedAt: null
    };
  }

  function sortPrompts(prompts) {
    return prompts.slice().sort((left, right) => {
      const leftTime = Date.parse(left.updatedAt || left.createdAt || 0);
      const rightTime = Date.parse(right.updatedAt || right.createdAt || 0);
      if (leftTime !== rightTime) {
        return rightTime - leftTime;
      }
      return (left.title || '').localeCompare(right.title || '', 'zh-Hans-CN');
    });
  }

  function normalizeQuery(value) {
    return normalizeLineText(value).toLowerCase();
  }

  function sanitizeCount(value) {
    if (!Number.isFinite(Number(value))) {
      return 0;
    }
    return Math.max(0, Math.floor(Number(value)));
  }

  function normalizeTimestamp(value, fallback) {
    if (typeof value === 'string' && value && Number.isFinite(Date.parse(value))) {
      return new Date(value).toISOString();
    }
    return fallback;
  }

  function normalizeNullableTimestamp(value) {
    if (typeof value === 'string' && value && Number.isFinite(Date.parse(value))) {
      return new Date(value).toISOString();
    }
    return null;
  }

  function normalizeLineText(value) {
    if (typeof value !== 'string') {
      return '';
    }
    return value.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
  }

  function normalizeContentText(value) {
    if (typeof value !== 'string') {
      return '';
    }
    return value.replace(/\r\n/g, '\n').trim();
  }

  function normalizeOptionalText(value) {
    if (typeof value !== 'string') {
      return '';
    }
    return value.trim();
  }

  function createId(prefix) {
    const stamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 9);
    return `${prefix}_${stamp}_${random}`;
  }

  function isSerializedEqual(left, right) {
    try {
      return JSON.stringify(left) === JSON.stringify(right);
    } catch (error) {
      return false;
    }
  }

  ns.promptLibraryStore = Object.assign({}, ns.promptLibraryStore, {
    STORAGE_KEY,
    VERSION,
    createPromptLibraryStore,
    normalizePromptLibrary: normalizeLibrary
  });
  window.ChatGptNav = ns;
})();
