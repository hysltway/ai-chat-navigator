import type {
  AdapterApi,
  ConversationIndexState,
  CoreConversationIndexerApi,
  SiteApi,
  StorageApi,
  UiApi,
  UiThemePreset,
  UtilsApi,
  PromptLibraryStoreApi,
  PromptLibrarySiteApi,
  PromptLibraryUiApi,
  CoreNavigationControllerApi,
  CoreThemeApi,
  CoreUiBehaviorApi
} from './types';

export interface Config {
  previewMax: number;
  debounceMs: number;
  pollMs: number;
}

export interface StartableModule {
  start?: () => void;
}

export interface Namespace {
  CONFIG: Config;
  utils?: UtilsApi;
  storage?: StorageApi;
  site?: SiteApi;
  adapters?: AdapterApi;
  coreConversationIndexer?: CoreConversationIndexerApi;
  ui?: UiApi;
  UI_STYLE_TEXT?: string;
  UI_NAV_THEME_VAR_KEYS?: string[];
  UI_THEME_PRESETS?: Record<string, Record<string, UiThemePreset>>;
  getUiThemePreset?: (site: string, scheme: string) => UiThemePreset;
  promptLibraryStore?: PromptLibraryStoreApi & {
    createPromptLibraryStore?: (...args: any[]) => PromptLibraryStoreApi;
  };
  promptLibrarySite?: PromptLibrarySiteApi & {
    createPromptLibrarySiteApi?: (...args: any[]) => PromptLibrarySiteApi;
  };
  promptLibraryUi?: PromptLibraryUiApi;
  coreNavigationController?: CoreNavigationControllerApi;
  coreTheme?: CoreThemeApi;
  coreUiBehavior?: CoreUiBehaviorApi;
  formulaCopy?: StartableModule;
  promptLibrary?: StartableModule;
  core?: StartableModule & {
    hasIndexedConversation?: () => boolean;
    getConversationIndexState?: () => ConversationIndexState;
  };
  [key: string]: any;
}

declare global {
  interface Window {
    ChatGptNav?: Namespace;
  }
}

const DEFAULT_CONFIG: Readonly<Config> = Object.freeze({
  previewMax: 96,
  debounceMs: 300,
  pollMs: 1500
});

function createNamespace(existingNamespace: Partial<Namespace> = {}): Namespace {
  return Object.assign({}, existingNamespace, {
    CONFIG: Object.assign({}, DEFAULT_CONFIG, existingNamespace.CONFIG ?? {})
  }) as Namespace;
}

export const ns = createNamespace(window.ChatGptNav);

window.ChatGptNav = ns;
