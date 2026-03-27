import { ns } from './namespace';
import { t } from '../shared/i18n';

const STYLE_ID = 'chatgpt-nav-gemini-quote-reply-style';
const BUTTON_CLASS = 'chatgpt-nav-gemini-quote-reply-button';
const BUTTON_HIDDEN_CLASS = 'is-hidden';
const CARD_HOST_CLASS = 'chatgpt-nav-gemini-quote-card-host';
const CARD_CLASS = 'chatgpt-nav-gemini-quote-card';
const CARD_PENDING_CLASS = 'is-pending';
const CARD_SINGLE_LINE_CLASS = 'is-single-line';
const CARD_ICON_CLASS = 'chatgpt-nav-gemini-quote-card-icon';
const CARD_TEXT_STACK_CLASS = 'chatgpt-nav-gemini-quote-card-text-stack';
const CARD_PREVIEW_CLASS = 'chatgpt-nav-gemini-quote-card-preview';
const CARD_REMOVE_CLASS = 'chatgpt-nav-gemini-quote-card-remove';
const MESSAGE_SELECTOR = 'user-query, model-response, .conversation-container';
const COMPOSER_ROOT_SELECTOR = '.text-input-field';
const COMPOSER_SELECTOR = 'rich-textarea, .text-input-field';
const COMPOSER_SINGLE_LINE_SELECTOR = '.single-line-format';
const COMPOSER_LEADING_ACTIONS_SELECTOR = '.leading-actions-wrapper';
const COMPOSER_TRAILING_ACTIONS_SELECTOR = '.trailing-actions-wrapper';
const SEND_BUTTON_SELECTORS = [
  'button.send-button.submit',
  '.send-button-container button.submit',
  'button[aria-label="发送"]',
  'button[aria-label="Send"]'
] as const;
const EDITOR_SELECTORS = [
  'rich-textarea [contenteditable="true"]',
  'rich-textarea textarea',
  '.text-input-field [contenteditable="true"]',
  '.text-input-field textarea'
] as const;
const SELECTION_DEBOUNCE_MS = 180;
const BUTTON_GAP_PX = 14;
const VIEWPORT_PADDING_PX = 10;
const COMPOSER_SYNC_DEBOUNCE_MS = 0;
const SEND_RESULT_POLL_MS = 120;
const SEND_RESULT_POLL_LIMIT = 18;
const REPLAY_SEND_INITIAL_DELAY_MS = 24;
const REPLAY_SEND_RETRY_MS = 40;
const REPLAY_SEND_RETRY_LIMIT = 20;

type EditableElement = HTMLElement | HTMLTextAreaElement | HTMLInputElement;

interface ActiveQuote {
  rawText: string;
  previewText: string;
  quoteBlock: string;
}

interface ComposerQuoteUi {
  host: HTMLDivElement;
  card: HTMLDivElement;
  preview: HTMLDivElement;
  removeButton: HTMLButtonElement;
}

interface PendingSubmit {
  editor: EditableElement;
  originalText: string;
  materializedText: string;
  pollsRemaining: number;
  timer: number | null;
}

interface ComposerMountTarget {
  container: HTMLElement;
  referenceNode: ChildNode | null;
}

