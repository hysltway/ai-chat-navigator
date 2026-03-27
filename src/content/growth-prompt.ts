import { ns } from './namespace';
import {
  completeGrowth,
  dismissGrowth,
  getGrowthStatus,
  GROWTH_LINKS,
  markGrowthShown,
  type GrowthPromptAction,
  type GrowthStatus
} from '../shared/growth';
import { t, tp } from '../shared/i18n';
import { createButton, createIconButton } from '../shared/ui-kit/dom';
import { UI_KIT_STYLE_TEXT } from '../shared/ui-kit/styles';
import { getUiThemePreset, replaceCssVars, UI_KIT_THEME_VAR_KEYS } from '../shared/ui-kit/theme';
import type { ColorScheme, SiteId } from './types';

const BOOT_FLAG = 'jumpnavGrowthPromptInjected';
const CHECK_POLL_MS = 1500;
const CHECK_DEBOUNCE_MS = 220;
const FORCE_SHOW_FOR_TESTING = false;
const GROWTH_ORNAMENT_TYPES = [
  'orb',
  'spark',
  'orb',
  'ribbon',
  'spark',
  'orb',
  'ribbon',
  'spark',
  'orb',
  'ribbon',
  'spark',
  'orb',
  'ribbon',
  'spark',
  'orb',
  'spark',
  'orb',
  'ribbon',
  'spark',
  'orb',
  'ribbon',
  'spark',
  'orb',
  'spark'
] as const;

interface GrowthPromptUi {
  host: HTMLDivElement;
  shadow: ShadowRoot;
  root: HTMLDivElement;
  overlay: HTMLDivElement;
  dialog: HTMLElement;
  closeButton: HTMLButtonElement;
  usageDaysValue: HTMLSpanElement;
  usageDaysLabel: HTMLSpanElement;
  totalUsesValue: HTMLSpanElement;
  totalUsesLabel: HTMLSpanElement;
  title: HTMLHeadingElement;
  body: HTMLParagraphElement;
  primaryButton: HTMLButtonElement;
  secondaryButton: HTMLButtonElement;
  hideButton: HTMLButtonElement;
}

let started = false;
let booted = false;
let open = false;
let checking = false;
let currentUrl = location.href;
let shownUrl = '';
let pollTimer: number | null = null;
let checkTimer: number | null = null;
let ui: GrowthPromptUi | null = null;
let previousDocumentOverflow = '';
let previousBodyOverflow = '';

function start(): void {
  if (started) {
    return;
  }
  started = true;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
}

function boot(): void {
  if (booted || document.documentElement.dataset[BOOT_FLAG] === '1') {
    return;
  }

  document.documentElement.dataset[BOOT_FLAG] = '1';
  booted = true;
  ui = createGrowthPromptUi();
  bindUiEvents(ui);
  if (document.readyState !== 'complete') {
    window.addEventListener(
      'load',
      () => {
        scheduleEligibilityCheck();
      },
      { once: true }
    );
  }
  scheduleEligibilityCheck();
  startPolling();
}

function createGrowthPromptUi(): GrowthPromptUi {
  const host = document.createElement('div');
  host.id = 'jumpnav-growth-prompt';
  host.style.position = 'fixed';
  host.style.inset = '0';
  host.style.zIndex = '2147483600';
  host.style.pointerEvents = 'none';

  const shadow = host.attachShadow({ mode: 'open' });
  shadow.appendChild(createStyleElement());

  const root = document.createElement('div');
  root.className = 'growth-root ui-root';
  root.dataset.open = '0';

  const overlay = document.createElement('div');
  overlay.className = 'growth-overlay';

  const stage = document.createElement('div');
  stage.className = 'growth-stage';

  const dialog = document.createElement('section');
  dialog.className = 'growth-dialog ui-panel';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-hidden', 'true');
  dialog.tabIndex = -1;

  const closeButton = createIconButton('close-growth-prompt', t('growth_modal_close'), 'close', {
    className: 'growth-close'
  });

  const stats = document.createElement('div');
  stats.className = 'growth-stats';

  const usageDaysCard = createStatCard();
  const totalUsesCard = createStatCard();

  const title = document.createElement('h2');
  title.className = 'growth-title';
  title.id = 'jumpnav-growth-title';
  title.textContent = t('growth_modal_title');

  const body = document.createElement('p');
  body.className = 'growth-body';
  body.id = 'jumpnav-growth-body';
  body.textContent = t('growth_modal_body');

  const actions = document.createElement('div');
  actions.className = 'growth-actions';
  const footer = document.createElement('div');
  footer.className = 'growth-footer';
  const hideRow = document.createElement('div');
  hideRow.className = 'growth-hide-row';

  const primaryButton = createButton(t('growth_modal_store_button'), {
    className: 'growth-action growth-action-primary',
    tone: 'primary'
  });
  const secondaryButton = createButton(t('growth_modal_repo_button'), {
    className: 'growth-action growth-action-secondary'
  });
  const hideButton = createButton(t('growth_modal_hide_button'), {
    className: 'growth-hide'
  });

  dialog.setAttribute('aria-labelledby', title.id);
  dialog.setAttribute('aria-describedby', body.id);

  stats.appendChild(usageDaysCard.card);
  stats.appendChild(totalUsesCard.card);
  dialog.appendChild(closeButton);
  dialog.appendChild(title);
  dialog.appendChild(body);
  dialog.appendChild(stats);
  actions.appendChild(secondaryButton);
  actions.appendChild(primaryButton);
  hideRow.appendChild(hideButton);
  footer.appendChild(actions);
  footer.appendChild(hideRow);
  dialog.appendChild(footer);
  root.appendChild(overlay);
  stage.appendChild(createOrnaments());
  stage.appendChild(dialog);
  root.appendChild(stage);
  shadow.appendChild(root);
  (document.documentElement || document.body).appendChild(host);

  return {
    host,
    shadow,
    root,
    overlay,
    dialog,
    closeButton,
    usageDaysValue: usageDaysCard.value,
    usageDaysLabel: usageDaysCard.label,
    totalUsesValue: totalUsesCard.value,
    totalUsesLabel: totalUsesCard.label,
    title,
    body,
    primaryButton,
    secondaryButton,
    hideButton
  };
}

