export type GrowthEventType = 'nav_jump' | 'prompt_panel_open' | 'favorite_add' | 'popup_open';
export type GrowthPromptAction = 'store' | 'repo' | 'hide';

export interface GrowthStats {
  version: number;
  navJumpCount: number;
  promptPanelOpenCount: number;
  favoriteAddCount: number;
  popupOpenCount: number;
  usageDays: number;
  lastActiveDate: string;
  lastShownDate: string;
  dismissedUntilDate: string | null;
  completedAt: string | null;
  completedAction: GrowthPromptAction | null;
  updatedAt: string;
}

export interface GrowthStatus {
  stats: GrowthStats;
  eligible: boolean;
  totalUses: number;
}

export interface GrowthCommandResult {
  ok: boolean;
  status: GrowthStatus;
}

export interface GrowthTrackMessage {
  type: 'growth:track';
  event: GrowthEventType;
}

export interface GrowthGetStatusMessage {
  type: 'growth:get-status';
}

export interface GrowthMarkShownMessage {
  type: 'growth:mark-shown';
}

export interface GrowthDismissMessage {
  type: 'growth:dismiss';
}

export interface GrowthCompleteMessage {
  type: 'growth:complete';
  action: GrowthPromptAction;
}

export type GrowthMessage =
  | GrowthTrackMessage
  | GrowthGetStatusMessage
  | GrowthMarkShownMessage
  | GrowthDismissMessage
  | GrowthCompleteMessage;

export const GROWTH_STORAGE_KEY = 'jumpnav_growth_v1';
export const GROWTH_VERSION = 1;
export const GROWTH_SCORE_THRESHOLD = 18;
export const GROWTH_USAGE_DAY_THRESHOLD = 5;
export const GROWTH_SNOOZE_DAYS = 7;

export const GROWTH_LINKS = Object.freeze({
  repo: 'https://github.com/hysltway/JumpNav',
  store: 'https://chromewebstore.google.com/detail/jumpnav-the-most-elegant/kkemkfabmgjcjlileggigaaemcheapep'
} as const);

const GROWTH_EVENT_WEIGHTS: Record<GrowthEventType, number> = Object.freeze({
  nav_jump: 1,
  prompt_panel_open: 2,
  favorite_add: 3,
  popup_open: 1
});

function createDefaultStats(): GrowthStats {
  return {
    version: GROWTH_VERSION,
    navJumpCount: 0,
    promptPanelOpenCount: 0,
    favoriteAddCount: 0,
    popupOpenCount: 0,
    usageDays: 0,
    lastActiveDate: '',
    lastShownDate: '',
    dismissedUntilDate: null,
    completedAt: null,
    completedAction: null,
    updatedAt: ''
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object');
}

function normalizeCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function normalizeDateKey(value: unknown): string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
}

function normalizeIsoString(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function normalizeNullableDateKey(value: unknown): string | null {
  const normalized = normalizeDateKey(value);
  return normalized || null;
}

export function normalizeGrowthStats(raw: unknown): GrowthStats {
  const source = isRecord(raw) ? raw : {};
  const normalized = createDefaultStats();

  normalized.navJumpCount = normalizeCount(source.navJumpCount);
  normalized.promptPanelOpenCount = normalizeCount(source.promptPanelOpenCount);
  normalized.favoriteAddCount = normalizeCount(source.favoriteAddCount);
  normalized.popupOpenCount = normalizeCount(source.popupOpenCount);
  normalized.usageDays = normalizeCount(source.usageDays);
  normalized.lastActiveDate = normalizeDateKey(source.lastActiveDate);
  normalized.lastShownDate = normalizeDateKey(source.lastShownDate);
  normalized.dismissedUntilDate = normalizeNullableDateKey(source.dismissedUntilDate);
  normalized.completedAt = normalizeIsoString(source.completedAt) || null;
  normalized.completedAction =
    source.completedAction === 'store' || source.completedAction === 'repo' || source.completedAction === 'hide'
      ? source.completedAction
      : null;
  normalized.updatedAt = normalizeIsoString(source.updatedAt);

  return normalized;
}

export function getGrowthTotalUses(stats: GrowthStats): number {
  return stats.navJumpCount + stats.promptPanelOpenCount + stats.favoriteAddCount + stats.popupOpenCount;
}

export function getGrowthScore(stats: GrowthStats): number {
  return (
    stats.navJumpCount * GROWTH_EVENT_WEIGHTS.nav_jump +
    stats.promptPanelOpenCount * GROWTH_EVENT_WEIGHTS.prompt_panel_open +
    stats.favoriteAddCount * GROWTH_EVENT_WEIGHTS.favorite_add +
    stats.popupOpenCount * GROWTH_EVENT_WEIGHTS.popup_open +
    stats.usageDays * 4
  );
}

export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) {
    return '';
  }
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  date.setDate(date.getDate() + days);
  return getLocalDateKey(date);
}