let started = false;
let quoteButton: HTMLButtonElement | null = null;
let composerUi: ComposerQuoteUi | null = null;
let currentSelectionRange: Range | null = null;
let activeQuote: ActiveQuote | null = null;
let pendingSubmit: PendingSubmit | null = null;
let selectionTimer: number | null = null;
let positionRaf: number | null = null;
let composerSyncTimer: number | null = null;
let replaySendTimer: number | null = null;
let composerObserver: MutationObserver | null = null;
let internalMouseDown = false;
let replayingSendClick = false;

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
    .${CARD_HOST_CLASS} {
      display: block;
      width: 100%;
      max-width: 100%;
      min-width: 0;
      margin: 8px 0 6px;
      padding: 0 2px;
      box-sizing: border-box;
      pointer-events: auto;
    }
    ${COMPOSER_ROOT_SELECTOR} > .${CARD_HOST_CLASS} {
      grid-column: 1 / -1;
      justify-self: stretch;
      align-self: stretch;
      flex: 0 0 100%;
    }
    .${CARD_CLASS} {
      width: 100%;
      max-width: 100%;
      min-width: 0;
      box-sizing: border-box;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: start;
      gap: 6px;
      padding: 6px 8px 6px 6px;
      border: 1px solid #d7e2f3;
      border-radius: 16px;
      background: #eef4fb;
      color: #1f2a3d;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
      transition: opacity 140ms ease, transform 160ms ease, box-shadow 180ms ease;
      overflow: hidden;
    }
    .${CARD_CLASS}.${CARD_PENDING_CLASS} {
      opacity: 0.78;
    }
    .${CARD_CLASS}.${CARD_SINGLE_LINE_CLASS} {
      align-items: center;
    }
    .${CARD_ICON_CLASS} {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      color: #0842a0;
      background: rgba(8, 66, 160, 0.1);
      align-self: start;
      margin-top: 1px;
    }
    .${CARD_CLASS}.${CARD_SINGLE_LINE_CLASS} .${CARD_ICON_CLASS} {
      align-self: center;
      margin-top: 0;
    }
    .${CARD_ICON_CLASS} svg,
    .${CARD_REMOVE_CLASS} svg {
      width: 16px;
      height: 16px;
      display: block;
    }
    .${CARD_TEXT_STACK_CLASS} {
      min-width: 0;
      display: grid;
      padding-block: 2px;
      justify-self: stretch;
      text-align: left;
    }
    .${CARD_CLASS}.${CARD_SINGLE_LINE_CLASS} .${CARD_TEXT_STACK_CLASS} {
      align-self: center;
      padding-block: 0;
    }
    .${CARD_PREVIEW_CLASS} {
      min-width: 0;
      color: inherit;
      font-family: "Google Sans Text", "Google Sans", Roboto, Arial, sans-serif;
      font-size: 0.875rem;
      font-weight: 400;
      line-height: 1.5;
      letter-spacing: 0;
      font-kerning: normal;
      white-space: pre-wrap;
      text-wrap: pretty;
      overflow-wrap: anywhere;
      text-align: left;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      user-select: text;
    }
    .${CARD_REMOVE_CLASS} {
      appearance: none;
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      background: transparent;
      color: inherit;
      opacity: 0.72;
      cursor: pointer;
      align-self: start;
      transition: background-color 140ms ease, opacity 140ms ease, transform 140ms ease;
    }
    .${CARD_CLASS}.${CARD_SINGLE_LINE_CLASS} .${CARD_REMOVE_CLASS} {
      align-self: center;
    }
    .${CARD_REMOVE_CLASS}:hover {
      background: rgba(8, 66, 160, 0.08);
      opacity: 1;
      transform: translateY(-1px);
    }
    .${CARD_REMOVE_CLASS}:active {
      transform: translateY(0);
    }
    .${CARD_REMOVE_CLASS}:focus-visible {
      outline: 2px solid rgba(8, 66, 160, 0.52);
      outline-offset: 2px;
    }
    .${CARD_REMOVE_CLASS}[disabled] {
      opacity: 0.4;
      cursor: default;
      pointer-events: none;
      transform: none;
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
      .${CARD_CLASS} {
        border-color: rgba(138, 180, 248, 0.26);
        background: rgba(32, 43, 63, 0.92);
        color: #e8f0fe;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
      }
      .${CARD_ICON_CLASS} {
        color: #8ab4f8;
        background: rgba(138, 180, 248, 0.14);
      }
      .${CARD_REMOVE_CLASS}:hover {
        background: rgba(138, 180, 248, 0.14);
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
    body.dark-theme .${CARD_CLASS},
    body[data-theme='dark'] .${CARD_CLASS} {
      border-color: rgba(138, 180, 248, 0.26);
      background: rgba(32, 43, 63, 0.92);
      color: #e8f0fe;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
    }
    body.dark-theme .${CARD_ICON_CLASS},
    body[data-theme='dark'] .${CARD_ICON_CLASS} {
      color: #8ab4f8;
      background: rgba(138, 180, 248, 0.14);
    }
    body.dark-theme .${CARD_REMOVE_CLASS}:hover,
    body[data-theme='dark'] .${CARD_REMOVE_CLASS}:hover {
      background: rgba(138, 180, 248, 0.14);
    }
  `;
  document.head.appendChild(style);
}

function ensureButton(): HTMLButtonElement {
  if (quoteButton) {
    return quoteButton;
  }

  const label = t('gemini_quote_reply_button');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${BUTTON_CLASS} ${BUTTON_HIDDEN_CLASS}`;
  button.setAttribute('aria-label', label);

  const icon = document.createElement('span');
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = getQuoteIconSvg();

  const text = document.createElement('span');
  text.textContent = label;

  button.appendChild(icon);
  button.appendChild(text);
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

function ensureComposerUi(): ComposerQuoteUi {
  if (composerUi) {
    return composerUi;
  }

  const host = document.createElement('div');
  host.className = CARD_HOST_CLASS;

  const card = document.createElement('div');
  card.className = CARD_CLASS;
  card.setAttribute('role', 'note');
  card.setAttribute('aria-label', t('gemini_quote_reply_card_aria'));

  const icon = document.createElement('span');
  icon.className = CARD_ICON_CLASS;
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = getQuoteIconSvg();

  const textStack = document.createElement('div');
  textStack.className = CARD_TEXT_STACK_CLASS;

  const preview = document.createElement('div');
  preview.className = CARD_PREVIEW_CLASS;

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = CARD_REMOVE_CLASS;
  removeButton.setAttribute('aria-label', t('gemini_quote_reply_remove'));
  removeButton.innerHTML = getCloseIconSvg();
  removeButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (pendingSubmit) {
      return;
    }
    clearActiveQuote({ focusEditor: true });
  });

  textStack.appendChild(preview);
  card.appendChild(icon);
  card.appendChild(textStack);
  card.appendChild(removeButton);
  host.appendChild(card);

  composerUi = {
    host,
    card,
    preview,
    removeButton
  };
  return composerUi;
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
  if (pendingSubmit) {
    hideButton();
    return;
  }
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
  if (pendingSubmit) {
    hideButton();
    return;
  }

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
  const top = Math.max(VIEWPORT_PADDING_PX, firstLineRect.top - buttonRect.height - BUTTON_GAP_PX);
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

function handleDocumentClick(event: MouseEvent): void {
  if (replayingSendClick) {
    replayingSendClick = false;
    return;
  }

  if (!activeQuote) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const sendButton = getClosestSendButton(target);
  if (!sendButton) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  if (pendingSubmit) {
    return;
  }

  if (queueSendWithActiveQuote()) {
    scheduleReplaySendClick();
  }
}

function handleDocumentKeyDown(event: KeyboardEvent): void {
  if (!activeQuote) {
    return;
  }

  if (
    event.key !== 'Enter' ||
    event.shiftKey ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.isComposing
  ) {
    return;
  }

  const editor = findEditor();
  if (!editor) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Node) || !isNodeInsideEditor(editor, target)) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  if (pendingSubmit) {
    return;
  }

  if (queueSendWithActiveQuote(editor)) {
    scheduleReplaySendClick();
  }
}

