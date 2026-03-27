type MessageSubstitutions = string | number | Array<string | number>;

const ATTRIBUTE_MESSAGE_MAP = Object.freeze({
  'data-i18n': 'textContent',
  'data-i18n-aria-label': 'aria-label',
  'data-i18n-title': 'title',
  'data-i18n-placeholder': 'placeholder',
  'data-i18n-alt': 'alt'
} as const);

type AttributeKey = keyof typeof ATTRIBUTE_MESSAGE_MAP;

interface ChromeI18nLike {
  getMessage(messageName: string, substitutions?: string | string[]): string;
  getUILanguage?(): string;
}

function getI18nApi(): ChromeI18nLike | null {
  if (typeof chrome === 'undefined' || !chrome.i18n || typeof chrome.i18n.getMessage !== 'function') {
    return null;
  }
  return chrome.i18n as ChromeI18nLike;
}

function normalizeSubstitutions(substitutions?: MessageSubstitutions): string | string[] | undefined {
  if (typeof substitutions === 'undefined') {
    return undefined;
  }
  if (Array.isArray(substitutions)) {
    return substitutions.map((item) => String(item));
  }
  return String(substitutions);
}

function readMessage(messageName: string, substitutions?: MessageSubstitutions): string {
  const i18n = getI18nApi();
  if (!i18n) {
    return '';
  }
  try {
    return i18n.getMessage(messageName, normalizeSubstitutions(substitutions)) || '';
  } catch {
    return '';
  }
}

export function t(messageName: string, substitutions?: MessageSubstitutions): string {
  return readMessage(messageName, substitutions) || messageName;
}

export function tp(messageBase: string, count: number, extraSubstitutions: Array<string | number> = []): string {
  const locale = getUiLocale();
  const category = new Intl.PluralRules(locale).select(count);
  const substitutions = [count, ...extraSubstitutions];
  return (
    readMessage(`${messageBase}_${category}`, substitutions) ||
    readMessage(`${messageBase}_other`, substitutions) ||
    String(count)
  );
}

export function getUiLocale(): string {
  const i18n = getI18nApi();
  const uiLanguage =
    (i18n && typeof i18n.getUILanguage === 'function' ? i18n.getUILanguage() : '') ||
    readMessage('@@ui_locale') ||
    (typeof navigator !== 'undefined' ? navigator.language : '') ||
    'en';
  return uiLanguage.replace(/_/g, '-');
}

function applyElementMessage(element: Element, attributeName: AttributeKey): void {
  const messageName = element.getAttribute(attributeName);
  if (!messageName) {
    return;
  }
  const value = t(messageName);
  const targetAttribute = ATTRIBUTE_MESSAGE_MAP[attributeName];
  if (targetAttribute === 'textContent') {
    element.textContent = value;
    return;
  }
  element.setAttribute(targetAttribute, value);
}

export function localizeDocument(documentRef: Document = document): void {
  const root = documentRef.documentElement;
  if (root) {
    root.lang = getUiLocale();
  }

  (Object.keys(ATTRIBUTE_MESSAGE_MAP) as AttributeKey[]).forEach((attributeName) => {
    documentRef.querySelectorAll(`[${attributeName}]`).forEach((element) => {
      applyElementMessage(element, attributeName);
    });
  });
}
