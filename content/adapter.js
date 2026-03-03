(() => {
  'use strict';

  const ns = window.ChatGptNav;

  const ROLE_ATTRIBUTES = ['data-message-author-role', 'data-author-role', 'data-role'];
  const ROLE_ALIASES = {
    user: new Set(['user', 'human', 'me']),
    assistant: new Set(['assistant', 'ai', 'bot', 'model'])
  };
  const ROLE_SELECTOR = ROLE_ATTRIBUTES.map((attributeName) => `[${attributeName}]`).join(',');

  const GEMINI_SELECTORS = {
    root: ['chat-window', 'main', 'body'],
    turn: ['.conversation-container'],
    user: ['user-query .query-text', 'user-query'],
    assistant: ['model-response message-content', 'model-response']
  };
  const CLAUDE_SELECTORS = {
    root: ['#main-content .overflow-y-scroll', '#main-content', 'main', 'body'],
    user: ["[data-testid='user-message']"],
    assistant: ['.font-claude-response']
  };

  const FALLBACK_HOST_TO_SITE = Object.freeze({
    'chatgpt.com': 'chatgpt',
    'chat.openai.com': 'chatgpt',
    'gemini.google.com': 'gemini',
    'claude.ai': 'claude'
  });

  function createEnvironment(overrides = {}) {
    return {
      documentRef: overrides.documentRef || document,
      locationRef: overrides.locationRef || location
    };
  }

  function createAdapterApi(environment = createEnvironment()) {
    return {
      getAdapter() {
        return resolveAdapterForHost(environment.locationRef.hostname, environment.documentRef);
      }
    };
  }

  function resolveAdapterForHost(hostname, documentRef) {
    const siteId = resolveSiteId(hostname);
    if (siteId === 'chatgpt') {
      return createChatLikeAdapter('chatgpt', documentRef);
    }
    if (siteId === 'gemini') {
      return createGeminiAdapter(documentRef);
    }
    if (siteId === 'claude') {
      return createClaudeAdapter(documentRef);
    }
    return null;
  }

  function resolveSiteId(hostname) {
    if (ns.site && typeof ns.site.resolveSiteId === 'function') {
      return ns.site.resolveSiteId(hostname);
    }
    if (typeof hostname !== 'string') {
      return 'generic';
    }
    const normalizedHost = hostname.trim().toLowerCase();
    return FALLBACK_HOST_TO_SITE[normalizedHost] || 'generic';
  }

  function createChatLikeAdapter(id, documentRef) {
    return {
      id,
      getConversationRoot() {
        return documentRef.querySelector('main') || documentRef.body;
      },
      getConversationMessages(root) {
        return collectMessagesByRoleAttributes(root, ROLE_SELECTOR);
      }
    };
  }

  function createGeminiAdapter(documentRef) {
    return {
      id: 'gemini',
      getConversationRoot() {
        return findFirstMatchingNode(documentRef, GEMINI_SELECTORS.root) || documentRef.body;
      },
      getConversationMessages(root) {
        if (!root) {
          return [];
        }
        const turnNodes = root.querySelectorAll(GEMINI_SELECTORS.turn.join(','));
        if (turnNodes.length) {
          return collectGeminiTurnMessages(turnNodes);
        }
        const selectorMessages = collectMessagesBySelectors(
          root,
          GEMINI_SELECTORS.user,
          GEMINI_SELECTORS.assistant,
          resolveRoleFromGeminiNode
        );
        if (selectorMessages.length) {
          return selectorMessages;
        }
        return collectMessagesByRoleAttributes(root);
      }
    };
  }

  function createClaudeAdapter(documentRef) {
    return {
      id: 'claude',
      getConversationRoot() {
        return findFirstMatchingNode(documentRef, CLAUDE_SELECTORS.root) || documentRef.body;
      },
      getConversationMessages(root) {
        if (!root) {
          return [];
        }
        const selectorMessages = collectMessagesBySelectors(
          root,
          CLAUDE_SELECTORS.user,
          CLAUDE_SELECTORS.assistant,
          resolveRoleFromClaudeNode
        );
        if (selectorMessages.length) {
          return selectorMessages;
        }
        return collectMessagesByRoleAttributes(root);
      }
    };
  }

  function resolveRoleFromAttributes(node) {
    for (const attributeName of ROLE_ATTRIBUTES) {
      const rawRole = node.getAttribute(attributeName);
      if (!rawRole) {
        continue;
      }
      const normalizedRole = rawRole.toLowerCase();
      if (ROLE_ALIASES.user.has(normalizedRole)) {
        return 'user';
      }
      if (ROLE_ALIASES.assistant.has(normalizedRole)) {
        return 'assistant';
      }
    }
    return null;
  }

  function collectMessagesByRoleAttributes(root, selectorOverride) {
    if (!root) {
      return [];
    }
    const selector = selectorOverride || ROLE_SELECTOR;
    const nodes = root.querySelectorAll(selector);
    const messages = [];
    nodes.forEach((node) => {
      const role = resolveRoleFromAttributes(node);
      if (role) {
        messages.push({ node, role });
      }
    });
    return messages;
  }

  function collectGeminiTurnMessages(turnNodes) {
    const messages = [];
    turnNodes.forEach((turnNode) => {
      const userNode = findFirstMatchingNode(turnNode, GEMINI_SELECTORS.user);
      if (userNode) {
        messages.push({ node: userNode, role: 'user' });
      }
      const assistantNode = findFirstMatchingNode(turnNode, GEMINI_SELECTORS.assistant);
      if (assistantNode) {
        messages.push({ node: assistantNode, role: 'assistant' });
      }
    });
    return messages;
  }

  function resolveRoleFromGeminiNode(node) {
    if (nodeMatchesAnySelector(node, GEMINI_SELECTORS.user)) {
      return 'user';
    }
    if (nodeMatchesAnySelector(node, GEMINI_SELECTORS.assistant)) {
      return 'assistant';
    }
    return resolveRoleFromAttributes(node);
  }

  function resolveRoleFromClaudeNode(node) {
    if (nodeMatchesAnySelector(node, CLAUDE_SELECTORS.user)) {
      return 'user';
    }
    if (nodeMatchesAnySelector(node, CLAUDE_SELECTORS.assistant)) {
      return 'assistant';
    }
    return resolveRoleFromAttributes(node);
  }

  function collectMessagesBySelectors(root, userSelectors, assistantSelectors, roleResolver) {
    if (!root || typeof root.querySelectorAll !== 'function') {
      return [];
    }
    const selector = userSelectors.concat(assistantSelectors).join(',');
    if (!selector) {
      return [];
    }
    const nodes = root.querySelectorAll(selector);
    const messages = [];
    nodes.forEach((node) => {
      const role = roleResolver(node);
      if (role) {
        messages.push({ node, role });
      }
    });
    return messages;
  }

  function nodeMatchesAnySelector(node, selectors) {
    for (const selector of selectors) {
      if (node.matches(selector)) {
        return true;
      }
    }
    return false;
  }

  function findFirstMatchingNode(root, selectors) {
    for (const selector of selectors) {
      const node = root.querySelector(selector);
      if (node) {
        return node;
      }
    }
    return null;
  }

  const adapterApi = createAdapterApi();
  ns.adapters = Object.assign({}, ns.adapters, adapterApi, { createAdapterApi });
})();
