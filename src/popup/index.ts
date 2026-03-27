import {
  createFormulaSettingsApi,
  type ChromeLike,
  type FormulaSettingsApi
} from '../shared/formula-settings';
import {
  createPromptEntrySettingsApi,
  type PromptEntrySettingsApi
} from '../shared/prompt-entry-settings';
import { startDocumentDevReload } from '../shared/dev-reload';
import { UI_KIT_STYLE_TEXT } from '../shared/ui-kit/styles';
import { getUiThemePreset, replaceCssVars, UI_KIT_THEME_VAR_KEYS } from '../shared/ui-kit/theme';

const LINKS = {
  repo: 'https://github.com/hysltway/JumpNav',
  store: 'https://chromewebstore.google.com/detail/jumpnav-the-most-elegant/kkemkfabmgjcjlileggigaaemcheapep',
  bug: 'https://github.com/hysltway/JumpNav/issues/new?labels=bug&title=%5BBug%5D%20',
  feature: 'https://github.com/hysltway/JumpNav/issues/new?labels=enhancement&title=%5BFeature%5D%20'
} as const;

type LinkKey = keyof typeof LINKS;

interface PopupEnvironment {
  documentRef: Document;
  windowRef: Window;
  chromeRef: ChromeLike | null;
  formulaSettingsApi: FormulaSettingsApi;
  promptEntrySettingsApi: PromptEntrySettingsApi;
}

const POPUP_UI_KIT_STYLE_ID = 'jumpnav-popup-ui-kit-style';

function createEnvironment(overrides: Partial<PopupEnvironment> = {}): PopupEnvironment {
  const chromeRef =
    overrides.chromeRef ?? (typeof chrome !== 'undefined' ? (chrome as unknown as ChromeLike) : null);

  return {
    documentRef: overrides.documentRef || document,
    windowRef: overrides.windowRef || window,
    chromeRef,
    formulaSettingsApi: overrides.formulaSettingsApi || createFormulaSettingsApi({ chromeRef }),
    promptEntrySettingsApi: overrides.promptEntrySettingsApi || createPromptEntrySettingsApi({ chromeRef })
  };
}

function createPopupController(environment: Partial<PopupEnvironment> = {}) {
  const env = createEnvironment(environment);

  function start(): void {
    ensureUiKitStyle();
    syncUiKitTheme();
    bindThemeTracking();

    env.documentRef.addEventListener('DOMContentLoaded', () => {
      syncVersionPill();
      bindLinkButtons();
      void initFormulaSettings();
      void initPromptEntrySettings();
    });
  }

  function ensureUiKitStyle(): void {
    if (env.documentRef.getElementById(POPUP_UI_KIT_STYLE_ID)) {
      return;
    }

    const style = env.documentRef.createElement('style');
    style.id = POPUP_UI_KIT_STYLE_ID;
    style.textContent = UI_KIT_STYLE_TEXT;
    (env.documentRef.head || env.documentRef.documentElement).appendChild(style);
  }

  function syncUiKitTheme(): void {
    const colorScheme =
      env.windowRef.matchMedia && env.windowRef.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const preset = getUiThemePreset('generic', colorScheme);
    const kitVars = preset.kit && typeof preset.kit === 'object' ? preset.kit : null;
    if (!kitVars || !env.documentRef.documentElement) {
      return;
    }
    replaceCssVars(env.documentRef.documentElement, kitVars, UI_KIT_THEME_VAR_KEYS);
  }

  function bindThemeTracking(): void {
    if (!env.windowRef.matchMedia) {
      return;
    }

    const media = env.windowRef.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      syncUiKitTheme();
    };

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange);
      return;
    }

    if (typeof media.addListener === 'function') {
      media.addListener(handleChange);
    }
  }

  function syncVersionPill(): void {
    const versionPill = env.documentRef.getElementById('version-pill');
    if (!versionPill) {
      return;
    }

    try {
      if (env.chromeRef && 'runtime' in env.chromeRef && chrome?.runtime?.getManifest) {
        const manifest = chrome.runtime.getManifest();
        if (manifest.version) {
          versionPill.textContent = `v${manifest.version}`;
        }
      }
    } catch {
      // Keep the fallback text from popup.html.
    }
  }

  function bindLinkButtons(): void {
    const buttons = env.documentRef.querySelectorAll<HTMLElement>('[data-link]');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const linkKey = button.dataset.link as LinkKey | undefined;
        openLink(linkKey);
      });
    });
  }

  function openLink(linkKey: LinkKey | undefined): void {
    if (!linkKey) {
      return;
    }

    const url = LINKS[linkKey];
    if (!url) {
      return;
    }

    if (
      env.chromeRef &&
      'tabs' in env.chromeRef &&
      chrome?.tabs &&
      typeof chrome.tabs.create === 'function'
    ) {
      chrome.tabs.create({ url });
      return;
    }

    env.windowRef.open(url, '_blank', 'noopener,noreferrer');
  }

  async function initFormulaSettings(): Promise<void> {
    const enabledInput = env.documentRef.getElementById('formula-enabled');

    if (!(enabledInput instanceof HTMLInputElement)) {
      return;
    }

    const settings = await env.formulaSettingsApi.read();
    enabledInput.checked = settings.enableFormulaCopy;

    const persistSettings = async (): Promise<void> => {
      const nextSettings = env.formulaSettingsApi.normalize({
        enableFormulaCopy: enabledInput.checked
      });
      await env.formulaSettingsApi.write(nextSettings);
    };

    enabledInput.addEventListener('change', () => {
      void persistSettings();
    });
  }

  async function initPromptEntrySettings(): Promise<void> {
    const enabledInput = env.documentRef.getElementById('prompt-entry-enabled');
    if (!(enabledInput instanceof HTMLInputElement)) {
      return;
    }

    enabledInput.checked = await env.promptEntrySettingsApi.read();

    enabledInput.addEventListener('change', () => {
      void env.promptEntrySettingsApi.write(enabledInput.checked);
    });
  }

  return {
    start
  };
}

createPopupController().start();
startDocumentDevReload();