function createStatCard(): { card: HTMLDivElement; value: HTMLSpanElement; label: HTMLSpanElement } {
  const card = document.createElement('div');
  card.className = 'growth-stat';

  const value = document.createElement('span');
  value.className = 'growth-stat-value';

  const label = document.createElement('span');
  label.className = 'growth-stat-label';

  card.appendChild(value);
  card.appendChild(label);
  return { card, value, label };
}

function createOrnaments(): HTMLDivElement {
  const ornaments = document.createElement('div');
  ornaments.className = 'growth-ornaments';
  ornaments.setAttribute('aria-hidden', 'true');

  for (const kind of GROWTH_ORNAMENT_TYPES) {
    const ornament = document.createElement('span');
    ornament.className = `growth-ornament growth-ornament-${kind}`;
    ornaments.appendChild(ornament);
  }

  return ornaments;
}

function createStyleElement(): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = `
${UI_KIT_STYLE_TEXT}
      .growth-root {
        position: fixed;
        inset: 0;
        pointer-events: none;
        --growth-space-1: 8px;
        --growth-space-2: 12px;
        --growth-space-3: 18px;
        --growth-space-4: clamp(22px, 2.6vw, 28px);
        --growth-space-5: clamp(28px, 3vw, 36px);
        --growth-overlay: rgba(8, 11, 16, 0.72);
        --growth-overlay-glow: rgba(214, 168, 82, 0.2);
        --growth-accent: #d6a852;
        --growth-accent-strong: #ffefc7;
        --growth-accent-soft: rgba(214, 168, 82, 0.18);
        --growth-accent-border: rgba(214, 168, 82, 0.34);
        --growth-shadow:
          0 42px 88px rgba(4, 8, 14, 0.5),
          0 16px 34px rgba(4, 8, 14, 0.28);
        display: grid;
        place-items: center;
      }

      .growth-root[data-open="1"] {
        pointer-events: auto;
      }

      .growth-stage {
        position: relative;
        width: min(860px, calc(100vw - 6px));
        display: grid;
        place-items: center;
        isolation: isolate;
        pointer-events: none;
      }

      .growth-stage::before,
      .growth-stage::after {
        content: '';
        position: absolute;
        pointer-events: none;
        opacity: 0;
      }

      .growth-stage::before {
        inset: -86px -96px;
        background:
          radial-gradient(circle at 10% 18%, rgba(255, 239, 199, 0.56), transparent 26%),
          radial-gradient(circle at 88% 14%, rgba(214, 168, 82, 0.34), transparent 30%),
          radial-gradient(circle at 88% 84%, rgba(255, 239, 199, 0.4), transparent 30%),
          radial-gradient(circle at 12% 86%, rgba(214, 168, 82, 0.28), transparent 28%),
          radial-gradient(circle at 50% 6%, rgba(255, 245, 214, 0.24), transparent 22%),
          radial-gradient(circle at 50% 96%, rgba(255, 234, 176, 0.18), transparent 20%);
        filter: blur(26px);
      }

      .growth-stage::after {
        inset: -122px -134px;
        border-radius: 64px;
        background:
          conic-gradient(
            from 160deg,
            transparent 0 10%,
            rgba(255, 239, 199, 0.42) 14%,
            transparent 20% 36%,
            rgba(214, 168, 82, 0.28) 42%,
            transparent 48% 60%,
            rgba(255, 239, 199, 0.26) 66%,
            transparent 72% 86%,
            rgba(214, 168, 82, 0.22) 92%,
            transparent 100%
          );
        filter: blur(28px);
        mix-blend-mode: screen;
      }

      .growth-overlay {
        position: absolute;
        inset: 0;
        opacity: 0;
        background:
          radial-gradient(circle at 50% 18%, var(--growth-overlay-glow), transparent 34%),
          linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 28%),
          var(--growth-overlay);
        backdrop-filter: blur(10px);
        transition: opacity 180ms var(--ui-ease-out-quart);
      }

      .growth-dialog {
        position: relative;
        width: min(540px, calc(100vw - 32px));
        max-height: calc(100vh - 32px);
        padding: clamp(24px, 3vw, 32px);
        overflow: hidden;
        display: grid;
        gap: var(--growth-space-3);
        opacity: 0;
        visibility: hidden;
        transform: translate3d(0, 22px, 0) scale(0.94);
        transition:
          opacity 180ms var(--ui-ease-out-quart),
          transform 220ms var(--ui-ease-out-expo),
          visibility 0ms linear 220ms;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.12), transparent 30%),
          radial-gradient(circle at top, rgba(255, 255, 255, 0.12), transparent 44%),
          var(--ui-panel-bg);
        box-shadow: var(--growth-shadow);
        z-index: 2;
        pointer-events: auto;
      }

      .growth-ornaments {
        position: absolute;
        inset: -148px -190px;
        z-index: 0;
        pointer-events: none;
        transform-origin: center;
        --ornament-scale: 1;
      }

      .growth-ornament {
        position: absolute;
        left: 50%;
        top: 50%;
        width: var(--w, 18px);
        height: var(--h, 18px);
        opacity: 0;
        will-change: transform, opacity;
        transform: translate3d(var(--x), var(--y), 0) rotate(var(--r, 0deg));
        --s1: 1.14;
        --s2: 0.9;
        --s3: 1.08;
        --turn1: 24deg;
        --turn2: -20deg;
        --turn3: 32deg;
        --mx3: 20px;
        --my3: -18px;
        --glint: 2.8s;
      }

      .growth-ornament:nth-child(4n + 1) {
        --mx1: 56px;
        --my1: -78px;
        --mx2: -70px;
        --my2: 38px;
        --mx3: 34px;
        --my3: -26px;
        --turn1: 32deg;
        --turn2: -28deg;
        --turn3: 42deg;
      }

      .growth-ornament:nth-child(4n + 2) {
        --mx1: -72px;
        --my1: -32px;
        --mx2: 42px;
        --my2: 76px;
        --mx3: -28px;
        --my3: 22px;
        --turn1: -26deg;
        --turn2: 34deg;
        --turn3: 22deg;
      }

      .growth-ornament:nth-child(4n + 3) {
        --mx1: 24px;
        --my1: 84px;
        --mx2: -48px;
        --my2: -66px;
        --mx3: 22px;
        --my3: 28px;
        --turn1: 18deg;
        --turn2: -34deg;
        --turn3: 28deg;
      }

      .growth-ornament:nth-child(4n) {
        --mx1: -42px;
        --my1: 68px;
        --mx2: 78px;
        --my2: -28px;
        --mx3: -34px;
        --my3: 18px;
        --turn1: 28deg;
        --turn2: 16deg;
        --turn3: -38deg;
      }

      .growth-ornament-orb {
        border-radius: 999px;
        background:
          radial-gradient(circle at 30% 30%, rgba(255, 251, 236, 0.96), rgba(255, 239, 199, 0.86) 40%, rgba(214, 168, 82, 0.52) 70%, transparent 100%);
        box-shadow:
          0 0 0 1px rgba(255, 239, 199, 0.28),
          0 12px 24px rgba(214, 168, 82, 0.18);
      }

      .growth-ornament-spark {
        border-radius: 999px;
        background: radial-gradient(circle, rgba(255, 249, 226, 0.95) 0 18%, rgba(255, 239, 199, 0.18) 22%, transparent 58%);
      }

      .growth-ornament-spark::before,
      .growth-ornament-spark::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        width: calc(var(--w, 18px) * 0.95);
        height: 2px;
        border-radius: 999px;
        background:
          linear-gradient(
            90deg,
            transparent,
            rgba(255, 247, 220, 0.96) 28%,
            rgba(214, 168, 82, 0.7) 54%,
            transparent
          );
        transform: translate(-50%, -50%) rotate(45deg);
      }

      .growth-ornament-spark::after {
        transform: translate(-50%, -50%) rotate(-45deg);
      }

      .growth-ornament-ribbon {
        border-radius: 999px;
        background: linear-gradient(135deg, rgba(255, 247, 220, 0.94), rgba(255, 222, 152, 0.92));
        box-shadow:
          0 0 0 1px rgba(255, 239, 199, 0.24),
          0 14px 22px rgba(214, 168, 82, 0.16);
      }

      .growth-ornament:nth-child(1) {
        --x: -412px;
        --y: -292px;
        --dx: 64px;
        --dy: 32px;
        --w: 32px;
        --h: 32px;
        --r: 8deg;
        --duration: 4.3s;
        --delay: 20ms;
      }

      .growth-ornament:nth-child(2) {
        --x: -296px;
        --y: -346px;
        --dx: 48px;
        --dy: 42px;
        --w: 24px;
        --h: 24px;
        --duration: 3.8s;
        --delay: 90ms;
      }

      .growth-ornament:nth-child(3) {
        --x: -96px;
        --y: -388px;
        --dx: 24px;
        --dy: 48px;
        --w: 16px;
        --h: 16px;
        --duration: 3.2s;
        --delay: 140ms;
      }

      .growth-ornament:nth-child(4) {
        --x: 62px;
        --y: -372px;
        --dx: -42px;
        --dy: 36px;
        --w: 96px;
        --h: 12px;
        --r: -22deg;
        --duration: 4.9s;
        --delay: 210ms;
        --glint: 3.6s;
      }

      .growth-ornament:nth-child(5) {
        --x: 274px;
        --y: -326px;
        --dx: -48px;
        --dy: 54px;
        --w: 28px;
        --h: 28px;
        --duration: 4.1s;
        --delay: 130ms;
      }

      .growth-ornament:nth-child(6) {
        --x: 424px;
        --y: -168px;
        --dx: -56px;
        --dy: 12px;
        --w: 24px;
        --h: 24px;
        --r: 12deg;
        --duration: 4.7s;
        --delay: 180ms;
      }

      .growth-ornament:nth-child(7) {
        --x: 472px;
        --y: 18px;
        --dx: -62px;
        --dy: 54px;
        --w: 118px;
        --h: 14px;
        --r: 84deg;
        --duration: 5.1s;
        --delay: 260ms;
        --glint: 4s;
      }

      .growth-ornament:nth-child(8) {
        --x: 398px;
        --y: 224px;
        --dx: -64px;
        --dy: -28px;
        --w: 24px;
        --h: 24px;
        --duration: 3.7s;
        --delay: 300ms;
      }

      .growth-ornament:nth-child(9) {
        --x: 242px;
        --y: 358px;
        --dx: -42px;
        --dy: -52px;
        --w: 22px;
        --h: 22px;
        --duration: 4.2s;
        --delay: 340ms;
      }

      .growth-ornament:nth-child(10) {
        --x: 24px;
        --y: 414px;
        --dx: 48px;
        --dy: -40px;
        --w: 112px;
        --h: 14px;
        --r: 8deg;
        --duration: 5.3s;
        --delay: 380ms;
        --glint: 3.8s;
      }

      .growth-ornament:nth-child(11) {
        --x: -168px;
        --y: 372px;
        --dx: 34px;
        --dy: -44px;
        --w: 22px;
        --h: 22px;
        --duration: 3.6s;
        --delay: 420ms;
      }

      .growth-ornament:nth-child(12) {
        --x: -376px;
        --y: 286px;
        --dx: 58px;
        --dy: -48px;
        --w: 28px;
        --h: 28px;
        --duration: 4.8s;
        --delay: 460ms;
      }

      .growth-ornament:nth-child(13) {
        --x: -476px;
        --y: 84px;
        --dx: 56px;
        --dy: 54px;
        --w: 118px;
        --h: 14px;
        --r: 96deg;
        --duration: 5.2s;
        --delay: 500ms;
        --glint: 4.2s;
      }

      .growth-ornament:nth-child(14) {
        --x: -428px;
        --y: -162px;
        --dx: 46px;
        --dy: 36px;
        --w: 24px;
        --h: 24px;
        --duration: 3.9s;
        --delay: 560ms;
      }

      .growth-ornament:nth-child(15) {
        --x: -262px;
        --y: -44px;
        --dx: 38px;
        --dy: -46px;
        --w: 18px;
        --h: 18px;
        --duration: 3.4s;
        --delay: 620ms;
      }

      .growth-ornament:nth-child(16) {
        --x: 156px;
        --y: -214px;
        --dx: -34px;
        --dy: -38px;
        --w: 18px;
        --h: 18px;
        --duration: 3.1s;
        --delay: 680ms;
      }

      .growth-ornament:nth-child(17) {
        --x: 508px;
        --y: -246px;
        --dx: -72px;
        --dy: 48px;
        --w: 30px;
        --h: 30px;
        --r: 10deg;
        --duration: 4.5s;
        --delay: 120ms;
      }

      .growth-ornament:nth-child(18) {
        --x: 566px;
        --y: 148px;
        --dx: -86px;
        --dy: -34px;
        --w: 126px;
        --h: 16px;
        --r: 58deg;
        --duration: 5.5s;
        --delay: 240ms;
        --glint: 4.4s;
      }

      .growth-ornament:nth-child(19) {
        --x: 334px;
        --y: 438px;
        --dx: -54px;
        --dy: -72px;
        --w: 26px;
        --h: 26px;
        --duration: 3.8s;
        --delay: 360ms;
      }

      .growth-ornament:nth-child(20) {
        --x: -28px;
        --y: 506px;
        --dx: 42px;
        --dy: -86px;
        --w: 32px;
        --h: 32px;
        --duration: 4.6s;
        --delay: 520ms;
      }

      .growth-ornament:nth-child(21) {
        --x: -522px;
        --y: 238px;
        --dx: 76px;
        --dy: -48px;
        --w: 124px;
        --h: 16px;
        --r: 116deg;
        --duration: 5.7s;
        --delay: 260ms;
        --glint: 4.6s;
      }

      .growth-ornament:nth-child(22) {
        --x: -556px;
        --y: -214px;
        --dx: 82px;
        --dy: 44px;
        --w: 26px;
        --h: 26px;
        --duration: 3.7s;
        --delay: 440ms;
      }

      .growth-ornament:nth-child(23) {
        --x: 18px;
        --y: -500px;
        --dx: -20px;
        --dy: 84px;
        --w: 28px;
        --h: 28px;
        --duration: 4.1s;
        --delay: 600ms;
      }

      .growth-ornament:nth-child(24) {
        --x: 214px;
        --y: -462px;
        --dx: -56px;
        --dy: 78px;
        --w: 24px;
        --h: 24px;
        --duration: 3.5s;
        --delay: 700ms;
      }

      .growth-dialog::before {
        content: '';
        position: absolute;
        inset: -1px;
        background:
          linear-gradient(135deg, rgba(255, 255, 255, 0.18), transparent 34%),
          linear-gradient(180deg, rgba(214, 168, 82, 0.12), transparent 42%);
        pointer-events: none;
      }

      .growth-dialog::after {
        content: '';
        position: absolute;
        top: -42px;
        right: -54px;
        width: 168px;
        height: 168px;
        border-radius: 999px;
        background: radial-gradient(circle, rgba(214, 168, 82, 0.24), transparent 72%);
        pointer-events: none;
        transform: rotate(12deg);
      }

      .growth-root[data-open="1"] .growth-overlay {
        opacity: 1;
      }

      .growth-root[data-open="1"] .growth-stage::before {
        opacity: 0.9;
        animation: growth-stage-glow 10.8s ease-in-out infinite alternate;
      }

      .growth-root[data-open="1"] .growth-stage::after {
        opacity: 0.58;
        animation:
          growth-stage-spin 22s linear infinite,
          growth-stage-pulse 7.6s ease-in-out infinite alternate;
      }

      .growth-root[data-open="1"] .growth-ornaments {
        animation: growth-ornaments-sway 24s ease-in-out infinite alternate;
      }

      .growth-root[data-open="1"] .growth-dialog {
        opacity: 1;
        visibility: visible;
        transform: translate3d(0, 0, 0) scale(1);
        transition-delay: 0ms;
      }

      .growth-root[data-open="1"] .growth-ornament {
        animation:
          growth-ornament-in 460ms var(--ui-ease-out-expo) both,
          growth-ornament-float calc(var(--duration, 5s) + 7.4s) linear infinite,
          growth-ornament-twinkle calc(var(--glint, 2.8s) + 1.8s) ease-in-out infinite;
        animation-delay: var(--delay, 0ms), calc(var(--delay, 0ms) + 420ms), calc(var(--delay, 0ms) + 180ms);
      }

      .growth-close {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 1;
      }

      .growth-title,
      .growth-body,
      .growth-stats,
      .growth-footer {
        position: relative;
        z-index: 1;
      }

      .growth-title {
        margin: 0;
        padding-right: 42px;
        font-size: clamp(27px, 4.4vw, 32px);
        line-height: 1.06;
        font-weight: 700;
        letter-spacing: -0.028em;
        text-wrap: pretty;
        word-break: normal;
      }

      .growth-body {
        margin: 0;
        font-size: 16px;
        line-height: 1.68;
        color: color-mix(in srgb, var(--ui-text) 76%, var(--ui-muted));
      }

      .growth-stats {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0;
        border: 1px solid color-mix(in srgb, var(--growth-accent) 22%, var(--ui-panel-border));
        border-radius: 18px;
        overflow: hidden;
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 54%),
          color-mix(in srgb, var(--growth-accent-soft) 72%, var(--ui-panel-bg));
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
      }

      .growth-stat {
        min-width: 0;
        display: grid;
        gap: 4px;
        padding: 18px 18px 16px;
        justify-items: center;
        align-content: center;
        text-align: center;
      }

      .growth-stat + .growth-stat {
        border-left: 1px solid color-mix(in srgb, var(--growth-accent) 18%, var(--ui-panel-border));
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 72%);
      }

      .growth-stat-value {
        display: block;
        font-size: clamp(28px, 4vw, 34px);
        line-height: 1;
        font-weight: 700;
        letter-spacing: -0.05em;
        color: var(--ui-text);
      }

      .growth-stat-label {
        display: block;
        font-size: 12px;
        line-height: 1.35;
        color: color-mix(in srgb, var(--ui-text) 72%, var(--ui-muted));
      }

      .growth-footer {
        display: grid;
        gap: var(--growth-space-3);
        padding-top: var(--growth-space-4);
        border-top: 1px solid color-mix(in srgb, var(--growth-accent) 12%, var(--ui-panel-border));
      }

      .growth-actions {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--growth-space-2);
      }

      .growth-action {
        width: 100%;
        min-height: 48px;
        justify-content: center;
        gap: 8px;
        padding-inline: 16px;
        text-align: center;
      }

      .growth-action::after {
        content: '↗';
        font-size: 13px;
        line-height: 1;
        opacity: 0.82;
        transition:
          transform 160ms var(--ui-ease-out-quart),
          opacity 160ms ease;
      }

      .growth-action:hover::after {
        transform: translate3d(2px, -2px, 0);
        opacity: 1;
      }

      .growth-action-primary {
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.14), transparent 56%),
          linear-gradient(135deg, rgba(214, 168, 82, 0.9), rgba(255, 239, 199, 0.76));
        border-color: color-mix(in srgb, var(--growth-accent) 58%, white);
        color: #1a1306;
        box-shadow:
          0 16px 28px rgba(214, 168, 82, 0.22),
          inset 0 1px 0 rgba(255, 255, 255, 0.34);
      }

      .growth-action-primary:hover {
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.16), transparent 56%),
          linear-gradient(135deg, rgba(224, 179, 93, 0.96), rgba(255, 239, 199, 0.82));
        border-color: color-mix(in srgb, var(--growth-accent) 68%, white);
        color: #120d03;
      }

      .growth-action-secondary {
        background:
          linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 58%),
          color-mix(in srgb, var(--growth-accent-soft) 38%, var(--ui-control-bg));
        border-color: color-mix(in srgb, var(--growth-accent) 18%, var(--ui-control-border));
      }

      .growth-hide-row {
        display: flex;
        justify-content: center;
      }

      .growth-hide {
        min-height: 36px;
        border: none;
        background: transparent;
        color: var(--ui-muted);
        box-shadow: none;
      }

      .growth-hide:hover,
      .growth-hide:focus-visible {
        color: var(--ui-text);
        background: transparent;
        border-color: transparent;
        box-shadow: none;
      }

      .growth-root[data-open="1"] .growth-title,
      .growth-root[data-open="1"] .growth-body,
      .growth-root[data-open="1"] .growth-stats,
      .growth-root[data-open="1"] .growth-footer {
        animation: growth-rise-in 260ms var(--ui-ease-out-expo) both;
      }

      .growth-root[data-open="1"] .growth-title {
        animation-delay: 24ms;
      }

      .growth-root[data-open="1"] .growth-body {
        animation-delay: 44ms;
      }

      .growth-root[data-open="1"] .growth-stats {
        animation-delay: 64ms;
      }

      .growth-root[data-open="1"] .growth-footer {
        animation-delay: 112ms;
      }

      @keyframes growth-rise-in {
        from {
          opacity: 0;
          transform: translate3d(0, 12px, 0);
        }

        to {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }

      @keyframes growth-stage-glow {
        from {
          transform: translate3d(0, 0, 0) scale(0.96);
        }

        to {
          transform: translate3d(0, -10px, 0) scale(1.08);
        }
      }

      @keyframes growth-stage-spin {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
        }
      }

      @keyframes growth-stage-pulse {
        from {
          opacity: 0.42;
        }

        to {
          opacity: 0.74;
        }
      }

      @keyframes growth-ornaments-sway {
        from {
          transform: translate3d(-12px, -8px, 0) rotate(-3deg) scale(var(--ornament-scale, 1));
        }

        50% {
          transform: translate3d(16px, 10px, 0) rotate(2deg) scale(var(--ornament-scale, 1));
        }

        to {
          transform: translate3d(-6px, 18px, 0) rotate(-2deg) scale(var(--ornament-scale, 1));
        }
      }

      @keyframes growth-ornament-in {
        from {
          opacity: 0;
          transform: translate3d(calc(var(--x) * 0.82), calc(var(--y) * 0.82), 0) scale(0.4) rotate(calc(var(--r, 0deg) - 16deg));
        }

        to {
          opacity: 0.9;
          transform: translate3d(var(--x), var(--y), 0) scale(1) rotate(var(--r, 0deg));
        }
      }

      @keyframes growth-ornament-float {
        0% {
          opacity: 0.62;
          transform: translate3d(var(--x), var(--y), 0) scale(1) rotate(var(--r, 0deg));
        }

        20% {
          opacity: 0.92;
          transform:
            translate3d(calc(var(--x) + var(--mx1, 0px)), calc(var(--y) + var(--my1, 0px)), 0)
            scale(var(--s1, 1.14))
            rotate(calc(var(--r, 0deg) + var(--turn1, 24deg)));
        }

        42% {
          opacity: 0.94;
          transform:
            translate3d(calc(var(--x) + var(--mx2, 0px)), calc(var(--y) + var(--my2, 0px)), 0)
            scale(var(--s2, 0.9))
            rotate(calc(var(--r, 0deg) + var(--turn2, -20deg)));
        }

        64% {
          opacity: 0.86;
          transform:
            translate3d(calc(var(--x) + var(--mx3, 0px)), calc(var(--y) + var(--my3, 0px)), 0)
            scale(1.02)
            rotate(calc(var(--r, 0deg) + 12deg));
        }

        84% {
          opacity: 0.74;
          transform:
            translate3d(calc(var(--x) + var(--dx, 0px)), calc(var(--y) + var(--dy, 0px)), 0)
            scale(var(--s3, 1.08))
            rotate(calc(var(--r, 0deg) + var(--turn3, 32deg)));
        }

        100% {
          opacity: 0.62;
          transform: translate3d(var(--x), var(--y), 0) scale(1) rotate(var(--r, 0deg));
        }
      }

      @keyframes growth-ornament-twinkle {
        0%,
        100% {
          filter: brightness(1) saturate(1);
        }

        50% {
          filter: brightness(1.24) saturate(1.18);
        }
      }

      @media (max-width: 560px) {
        .growth-stage {
          width: calc(100vw - 2px);
        }

        .growth-stage::before {
          inset: -42px -34px;
        }

        .growth-stage::after {
          inset: -58px -48px;
        }

        .growth-dialog {
          width: calc(100vw - 20px);
          padding: 20px 16px 16px;
          gap: 18px;
        }

        .growth-ornaments {
          inset: -72px -52px;
          --ornament-scale: 0.76;
        }

        .growth-actions,
        .growth-stats {
          grid-template-columns: 1fr;
        }

        .growth-stat + .growth-stat {
          border-left: none;
          border-top: 1px solid color-mix(in srgb, var(--growth-accent) 18%, var(--ui-panel-border));
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .growth-ornaments {
          display: none !important;
        }

        .growth-stage::before,
        .growth-stage::after,
        .growth-overlay,
        .growth-dialog,
        .growth-action::after,
        .growth-title,
        .growth-body,
        .growth-stats,
        .growth-footer {
          transition: none !important;
          animation: none !important;
        }

        .growth-action:hover::after {
          transform: none !important;
        }
      }
    `;
  return style;
}

