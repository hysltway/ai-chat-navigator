import { ns } from './namespace';

const STYLE_ID = 'chatgpt-nav-gemini-quote-reply-style';
const BUTTON_CLASS = 'chatgpt-nav-gemini-quote-reply-button';
const BUTTON_HIDDEN_CLASS = 'is-hidden';
const MESSAGE_SELECTOR = 'user-query, model-response, .conversation-container';
const COMPOSER_SELECTOR = 'rich-textarea, .text-input-field';
const EDITOR_SELECTORS = [
  'rich-textarea [contenteditable="true"]',
  'rich-textarea textarea',
  '.text-input-field [contenteditable="true"]',
  '.text-input-field textarea'
] as const;
const SELECTION_DEBOUNCE_MS = 180;
const BUTTON_GAP_PX = 14;
const VIEWPORT_PADDING_PX = 10;

let started = false;
let quoteButton: HTMLButtonElement | null = null;
let currentSelectionRange: Range | null = null;
let selectionTimer: number | null = null;
let positionRaf: number | null = null;
let internalMouseDown = false;

function getCurrentSiteId(): string {
  if (ns.site && typeof ns.site.getCurrentSiteId === 'function') {
    return ns.site.getCurrentSiteId();
  }
  return typeof location !== 'undefined' ? location.hostname.toLowerCase() : '';
}

function ensureStyle(): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .${BUTTON_CLASS} {
      position: fixed;
      z-index: 2147483647;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      border: 1px solid rgba(18, 24, 38, 0.12);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.96);
      color: #1f2937;
      box-shadow: 0 14px 32px rgba(15, 23, 42, 0.18);
      backdrop-filter: blur(10px);
      font: 500 12px/1.2 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      letter-spacing: 0.01em;
      cursor: pointer;
      user-select: none;
      transition: opacity 120ms ease, transform 140ms ease, background-color 140ms ease;
    }
    .${BUTTON_CLASS}:hover {
      background: rgba(248, 250, 252, 0.98);
      transform: translateY(-1px);
    }
    .${BUTTON_CLASS}:active {
      transform: translateY(0);
    }
    .${BUTTON_CLASS}.${BUTTON_HIDDEN_CLASS} {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transform: translateY(4px);
    }
    .${BUTTON_CLASS} svg {
      width: 14px;
      height: 14px;
      flex: 0 0 auto;
    }
    @media (prefers-color-scheme: dark) {
      .${BUTTON_CLASS} {
        border-color: rgba(226, 232, 240, 0.14);
        background: rgba(15, 23, 42, 0.94);
        color: #e5eefb;
        box-shadow: 0 18px 36px rgba(2, 8, 23, 0.42);
      }
      .${BUTTON_CLASS}:hover {
        background: rgba(30, 41, 59, 0.96);
      }
    }
    body.dark-theme .${BUTTON_CLASS},
    body[data-theme='dark'] .${BUTTON_CLASS} {
      border-color: rgba(226, 232, 240, 0.14);
      background: rgba(15, 23, 42, 0.94);
      color: #e5eefb;
      box-shadow: 0 18px 36px rgba(2, 8, 23, 0.42);
    }
    body.dark-theme .${BUTTON_CLASS}:hover,
    body[data-theme='dark'] .${BUTTON_CLASS}:hover {
      background: rgba(30, 41, 59, 0.96);
    }
  `;
  document.head.appendChild(style);
}

function ensureButton(): HTMLButtonElement {
  if (quoteButton) {
    return quoteButton;
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${BUTTON_CLASS} ${BUTTON_HIDDEN_CLASS}`;
  button.setAttribute('aria-label', 'Quote reply');
  button.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 7H6.75A1.75 1.75 0 0 0 5 8.75v3.5C5 13.216 5.784 14 6.75 14H8v1c0 1.104-.896 2-2 2H5v2h1c2.209 0 4-1.791 4-4v-6.25C10 7.784 10.966 7 10 7Zm8 0h-3.25A1.75 1.75 0 0 0 13 8.75v3.5c0 .966.784 1.75 1.75 1.75H16v1c0 1.104-.896 2-2 2h-1v2h1c2.209 0 4-1.791 4-4v-6.25C18 7.784 18.966 7 18 7Z" fill="currentColor"/></svg><span>Quote reply</span>';
  button.addEventListener('mousedown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    internalMouseDown = true;
    handleQuoteReply();
  });
  document.body.appendChild(button);
  quoteButton = button;
  return button;
}

