declare const __JUMPNAV_DEV_SERVER__: string;

const POLL_MS = 1200;

interface VersionPayload {
  version?: number | string;
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

export function startRuntimeDevReload(): void {
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    return;
  }

  startPolling(
    () => {
      chrome.runtime.reload();
    },
    (callback, delay) => {
      setTimeout(callback, delay);
    }
  );
}
