import { ns } from './namespace';
import { startContentDevReload } from '../shared/dev-reload';
import './utils';
import './storage';
import './site';
import './prompt-library-store';
import './prompt-library-site';
import './adapter';
import './formula-extractor';
import './formula-converter';
import './formula-settings';
import './formula-copy';
import './ui-style';
import './ui';
import './prompt-library-ui-style';
import './prompt-library-ui-render';
import './prompt-library-ui';
import './core-theme';
import './core-ui-behavior';
import './core-conversation-indexer';
import './core-navigation-controller';
import './sidebar-favorites';
import './prompt-library';
import './gemini-quote-reply';
import './core';

function startIfAvailable(moduleName: string, methodName = 'start'): void {
  const targetModule = ns[moduleName];
  if (!targetModule || typeof targetModule[methodName] !== 'function') {
    return;
  }

  targetModule[methodName]();
}

function start(): void {
  startIfAvailable('formulaCopy');
  startIfAvailable('promptLibrary');
  startIfAvailable('geminiQuoteReply');
  startIfAvailable('sidebarFavorites');
  startIfAvailable('core');
}

start();
startContentDevReload();