function hideButton(clearSelection = false): void {
  if (quoteButton) {
    quoteButton.classList.add(BUTTON_HIDDEN_CLASS);
  }
  currentSelectionRange = null;
  if (clearSelection) {
    window.getSelection()?.removeAllRanges();
  }
}

function showButton(): void {
  const button = ensureButton();
  button.classList.remove(BUTTON_HIDDEN_CLASS);
  updateButtonPosition();
}

function scheduleSelectionUpdate(): void {
  if (selectionTimer !== null) {
    window.clearTimeout(selectionTimer);
  }
  selectionTimer = window.setTimeout(updateSelectionState, SELECTION_DEBOUNCE_MS);
}

function updateSelectionState(): void {
  selectionTimer = null;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
    hideButton();
    return;
  }

  const text = selection.toString().trim();
  if (!text) {
    hideButton();
    return;
  }

  const range = selection.getRangeAt(0);
  const boundaryElements = getSelectionBoundaryElements(selection, range);
  if (!boundaryElements.length || isInsideComposer(boundaryElements) || !isInsideConversation(boundaryElements)) {
    hideButton();
    return;
  }

  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    hideButton();
    return;
  }

  currentSelectionRange = range.cloneRange();
  showButton();
}

function getSelectionBoundaryElements(selection: Selection, range: Range): Element[] {
  const elements = [
    elementFromNode(selection.anchorNode),
    elementFromNode(selection.focusNode),
    elementFromNode(range.commonAncestorContainer)
  ].filter((value): value is Element => Boolean(value));

  return Array.from(new Set(elements));
}

function elementFromNode(node: Node | null): Element | null {
  if (!node) {
    return null;
  }
  if (node.nodeType === Node.ELEMENT_NODE) {
    return node as Element;
  }
  return node.parentElement;
}

function isInsideComposer(elements: readonly Element[]): boolean {
  return elements.some((element) => Boolean(element.closest(COMPOSER_SELECTOR)));
}

function isInsideConversation(elements: readonly Element[]): boolean {
  return elements.some((element) => Boolean(element.closest(MESSAGE_SELECTOR)));
}

function updateButtonPosition(): void {
  if (!quoteButton || !currentSelectionRange) {
    return;
  }

  const rangeRect = currentSelectionRange.getBoundingClientRect();
  if (rangeRect.bottom < 0 || rangeRect.top > window.innerHeight) {
    quoteButton.classList.add(BUTTON_HIDDEN_CLASS);
    return;
  }

  const firstLineRect =
    typeof currentSelectionRange.getClientRects === 'function'
      ? currentSelectionRange.getClientRects()[0] || rangeRect
      : rangeRect;
  const buttonRect = quoteButton.getBoundingClientRect();
  const top = Math.max(
    VIEWPORT_PADDING_PX,
    firstLineRect.top - buttonRect.height - BUTTON_GAP_PX
  );
  const maxLeft = window.innerWidth - buttonRect.width - VIEWPORT_PADDING_PX;
  const centerLeft = rangeRect.left + rangeRect.width / 2 - buttonRect.width / 2;
  const left = Math.min(maxLeft, Math.max(VIEWPORT_PADDING_PX, centerLeft));

  quoteButton.style.top = `${top}px`;
  quoteButton.style.left = `${left}px`;
}

function schedulePositionUpdate(): void {
  if (positionRaf !== null) {
    return;
  }
  positionRaf = window.requestAnimationFrame(() => {
    positionRaf = null;
    updateButtonPosition();
  });
}

function handleMouseUp(): void {
  if (internalMouseDown) {
    internalMouseDown = false;
    return;
  }
  scheduleSelectionUpdate();
}

function handleKeyUp(event: KeyboardEvent): void {
  if (event.key === 'Shift' || event.key.startsWith('Arrow')) {
    scheduleSelectionUpdate();
    return;
  }

  if (event.key === 'Escape') {
    hideButton();
  }
}

function handleQuoteReply(): void {
  if (!currentSelectionRange) {
    hideButton();
    return;
  }

  const selectedText = currentSelectionRange.toString();
  const quoteBlock = buildQuoteBlock(selectedText);
  if (!quoteBlock) {
    hideButton(true);
    return;
  }

  const editor = findEditor();
  if (!editor) {
    hideButton();
    return;
  }

  const existingText = getEditorText(editor);
  const content = `${buildInsertionPrefix(existingText)}${quoteBlock}`;
  const inserted = isTextControl(editor)
    ? appendTextToInput(editor, content)
    : appendTextToContentEditable(editor, content);

  if (inserted) {
    hideButton(true);
  }
}

