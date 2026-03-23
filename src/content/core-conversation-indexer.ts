import { ns } from './namespace';
import type {
  Adapter,
  ConversationEntry,
  ConversationIndexerApi,
  ConversationMessage,
  UtilsApi
} from './types';

interface ConversationIndexerOverrides {
  utils?: Partial<UtilsApi>;
  previewMax?: number;
}

function createConversationIndexer(
  overrides: ConversationIndexerOverrides = {}
): ConversationIndexerApi {
  const utils = overrides.utils || ns.utils || {};
  const normalizeText: UtilsApi['normalizeText'] =
    typeof utils.normalizeText === 'function'
      ? utils.normalizeText
      : (value: string) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '');
  const truncate: UtilsApi['truncate'] =
    typeof utils.truncate === 'function'
      ? utils.truncate
      : (value: string, maxLen: number) => {
          if (typeof value !== 'string') {
            return '';
          }
          if (value.length <= maxLen) {
            return value;
          }
          return `${value.slice(0, maxLen - 3)}...`;
        };
  const getTextWithoutHidden =
    typeof utils.getTextWithoutHidden === 'function' ? utils.getTextWithoutHidden : null;
  const previewMax =
    typeof overrides.previewMax === 'number' && Number.isFinite(overrides.previewMax)
      ? overrides.previewMax
      : 96;

  function getConversationSequence(
    adapter: Adapter | null,
    root: ParentNode | null
  ): ConversationEntry[] {
    if (!adapter || typeof adapter.getConversationMessages !== 'function') {
      return [];
    }
    return adapter.getConversationMessages(root);
  }

  function buildUserMessages(
    sequence: ConversationEntry[],
    adapter: Adapter | null
  ): ConversationMessage[] {
    const messages: ConversationMessage[] = [];
    sequence.forEach((entry, index) => {
      if (entry.role !== 'user') {
        return;
      }
      messages.push(buildUserMessage(sequence, entry, index, messages.length, adapter));
    });
    return messages;
  }

  function buildUserMessage(
    sequence: ConversationEntry[],
    entry: ConversationEntry,
    index: number,
    promptIndex: number,
    adapter: Adapter | null
  ): ConversationMessage {
    const text = getUserMessageText(entry.node, adapter);
    const title = text || `Prompt ${promptIndex + 1}`;
    const assistantSummary = getAssistantSummary(sequence, index + 1);
    const preview = assistantSummary.text ? truncate(assistantSummary.text, previewMax) : '';
    return {
      node: entry.node,
      title,
      preview,
      text,
      endNode: assistantSummary.lastAssistantNode
    };
  }

  function getAssistantSummary(
    sequence: ConversationEntry[],
    startIndex: number
  ): { text: string; lastAssistantNode: Element | null } {
    let assistantText = '';
    let lastAssistantNode: Element | null = null;
    for (let i = startIndex; i < sequence.length; i += 1) {
      const item = sequence[i];
      if (item.role === 'assistant') {
        if (!assistantText) {
          assistantText = normalizeText(item.node.textContent || '');
        }
        lastAssistantNode = item.node;
        continue;
      }
      if (item.role === 'user') {
        break;
      }
    }
    return { text: assistantText, lastAssistantNode };
  }

  function getUserMessageText(node: Element | null, adapter: Adapter | null): string {
    if (!node) {
      return '';
    }
    const adapterId = adapter && adapter.id ? adapter.id : '';
    if (adapterId === 'gemini' && getTextWithoutHidden) {
      const visibleText = getTextWithoutHidden(node);
      if (visibleText) {
        return visibleText;
      }
    }
    return normalizeText(node.textContent || '');
  }

  function buildMessagesSignature(messages: ConversationMessage[]): string {
    const lastMessage = messages[messages.length - 1];
    const lastText = lastMessage ? lastMessage.text : '';
    const lastPreview = lastMessage ? lastMessage.preview : '';
    return `${messages.length}:${lastText}:${lastPreview}`;
  }

  return {
    getConversationSequence,
    buildUserMessages,
    buildMessagesSignature
  };
}

ns.coreConversationIndexer = Object.assign({}, ns.coreConversationIndexer, {
  createConversationIndexer
});
