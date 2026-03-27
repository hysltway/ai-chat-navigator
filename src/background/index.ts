import { startRuntimeDevReload } from '../shared/dev-reload';
import {
  buildGrowthStatus,
  canPromptForGrowth,
  completeGrowthPrompt,
  dismissGrowthPrompt,
  GROWTH_STORAGE_KEY,
  isGrowthMessage,
  markGrowthPromptShown,
  normalizeGrowthStats,
  trackGrowthEvent,
  type GrowthCommandResult,
  type GrowthMessage
} from '../shared/growth';

function canUseStorage(): boolean {
  return Boolean(chrome.storage?.local);
}

function readGrowthState(): Promise<unknown> {
  if (!canUseStorage()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      chrome.storage.local.get([GROWTH_STORAGE_KEY], (items) => {
        if (chrome.runtime?.lastError) {
          resolve(null);
          return;
        }
        resolve(items[GROWTH_STORAGE_KEY] ?? null);
      });
    } catch {
      resolve(null);
    }
  });
}

function writeGrowthState(value: unknown): Promise<boolean> {
  if (!canUseStorage()) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    try {
      chrome.storage.local.set({ [GROWTH_STORAGE_KEY]: value }, () => {
        resolve(!chrome.runtime?.lastError);
      });
    } catch {
      resolve(false);
    }
  });
}

async function handleGrowthMessage(message: GrowthMessage): Promise<GrowthCommandResult> {
  const current = normalizeGrowthStats(await readGrowthState());
  const now = new Date();
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (message.type === 'growth:get-status') {
    return {
      ok: true,
      status: buildGrowthStatus(current, dateKey)
    };
  }

  if (message.type === 'growth:track') {
    const next = trackGrowthEvent(current, message.event, now);
    const saved = await writeGrowthState(next);
    return {
      ok: saved,
      status: buildGrowthStatus(saved ? next : current, dateKey)
    };
  }

  if (message.type === 'growth:mark-shown') {
    if (!canPromptForGrowth(current, dateKey)) {
      return {
        ok: false,
        status: buildGrowthStatus(current, dateKey)
      };
    }
    const next = markGrowthPromptShown(current, now);
    const saved = await writeGrowthState(next);
    return {
      ok: saved,
      status: buildGrowthStatus(saved ? next : current, dateKey)
    };
  }

  if (message.type === 'growth:dismiss') {
    const next = dismissGrowthPrompt(current, now);
    const saved = await writeGrowthState(next);
    return {
      ok: saved,
      status: buildGrowthStatus(saved ? next : current, dateKey)
    };
  }

  const next = completeGrowthPrompt(current, message.action, now);
  const saved = await writeGrowthState(next);
  return {
    ok: saved,
    status: buildGrowthStatus(saved ? next : current, dateKey)
  };
}

chrome.runtime.onMessage.addListener((message: GrowthMessage, _sender, sendResponse) => {
  if (!isGrowthMessage(message)) {
    return;
  }

  void handleGrowthMessage(message)
    .then((response) => {
      sendResponse(response);
    })
    .catch(() => {
      sendResponse({
        ok: false,
        status: buildGrowthStatus(normalizeGrowthStats(null))
      } satisfies GrowthCommandResult);
    });

  return true;
});

startRuntimeDevReload();