function bindUiEvents(currentUi: GrowthPromptUi): void {
  currentUi.closeButton.addEventListener('click', () => {
    handleDismiss();
  });
  currentUi.primaryButton.addEventListener('click', () => {
    handleComplete('store');
  });
  currentUi.secondaryButton.addEventListener('click', () => {
    handleComplete('repo');
  });
  currentUi.hideButton.addEventListener('click', () => {
    handleComplete('hide');
  });
  currentUi.shadow.addEventListener('keydown', (event) => {
    if (event instanceof KeyboardEvent) {
      handleShadowKeydown(event);
    }
  });
}

function startPolling(): void {
  if (pollTimer) {
    return;
  }
  pollTimer = window.setInterval(() => {
    if (location.href !== currentUrl) {
      currentUrl = location.href;
      scheduleEligibilityCheck();
      return;
    }
    if (open) {
      syncTheme();
      return;
    }
    scheduleEligibilityCheck();
  }, CHECK_POLL_MS);
}

function scheduleEligibilityCheck(): void {
  if (checkTimer) {
    window.clearTimeout(checkTimer);
  }
  checkTimer = window.setTimeout(() => {
    checkTimer = null;
    void maybeShowGrowthPrompt();
  }, CHECK_DEBOUNCE_MS);
}

async function maybeShowGrowthPrompt(): Promise<void> {
  if (checking || open || !ui || document.readyState !== 'complete') {
    return;
  }
  checking = true;

  try {
    if (FORCE_SHOW_FOR_TESTING && shownUrl === currentUrl) {
      return;
    }

    const statusResult = await getGrowthStatus();
    if (!statusResult?.ok) {
      return;
    }

    if (FORCE_SHOW_FOR_TESTING) {
      if (statusResult.status.stats.completedAction === 'hide') {
        return;
      }
      shownUrl = currentUrl;
      showGrowthPrompt(statusResult.status);
      return;
    }

    const core = ns.core;
    if (!core || typeof core.getConversationIndexState !== 'function') {
      return;
    }

    const indexState = core.getConversationIndexState();
    if (!indexState || !indexState.ready || !indexState.hasConversation) {
      return;
    }

    if (!statusResult.status.eligible) {
      return;
    }

    const markShownResult = await markGrowthShown();
    if (!markShownResult?.ok) {
      return;
    }

    showGrowthPrompt(markShownResult.status);
  } finally {
    checking = false;
  }
}