function buildQuoteBlock(raw: string): string {
  if (typeof raw !== 'string') {
    return '';
  }
  const normalized = raw.replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return '';
  }
  return `${normalized.split('\n').map((line) => `> ${line}`).join('\n')}\n`;
}

function buildInsertionPrefix(existingText: string): string {
  if (!existingText.trim()) {
    return '';
  }
  if (/\n\s*\n\s*$/.test(existingText)) {
    return '';
  }
  if (/\n\s*$/.test(existingText)) {
    return '\n';
  }
  return '\n\n';
}

function findEditor(): HTMLElement | HTMLTextAreaElement | HTMLInputElement | null {
  for (const selector of EDITOR_SELECTORS) {
    const candidates = document.querySelectorAll<HTMLElement>(selector);
    for (const candidate of Array.from(candidates)) {
      if (!candidate.isConnected) {
        continue;
      }
      const rect = candidate.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        continue;
      }
      if (isTextControl(candidate) || isContentEditableElement(candidate)) {
        return candidate as HTMLElement | HTMLTextAreaElement | HTMLInputElement;
      }
    }
  }
  return null;
}

function isTextControl(element: Element): element is HTMLTextAreaElement | HTMLInputElement {
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'textarea') {
    return true;
  }
  return tagName === 'input';
}

function isContentEditableElement(element: Element): element is HTMLElement {
  if (!(element instanceof HTMLElement)) {
    return false;
  }
  return element.isContentEditable || element.getAttribute('contenteditable') === 'true';
}

function getEditorText(element: HTMLElement | HTMLTextAreaElement | HTMLInputElement): string {
  if (isTextControl(element)) {
    return typeof element.value === 'string' ? element.value : '';
  }
  if (typeof element.innerText === 'string') {
    return element.innerText;
  }
  return element.textContent || '';
}

function appendTextToInput(element: HTMLTextAreaElement | HTMLInputElement, content: string): boolean {
  try {
    focusElement(element);
    const currentValue = typeof element.value === 'string' ? element.value : '';
    const nextValue = `${currentValue}${content}`;
    const prototype = Object.getPrototypeOf(element) as { value?: PropertyDescriptor } | null;
    const descriptor = prototype ? Object.getOwnPropertyDescriptor(prototype, 'value') : null;
    if (descriptor && typeof descriptor.set === 'function') {
      descriptor.set.call(element, nextValue);
    } else {
      element.value = nextValue;
    }
    if (typeof element.setSelectionRange === 'function') {
      element.setSelectionRange(nextValue.length, nextValue.length);
    }
    dispatchInputEvent(element, content);
    return true;
  } catch {
    return false;
  }
}

function appendTextToContentEditable(element: HTMLElement, content: string): boolean {
  try {
    focusElement(element);
    placeCaretAtEnd(element);

    let inserted = false;
    if (typeof document.execCommand === 'function') {
      try {
        inserted = Boolean(document.execCommand('insertText', false, content));
      } catch {
        inserted = false;
      }
    }

    if (!inserted) {
      insertTextWithRange(element, content);
    }

    placeCaretAtEnd(element);
    dispatchInputEvent(element, content);
    return true;
  } catch {
    return false;
  }
}

function focusElement(element: HTMLElement | HTMLTextAreaElement | HTMLInputElement): void {
  if (typeof element.focus !== 'function') {
    return;
  }
  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
}

function placeCaretAtEnd(element: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

function insertTextWithRange(element: HTMLElement, content: string): void {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);

  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (index > 0) {
      const breakNode = document.createElement('br');
      range.insertNode(breakNode);
      range.setStartAfter(breakNode);
      range.collapse(true);
    }

    if (!line) {
      return;
    }

    const textNode = document.createTextNode(line);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
  });

  selection.removeAllRanges();
  selection.addRange(range);
}

function dispatchInputEvent(
  element: HTMLElement | HTMLTextAreaElement | HTMLInputElement,
  data: string
): void {
  try {
    element.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        cancelable: false,
        inputType: 'insertText',
        data
      })
    );
  } catch {
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function start(): void {
  if (started || getCurrentSiteId() !== 'gemini') {
    return;
  }

  started = true;
  ensureStyle();
  ensureButton();
  hideButton();

  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('keyup', handleKeyUp);
  document.addEventListener('selectionchange', scheduleSelectionUpdate);
  window.addEventListener('scroll', schedulePositionUpdate, { capture: true, passive: true });
  window.addEventListener('resize', schedulePositionUpdate, { passive: true });
}

ns.geminiQuoteReply = {
  start
};

window.ChatGptNav = ns;