export function canPromptForGrowth(stats: GrowthStats, dateKey = getLocalDateKey()): boolean {
  if (stats.completedAt) {
    return false;
  }
  if (stats.dismissedUntilDate && stats.dismissedUntilDate > dateKey) {
    return false;
  }
  if (stats.lastShownDate === dateKey) {
    return false;
  }
  return getGrowthScore(stats) >= GROWTH_SCORE_THRESHOLD && stats.usageDays >= GROWTH_USAGE_DAY_THRESHOLD;
}

export function buildGrowthStatus(stats: GrowthStats, dateKey = getLocalDateKey()): GrowthStatus {
  return {
    stats,
    eligible: canPromptForGrowth(stats, dateKey),
    totalUses: getGrowthTotalUses(stats)
  };
}

export function trackGrowthEvent(raw: unknown, event: GrowthEventType, now = new Date()): GrowthStats {
  const stats = normalizeGrowthStats(raw);
  const dateKey = getLocalDateKey(now);
  const next: GrowthStats = {
    ...stats,
    updatedAt: now.toISOString()
  };

  if (event === 'nav_jump') {
    next.navJumpCount += 1;
  } else if (event === 'prompt_panel_open') {
    next.promptPanelOpenCount += 1;
  } else if (event === 'favorite_add') {
    next.favoriteAddCount += 1;
  } else if (event === 'popup_open') {
    next.popupOpenCount += 1;
  }

  if (next.lastActiveDate !== dateKey) {
    next.lastActiveDate = dateKey;
    next.usageDays += 1;
  }

  return next;
}

export function markGrowthPromptShown(raw: unknown, now = new Date()): GrowthStats {
  const stats = normalizeGrowthStats(raw);
  return {
    ...stats,
    lastShownDate: getLocalDateKey(now),
    updatedAt: now.toISOString()
  };
}

export function dismissGrowthPrompt(raw: unknown, now = new Date()): GrowthStats {
  const stats = normalizeGrowthStats(raw);
  const dateKey = getLocalDateKey(now);
  return {
    ...stats,
    dismissedUntilDate: addDaysToDateKey(dateKey, GROWTH_SNOOZE_DAYS),
    updatedAt: now.toISOString()
  };
}

export function completeGrowthPrompt(raw: unknown, action: GrowthPromptAction, now = new Date()): GrowthStats {
  const stats = normalizeGrowthStats(raw);
  return {
    ...stats,
    dismissedUntilDate: null,
    completedAt: now.toISOString(),
    completedAction: action,
    updatedAt: now.toISOString()
  };
}

export function isGrowthMessage(value: unknown): value is GrowthMessage {
  if (!isRecord(value) || typeof value.type !== 'string') {
    return false;
  }

  if (value.type === 'growth:track') {
    return (
      value.event === 'nav_jump' ||
      value.event === 'prompt_panel_open' ||
      value.event === 'favorite_add' ||
      value.event === 'popup_open'
    );
  }

  if (value.type === 'growth:get-status' || value.type === 'growth:mark-shown' || value.type === 'growth:dismiss') {
    return true;
  }

  if (value.type === 'growth:complete') {
    return value.action === 'store' || value.action === 'repo' || value.action === 'hide';
  }

  return false;
}

function canSendRuntimeMessage(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id) && typeof chrome.runtime.sendMessage === 'function';
}

function sendGrowthMessage<TResponse>(message: GrowthMessage): Promise<TResponse | null> {
  if (!canSendRuntimeMessage()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(message, (response: TResponse) => {
        if (chrome.runtime.lastError) {
          resolve(null);
          return;
        }
        resolve(response || null);
      });
    } catch {
      resolve(null);
    }
  });
}

export function trackGrowth(event: GrowthEventType): Promise<GrowthCommandResult | null> {
  return sendGrowthMessage<GrowthCommandResult>({
    type: 'growth:track',
    event
  });
}

export function getGrowthStatus(): Promise<GrowthCommandResult | null> {
  return sendGrowthMessage<GrowthCommandResult>({
    type: 'growth:get-status'
  });
}

export function markGrowthShown(): Promise<GrowthCommandResult | null> {
  return sendGrowthMessage<GrowthCommandResult>({
    type: 'growth:mark-shown'
  });
}

export function dismissGrowth(): Promise<GrowthCommandResult | null> {
  return sendGrowthMessage<GrowthCommandResult>({
    type: 'growth:dismiss'
  });
}

export function completeGrowth(action: GrowthPromptAction): Promise<GrowthCommandResult | null> {
  return sendGrowthMessage<GrowthCommandResult>({
    type: 'growth:complete',
    action
  });
}