function showGrowthPrompt(status: GrowthStatus): void {
  if (!ui) {
    return;
  }

  syncTheme();
  renderCounts(status);
  ui.title.textContent = t('growth_modal_title');
  ui.body.textContent = t('growth_modal_body');
  ui.root.dataset.open = '1';
  ui.dialog.setAttribute('aria-hidden', 'false');
  open = true;
  lockScroll();
  window.setTimeout(() => {
    if (open) {
      ui?.primaryButton.focus();
    }
  }, 40);
}

function renderCounts(status: GrowthStatus): void {
  if (!ui) {
    return;
  }

  ui.usageDaysValue.textContent = String(status.stats.usageDays);
  ui.usageDaysLabel.textContent = tp('growth_modal_usage_days', status.stats.usageDays);
  ui.totalUsesValue.textContent = String(status.totalUses);
  ui.totalUsesLabel.textContent = tp('growth_modal_total_uses', status.totalUses);
}

function hideGrowthPrompt(): void {
  if (!ui || !open) {
    return;
  }
  open = false;
  ui.root.dataset.open = '0';
  ui.dialog.setAttribute('aria-hidden', 'true');
  unlockScroll();
}

function handleDismiss(): void {
  hideGrowthPrompt();
  if (FORCE_SHOW_FOR_TESTING) {
    return;
  }
  void dismissGrowth();
}