function handleQuoteReply(): void {
  if (pendingSubmit) {
    hideButton();
    return;
  }

  if (!currentSelectionRange) {
    hideButton();
    return;
  }

  const quote = createActiveQuote(currentSelectionRange.toString());
  if (!quote) {
    hideButton(true);
    return;
  }

  activeQuote = quote;
  hideButton(true);
  syncComposerUi();
  focusEditorForDraft();
}

function createActiveQuote(raw: string): ActiveQuote | null {
  const normalized = normalizeQuotedText(raw);
  if (!normalized) {
    return null;
  }

  return {
    rawText: normalized,
    previewText: normalized,
    quoteBlock: buildQuoteBlock(normalized)
  };
}

function clearActiveQuote(options: { focusEditor?: boolean } = {}): void {
  activeQuote = null;
  clearReplaySendTimer();
  clearPendingSubmitTimer();
  pendingSubmit = null;
  syncComposerUi();

  if (options.focusEditor) {
    focusEditorForDraft();
  }
}

function queueSendWithActiveQuote(editorOverride?: EditableElement | null): boolean {
  if (!activeQuote || pendingSubmit) {
    return false;
  }

  const editor = editorOverride || findEditor();
  if (!editor) {
    return false;
  }

  const originalText = getEditorText(editor);
  const materializedText = buildMaterializedMessage(activeQuote.quoteBlock, originalText);
  if (!materializedText) {
    return false;
  }

  if (!replaceEditorText(editor, materializedText)) {
    return false;
  }

  pendingSubmit = {
    editor,
    originalText,
    materializedText,
    pollsRemaining: SEND_RESULT_POLL_LIMIT,
    timer: null
  };
  syncComposerUi();
  schedulePendingSubmitCheck();
  return true;
}

