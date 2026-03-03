(() => {
  'use strict';

  const ns = window.ChatGptNav;

  function createConversationIndexer(overrides = {}) {
    const utils = overrides.utils || ns.utils || {};
    const normalizeText =
      typeof utils.normalizeText === 'function'
        ? utils.normalizeText
        : (value) => (typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '');
    const truncate =
      typeof utils.truncate === 'function'
        ? utils.truncate
        : (value, maxLen) => {
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
    const previewMax = Number.isFinite(overrides.previewMax) ? overrides.previewMax : 96;

    function getConversationSequence(adapter, root) {
      if (!adapter || typeof adapter.getConversationMessages !== 'function') {
        return [];
      }
      return adapter.getConversationMessages(root);
    }

    function buildUserMessages(sequence, adapter) {
      const messages = [];
      sequence.forEach((entry, index) => {
        if (entry.role !== 'user') {
          return;
        }
        messages.push(buildUserMessage(sequence, entry, index, messages.length, adapter));
      });
      return messages;
    }

    function buildUserMessage(sequence, entry, index, promptIndex, adapter) {
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

    function getAssistantSummary(sequence, startIndex) {
      let assistantText = '';
      let lastAssistantNode = null;
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

    function getUserMessageText(node, adapter) {
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

    function buildMessagesSignature(messages) {
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
})();