function handleComplete(action: GrowthPromptAction): void {
  hideGrowthPrompt();
  if (action === 'hide') {
    void completeGrowth(action);
    return;
  }
  if (FORCE_SHOW_FOR_TESTING) {
    openGrowthLink(action);
    return;
  }
  void completeGrowth(action);
  openGrowthLink(action);
}

function openGrowthLink(action: GrowthPromptAction): void {
  if (action === 'hide') {
    return;
  }
  const href = action === 'store' ? GROWTH_LINKS.store : GROWTH_LINKS.repo;
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.style.display = 'none';
  (document.body || document.documentElement).appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function handleShadowKeydown(event: KeyboardEvent): void {
  if (!open || !ui) {
    return;
  }

  if (event.key === 'Escape') {
    event.preventDefault();
    handleDismiss();
    return;
  }

  if (event.key !== 'Tab') {
    return;
  }

  const focusable = getFocusableElements(ui.dialog);
  if (!focusable.length) {
    event.preventDefault();
    ui.dialog.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const activeElement = ui.shadow.activeElement instanceof HTMLElement ? ui.shadow.activeElement : null;

  if (!activeElement || !focusable.includes(activeElement)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
    return;
  }

  if (!event.shiftKey && activeElement === last) {
    event.preventDefault();
    first.focus();
    return;
  }

  if (event.shiftKey && activeElement === first) {
    event.preventDefault();
    last.focus();
  }
}

function getFocusableElements(root: ParentNode): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => element.offsetParent !== null || element === document.activeElement);
}

