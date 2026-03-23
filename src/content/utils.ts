import { ns } from './namespace';
import type { UtilsApi } from './types';

const DEFAULT_HIDDEN_TEXT_SELECTORS = [
  '.cdk-visually-hidden',
  '.visually-hidden',
  '.sr-only',
  '[aria-hidden="true"]',
  '[hidden]',
  '[style*="display:none"]',
  '[style*="display: none"]',
  '[style*="visibility:hidden"]',
  '[style*="visibility: hidden"]'
].join(',');

interface UtilsEnvironment {
  hiddenTextSelectors?: string;
}

function createUtilsApi(overrides: UtilsEnvironment = {}): UtilsApi {
  const hiddenTextSelectors = overrides.hiddenTextSelectors || DEFAULT_HIDDEN_TEXT_SELECTORS;

  function normalizeText(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }

  function getTextWithoutHidden(node: Node | null): string {
    if (!node) {
      return '';
    }

    const source = typeof node.cloneNode === 'function' ? node.cloneNode(true) : node;
    if (source instanceof Element) {
      source.querySelectorAll(hiddenTextSelectors).forEach((hidden) => {
        hidden.remove();
      });
    }

    return normalizeText(source.textContent || '');
  }

  function truncate(value: string, maxLen: number): string {
    if (value.length <= maxLen) {
      return value;
    }
    return `${value.slice(0, maxLen - 3)}...`;
  }

  return {
    normalizeText,
    getTextWithoutHidden,
    truncate
  };
}

const utilsApi = createUtilsApi();
ns.utils = Object.assign({}, ns.utils, utilsApi, { createUtilsApi });