function scheduleReplaySendClick(attempt = 0): void {
  clearReplaySendTimer();
  replaySendTimer = window.setTimeout(() => {
    replaySendTimer = null;
    if (!pendingSubmit) {
      return;
    }

    const sendButton = findSendButton();
    if (sendButton && !isSendButtonBlocked(sendButton)) {
      replayingSendClick = true;
      sendButton.click();
      return;
    }

    if (attempt + 1 < REPLAY_SEND_RETRY_LIMIT) {
      scheduleReplaySendClick(attempt + 1);
    }
  }, attempt === 0 ? REPLAY_SEND_INITIAL_DELAY_MS : REPLAY_SEND_RETRY_MS);
}

function clearReplaySendTimer(): void {
  if (replaySendTimer !== null) {
    window.clearTimeout(replaySendTimer);
    replaySendTimer = null;
  }
}

function schedulePendingSubmitCheck(): void {
  if (!pendingSubmit) {
    return;
  }

  clearPendingSubmitTimer();
  pendingSubmit.timer = window.setTimeout(checkPendingSubmitState, SEND_RESULT_POLL_MS);
}

function clearPendingSubmitTimer(): void {
  if (pendingSubmit && pendingSubmit.timer !== null) {
    window.clearTimeout(pendingSubmit.timer);
    pendingSubmit.timer = null;
  }
}

function checkPendingSubmitState(): void {
  if (!pendingSubmit) {
    return;
  }

  pendingSubmit.timer = null;

  const editor = findEditor();
  if (!editor) {
    if (pendingSubmit.pollsRemaining > 0) {
      pendingSubmit.pollsRemaining -= 1;
      schedulePendingSubmitCheck();
      return;
    }
    finalizePendingSubmit(true);
    return;
  }

  pendingSubmit.editor = editor;
  const currentText = getEditorText(editor);
  if (textsEquivalent(currentText, pendingSubmit.materializedText)) {
    if (pendingSubmit.pollsRemaining > 0) {
      pendingSubmit.pollsRemaining -= 1;
      schedulePendingSubmitCheck();
      return;
    }
    restorePendingSubmit();
    return;
  }

  finalizePendingSubmit(true);
}

function restorePendingSubmit(): void {
  if (!pendingSubmit) {
    return;
  }

  const nextEditor = findEditor() || pendingSubmit.editor;
  const originalText = pendingSubmit.originalText;
  clearReplaySendTimer();
  clearPendingSubmitTimer();
  pendingSubmit = null;

  if (nextEditor) {
    replaceEditorText(nextEditor, originalText);
    focusEditor(nextEditor);
  }

  syncComposerUi();
}