function lockScroll(): void {
  previousDocumentOverflow = document.documentElement.style.overflow;
  previousBodyOverflow = document.body ? document.body.style.overflow : '';
  document.documentElement.style.overflow = 'hidden';
  if (document.body) {
    document.body.style.overflow = 'hidden';
  }
}

function unlockScroll(): void {
  document.documentElement.style.overflow = previousDocumentOverflow;
  if (document.body) {
    document.body.style.overflow = previousBodyOverflow;
  }
}

function syncTheme(): void {
  if (!ui) {
    return;
  }

  const siteId = getCurrentSiteId();
  const colorScheme = getCurrentColorScheme(siteId);
  const preset = getUiThemePreset(siteId, colorScheme);
  const kitVars = preset.kit && typeof preset.kit === 'object' ? preset.kit : null;
  if (kitVars) {
    replaceCssVars(ui.root, kitVars, UI_KIT_THEME_VAR_KEYS);
  }
  ui.root.dataset.site = siteId;
  ui.root.dataset.colorScheme = colorScheme;
}

function getCurrentSiteId(): SiteId {
  if (ns.site && typeof ns.site.getCurrentSiteId === 'function') {
    return ns.site.getCurrentSiteId();
  }
  const host = typeof location !== 'undefined' ? location.hostname : '';
  if (host === 'gemini.google.com') {
    return 'gemini';
  }
  if (host === 'claude.ai') {
    return 'claude';
  }
  if (host === 'chatgpt.com' || host === 'chat.openai.com') {
    return 'chatgpt';
  }
  return 'generic';
}

function getCurrentColorScheme(siteId: SiteId): ColorScheme {
  if (siteId === 'chatgpt') {
    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    if (document.documentElement.classList.contains('light')) {
      return 'light';
    }
  } else if (siteId === 'gemini') {
    if (document.body?.classList.contains('dark-theme')) {
      return 'dark';
    }
    if (document.body?.classList.contains('light-theme')) {
      return 'light';
    }
  } else if (siteId === 'claude') {
    const dataMode = document.documentElement.getAttribute('data-mode');
    if (dataMode === 'dark' || document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    if (dataMode === 'light') {
      return 'light';
    }
  }

  if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

ns.growthPrompt = Object.assign({}, ns.growthPrompt, {
  start
});
window.ChatGptNav = ns;
