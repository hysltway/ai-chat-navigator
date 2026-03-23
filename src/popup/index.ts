import {
  createFormulaSettingsApi,
  type ChromeLike,
  type FormulaSettingsApi
} from '../shared/formula-settings';

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
}

function updateEngineFieldState(formatSelect: HTMLSelectElement, engineSelect: HTMLSelectElement): void {
  const isLatexOnly = formatSelect.value === 'latex';
  engineSelect.disabled = isLatexOnly;
  engineSelect.title = isLatexOnly ? 'MathML engine is used only when format is MathML.' : '';
}

function createEnvironment(overrides: Partial<PopupEnvironment> = {}): PopupEnvironment {
  const chromeRef =
    overrides.chromeRef ?? (typeof chrome !== 'undefined' ? (chrome as unknown as ChromeLike) : null);

  return {
    documentRef: overrides.documentRef || document,
    windowRef: overrides.windowRef || window,
    chromeRef,
    formulaSettingsApi: overrides.formulaSettingsApi || createFormulaSettingsApi({ chromeRef })
  };
}

function createPopupController(environment: Partial<PopupEnvironment> = {}) {
  const env = createEnvironment(environment);

  function start(): void {
    env.documentRef.addEventListener('DOMContentLoaded', () => {
      syncVersionPill();
      bindLinkButtons();
      void initFormulaSettings();
    });
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
    const formatSelect = env.documentRef.getElementById('formula-format');
    const engineSelect = env.documentRef.getElementById('formula-engine');

    if (
      !(enabledInput instanceof HTMLInputElement) ||
      !(formatSelect instanceof HTMLSelectElement) ||
      !(engineSelect instanceof HTMLSelectElement)
    ) {
      return;
    }

    const settings = await env.formulaSettingsApi.read();
    enabledInput.checked = settings.enableFormulaCopy;
    formatSelect.value = settings.formulaFormat;
    engineSelect.value = settings.formulaEngine;
    updateEngineFieldState(formatSelect, engineSelect);

    const persistSettings = async (): Promise<void> => {
      const nextSettings = env.formulaSettingsApi.normalize({
        enableFormulaCopy: enabledInput.checked,
        formulaFormat: formatSelect.value,
        formulaEngine: engineSelect.value
      });
      updateEngineFieldState(formatSelect, engineSelect);
      await env.formulaSettingsApi.write(nextSettings);
    };

    enabledInput.addEventListener('change', () => {
      void persistSettings();
    });
    formatSelect.addEventListener('change', () => {
      void persistSettings();
    });
    engineSelect.addEventListener('change', () => {
      void persistSettings();
    });
  }

  return {
    start
  };
}

createPopupController().start();