function finalizePendingSubmit(sent: boolean): void {
  clearReplaySendTimer();
  clearPendingSubmitTimer();
  pendingSubmit = null;

  if (sent) {
    activeQuote = null;
  }

  syncComposerUi();
}

function syncComposerUi(): void {
  if (!composerUi && !activeQuote) {
    return;
  }

  const ui = composerUi || ensureComposerUi();
  if (!activeQuote) {
    ui.host.remove();
    return;
  }

  const target = findComposerMountTarget();
  if (!target) {
    ui.host.remove();
    return;
  }

  ui.preview.textContent = activeQuote.previewText;
  ui.card.classList.toggle(CARD_PENDING_CLASS, Boolean(pendingSubmit));
  ui.removeButton.disabled = Boolean(pendingSubmit);

  if (ui.host.parentElement !== target.container || ui.host.nextSibling !== target.referenceNode) {
    ui.host.remove();
    target.container.insertBefore(ui.host, target.referenceNode);
  }

  syncComposerCardAlignment(ui);
}

function scheduleComposerSync(): void {
  if (composerSyncTimer !== null) {
    return;
  }
  composerSyncTimer = window.setTimeout(() => {
    composerSyncTimer = null;
    syncComposerUi();
  }, COMPOSER_SYNC_DEBOUNCE_MS);
}

function findComposerMountTarget(): ComposerMountTarget | null {
  const composerRoot = findComposerRoot();
  if (!composerRoot) {
    return null;
  }

  const actionAnchor =
    queryVisibleElement<HTMLElement>(composerRoot, [COMPOSER_LEADING_ACTIONS_SELECTOR]) ||
    queryVisibleElement<HTMLElement>(composerRoot, [COMPOSER_TRAILING_ACTIONS_SELECTOR]);
  if (actionAnchor) {
    return {
      container: composerRoot,
      referenceNode: actionAnchor
    };
  }

  const singleLine = queryVisibleElement<HTMLElement>(composerRoot, [COMPOSER_SINGLE_LINE_SELECTOR]);
  if (singleLine) {
    return {
      container: composerRoot,
      referenceNode: singleLine.nextSibling
    };
  }

  return {
    container: composerRoot,
    referenceNode: null
  };
}

function findComposerRoot(): HTMLElement | null {
  const editor = findEditor();
  if (editor) {
    const root = editor.closest(COMPOSER_ROOT_SELECTOR);
    if (root instanceof HTMLElement) {
      return root;
    }
  }

  return queryVisibleElement<HTMLElement>(document, [COMPOSER_ROOT_SELECTOR]);
}

function findSendButton(): HTMLButtonElement | null {
  const composerRoot = findComposerRoot();
  if (!composerRoot) {
    return null;
  }

  return queryVisibleElement<HTMLButtonElement>(composerRoot, SEND_BUTTON_SELECTORS);
}

function getClosestSendButton(element: Element): HTMLButtonElement | null {
  const selector = SEND_BUTTON_SELECTORS.join(',');
  const button = element.closest(selector);
  if (!(button instanceof HTMLButtonElement)) {
    return null;
  }

  const composerRoot = findComposerRoot();
  if (!composerRoot || !composerRoot.contains(button)) {
    return null;
  }

  return button;
}

function isSendButtonBlocked(button: HTMLButtonElement): boolean {
  if (button.disabled) {
    return true;
  }
  if (button.getAttribute('aria-disabled') === 'true') {
    return true;
  }
  if (button.closest('.disabled')) {
    return true;
  }
  return false;
}

function findEditor(): EditableElement | null {
  return queryVisibleElement<EditableElement>(document, EDITOR_SELECTORS);
}

