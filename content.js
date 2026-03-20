(() => {
  'use strict';

  function createBootstrapper(globalRef = window) {
    function startIfAvailable(moduleName, methodName = 'start') {
      if (!globalRef.ChatGptNav || !globalRef.ChatGptNav[moduleName]) {
        return;
      }
      const targetMethod = globalRef.ChatGptNav[moduleName][methodName];
      if (typeof targetMethod === 'function') {
        targetMethod();
      }
    }

    function start() {
      if (!globalRef.ChatGptNav) {
        return;
      }
      startIfAvailable('formulaCopy');
      startIfAvailable('promptLibrary');
      startIfAvailable('core');
    }

    return {
      start
    };
  }

  createBootstrapper().start();
})();
