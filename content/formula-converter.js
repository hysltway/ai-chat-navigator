(() => {
  'use strict';

  const ns = window.ChatGptNav || {};
  let warmupPromise = null;
  const readiness = {
    mathjax: false,
    katex: false
  };

  function waitFor(checker, timeoutMs, intervalMs) {
    return new Promise((resolve) => {
      if (checker()) {
        resolve(true);
        return;
      }

      const startedAt = Date.now();
      const timer = setInterval(() => {
        if (checker()) {
          clearInterval(timer);
          resolve(true);
          return;
        }

        if (Date.now() - startedAt >= timeoutMs) {
          clearInterval(timer);
          resolve(false);
        }
      }, intervalMs);
    });
  }

  function cleanMathML(mathmlString) {
    if (!mathmlString || typeof mathmlString !== 'string') {
      return null;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(mathmlString, 'text/xml');
    const math = doc.querySelector('math');
    if (!math) {
      return null;
    }

    math.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');

    math.querySelectorAll('*').forEach((node) => {
      Array.from(node.attributes).forEach((attr) => {
        if (attr.name.startsWith('data-semantic') || attr.name === 'data-latex') {
          node.removeAttribute(attr.name);
        }
      });
    });

    math.querySelectorAll('mo').forEach((operator) => {
      const content = operator.textContent;
      if (content === '\u2061' || content === '\u2062' || content === '\u2063' || content === '\u2064') {
        operator.remove();
      }
    });

    return new XMLSerializer().serializeToString(math);
  }

  function canUseMathJax() {
    return Boolean(window.MathJax && typeof window.MathJax.tex2mml === 'function');
  }

  function canUseKatex() {
    return Boolean(window.katex && typeof window.katex.render === 'function');
  }

  function convertWithMathJax(latexCode, displayMode) {
    if (!canUseMathJax()) {
      return null;
    }
    try {
      const rawMathml = window.MathJax.tex2mml(latexCode, { display: displayMode });
      return cleanMathML(rawMathml);
    } catch (error) {
      return null;
    }
  }

  function convertWithKatex(latexCode, displayMode) {
    if (!canUseKatex()) {
      return null;
    }
    try {
      const container = document.createElement('div');
      window.katex.render(latexCode, container, {
        output: 'mathml',
        throwOnError: false,
        displayMode
      });
      const mathNode = container.querySelector('math');
      if (!mathNode) {
        return null;
      }
      return cleanMathML(mathNode.outerHTML);
    } catch (error) {
      return null;
    }
  }

  function pickEngines(engine) {
    if (engine === 'mathjax') {
      return ['mathjax', 'katex'];
    }
    if (engine === 'katex') {
      return ['katex', 'mathjax'];
    }
    return ['mathjax', 'katex'];
  }

  async function latexToMathML(latexCode, options = {}) {
    if (!latexCode || typeof latexCode !== 'string') {
      return null;
    }

    const displayMode = options.displayMode !== false;
    const engine = options.engine || 'auto';
    const engines = pickEngines(engine);

    if (!readiness.mathjax && !readiness.katex) {
      await warmup();
    }

    for (const currentEngine of engines) {
      let converted = null;
      if (currentEngine === 'mathjax') {
        converted = convertWithMathJax(latexCode, displayMode);
      } else if (currentEngine === 'katex') {
        converted = convertWithKatex(latexCode, displayMode);
      }
      if (converted) {
        return converted;
      }
    }

    return null;
  }

  async function warmup() {
    if (warmupPromise) {
      return warmupPromise;
    }

    warmupPromise = Promise.all([
      waitFor(canUseMathJax, 3000, 100),
      waitFor(canUseKatex, 1500, 60)
    ]).then(([mathjaxReady, katexReady]) => {
      readiness.mathjax = mathjaxReady;
      readiness.katex = katexReady;
      return { ...readiness };
    });

    return warmupPromise;
  }

  ns.formulaConverter = {
    warmup,
    cleanMathML,
    canUseMathJax,
    canUseKatex,
    latexToMathML
  };

  window.ChatGptNav = ns;
})();