function queryVisibleElement<T extends Element>(root: ParentNode, selectors: readonly string[]): T | null {
  let fallback: T | null = null;

  for (const selector of selectors) {
    const candidates = root.querySelectorAll<T>(selector);
    for (const candidate of Array.from(candidates)) {
      if (!candidate.isConnected) {
        continue;
      }

      if (!fallback) {
        fallback = candidate;
      }

      if (isElementVisible(candidate)) {
        return candidate;
      }
    }
  }

  return fallback;
}

function isElementVisible(element: Element): boolean {
  if (!(element instanceof HTMLElement)) {
    return true;
  }
  const rect = element.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0;
}

function syncComposerCardAlignment(ui: ComposerQuoteUi): void {
  ui.card.classList.toggle(CARD_SINGLE_LINE_CLASS, isSingleLinePreview(ui.preview));
}

function isSingleLinePreview(preview: HTMLElement): boolean {
  const text = preview.textContent?.trim() || '';
  if (!text) {
    return false;
  }

  if (!preview.isConnected || preview.getClientRects().length === 0) {
    return !text.includes('\n');
  }

  const computedStyle = window.getComputedStyle(preview);
  const lineHeight = getElementLineHeight(preview, computedStyle);
  if (lineHeight <= 0) {
    return !text.includes('\n');
  }

  return preview.scrollHeight <= Math.ceil(lineHeight) + 2;
}

function getElementLineHeight(element: HTMLElement, computedStyle: CSSStyleDeclaration): number {
  const computedLineHeight = Number.parseFloat(computedStyle.lineHeight);
  if (Number.isFinite(computedLineHeight) && computedLineHeight > 0) {
    return computedLineHeight;
  }

  const computedFontSize = Number.parseFloat(computedStyle.fontSize);
  if (Number.isFinite(computedFontSize) && computedFontSize > 0) {
    return computedFontSize * 1.5;
  }

  return element.getBoundingClientRect().height;
}

function isNodeInsideEditor(editor: EditableElement, node: Node): boolean {
  return editor === node || editor.contains(node);
}

function normalizeQuotedText(raw: string): string {
  if (typeof raw !== 'string') {
    return '';
  }
  return normalizeLineEndings(raw).trim();
}

function buildQuoteBlock(raw: string): string {
  const normalized = normalizeQuotedText(raw);
  if (!normalized) {
    return '';
  }
  return normalized
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n');
}

function buildMaterializedMessage(quoteBlock: string, bodyText: string): string {
  const normalizedQuote = normalizeLineEndings(quoteBlock).trim();
  if (!normalizedQuote) {
    return '';
  }

  const normalizedBody = normalizeLineEndings(bodyText).trimEnd();
  if (!normalizedBody.trim()) {
    return normalizedQuote;
  }

  return `${normalizedQuote}\n\n${normalizedBody.replace(/^\n+/, '')}`;
}

function textsEquivalent(left: string, right: string): boolean {
  return normalizeComparableText(left) === normalizeComparableText(right);
}

function normalizeComparableText(value: string): string {
  return normalizeLineEndings(value || '')
    .replace(/\u00a0/g, ' ')
    .trimEnd();
}

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function getEditorText(element: EditableElement): string {
  if (isTextControl(element)) {
    return typeof element.value === 'string' ? element.value : '';
  }
  if (typeof element.innerText === 'string') {
    return element.innerText;
  }
  return element.textContent || '';
}

function replaceEditorText(element: EditableElement, nextValue: string): boolean {
  return isTextControl(element)
    ? replaceTextInInput(element, nextValue)
    : replaceTextInContentEditable(element, nextValue);
}

function replaceTextInInput(element: HTMLTextAreaElement | HTMLInputElement, nextValue: string): boolean {
  try {
    focusEditor(element);
    setInputValue(element, nextValue);
    if (typeof element.setSelectionRange === 'function') {
      element.setSelectionRange(nextValue.length, nextValue.length);
    }
    dispatchInputEvent(element, nextValue);
    return true;
  } catch {
    return false;
  }
}

function replaceTextInContentEditable(element: HTMLElement, nextValue: string): boolean {
  try {
    focusEditor(element);

    if (!tryExecCommandReplaceText(element, nextValue)) {
      element.replaceChildren(buildContentEditableFragment(nextValue));
    }

    placeCaretAtEnd(element);
    dispatchInputEvent(element, nextValue);
    return true;
  } catch {
    return false;
  }
}

function tryExecCommandReplaceText(element: HTMLElement, nextValue: string): boolean {
  const selection = window.getSelection();
  if (!selection || typeof document.execCommand !== 'function') {
    return false;
  }

  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);

  try {
    return Boolean(document.execCommand('insertText', false, nextValue));
  } catch {
    return false;
  }
}

function buildContentEditableFragment(value: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const normalized = normalizeLineEndings(value);
  const lines = normalized ? normalized.split('\n') : [''];

  lines.forEach((line) => {
    const paragraph = document.createElement('p');
    if (line) {
      paragraph.textContent = line;
    } else {
      paragraph.appendChild(document.createElement('br'));
    }
    fragment.appendChild(paragraph);
  });

  return fragment;
}

function setInputValue(element: HTMLTextAreaElement | HTMLInputElement, nextValue: string): void {
  const prototype = Object.getPrototypeOf(element) as { value?: PropertyDescriptor } | null;
  const descriptor = prototype ? Object.getOwnPropertyDescriptor(prototype, 'value') : null;
  if (descriptor && typeof descriptor.set === 'function') {
    descriptor.set.call(element, nextValue);
    return;
  }
  element.value = nextValue;
}

function dispatchInputEvent(element: EditableElement, data: string): void {
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

function focusEditor(element: EditableElement): void {
  if (typeof element.focus !== 'function') {
    return;
  }
  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
}

function focusEditorForDraft(): void {
  const editor = findEditor();
  if (!editor) {
    return;
  }
  focusEditor(editor);
  if (!isTextControl(editor)) {
    placeCaretAtEnd(editor);
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

function isTextControl(element: Element): element is HTMLTextAreaElement | HTMLInputElement {
  const tagName = element.tagName.toLowerCase();
  return tagName === 'textarea' || tagName === 'input';
}

function startObservers(): void {
  if (composerObserver || !document.body) {
    return;
  }

  composerObserver = new MutationObserver(() => {
    scheduleComposerSync();
  });
  composerObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function getQuoteIconSvg(): string {
  return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M10 7H6.75A1.75 1.75 0 0 0 5 8.75v3.5C5 13.216 5.784 14 6.75 14H8v1c0 1.104-.896 2-2 2H5v2h1c2.209 0 4-1.791 4-4v-6.25C10 7.784 10.966 7 10 7Zm8 0h-3.25A1.75 1.75 0 0 0 13 8.75v3.5c0 .966.784 1.75 1.75 1.75H16v1c0 1.104-.896 2-2 2h-1v2h1c2.209 0 4-1.791 4-4v-6.25C18 7.784 18.966 7 18 7Z" fill="currentColor"/></svg>';
}

function getCloseIconSvg(): string {
  return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.757 7.757 12 12m0 0 4.243 4.243M12 12l4.243-4.243M12 12 7.757 16.243" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
}

function start(): void {
  if (started || getCurrentSiteId() !== 'gemini') {
    return;
  }

  started = true;
  ensureStyle();
  ensureButton();
  hideButton();
  startObservers();

  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('keyup', handleKeyUp);
  document.addEventListener('keydown', handleDocumentKeyDown, true);
  document.addEventListener('click', handleDocumentClick, true);
  document.addEventListener('selectionchange', scheduleSelectionUpdate);
  window.addEventListener('scroll', schedulePositionUpdate, { capture: true, passive: true });
  window.addEventListener('resize', schedulePositionUpdate, { passive: true });
  window.addEventListener('resize', scheduleComposerSync, { passive: true });
  scheduleComposerSync();
}

ns.geminiQuoteReply = {
  start
};

window.ChatGptNav = ns;
