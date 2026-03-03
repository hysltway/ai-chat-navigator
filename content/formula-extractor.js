(() => {
  'use strict';

  const ns = window.ChatGptNav || {};

  const FORMULA_SELECTORS = [
    '.katex',
    '.math-block',
    '.math-inline',
    '[data-math]',
    '[data-custom-copy-text]',
    '.MathJax_Display',
    '.MathJax_SVG_Display',
    '.MathJax',
    '.MathJax_SVG',
    '.mwe-math-element'
  ];

  const FORMULA_ROOT_SELECTOR = FORMULA_SELECTORS.join(',');
  const LATEX_ATTRIBUTE_CANDIDATES = ['data-latex', 'data-tex', 'title', 'aria-label'];
  const PLATFORM_FORMULA_SELECTORS = {
    chatgpt: '.katex, .MathJax, .MathJax_SVG, .mwe-math-element',
    claude: '.katex, .MathJax, .MathJax_SVG, .mwe-math-element',
    gemini: '.math-inline, .math-block',
    generic: FORMULA_ROOT_SELECTOR
  };

  function createEnvironment(overrides = {}) {
    return {
      documentRef: overrides.documentRef || document
    };
  }

  function createFormulaExtractorApi(environment = createEnvironment()) {
    const env = createEnvironment(environment);

    function normalizeLatex(rawLatex) {
      if (!rawLatex || typeof rawLatex !== 'string') {
        return null;
      }
      let latex = rawLatex.trim();
      if (!latex) {
        return null;
      }

      if (latex.startsWith('\\(') && latex.endsWith('\\)')) {
        latex = latex.slice(2, -2).trim();
      } else if (latex.startsWith('\\[') && latex.endsWith('\\]')) {
        latex = latex.slice(2, -2).trim();
      } else if (latex.startsWith('$$') && latex.endsWith('$$') && latex.length > 4) {
        latex = latex.slice(2, -2).trim();
      } else if (latex.startsWith('$') && latex.endsWith('$') && latex.length > 2) {
        latex = latex.slice(1, -1).trim();
      }

      return latex || null;
    }

    function textFromNode(node) {
      if (!node || typeof node.textContent !== 'string') {
        return null;
      }
      return normalizeLatex(node.textContent);
    }

    function getAttributeLatex(node, attrName) {
      if (!node || !node.getAttribute || !node.hasAttribute || !node.hasAttribute(attrName)) {
        return null;
      }
      const value = node.getAttribute(attrName);
      if (typeof value !== 'string') {
        return null;
      }
      if (attrName === 'title' || attrName === 'aria-label') {
        if (!value.includes('\\') && !value.includes('$')) {
          return null;
        }
      }
      return normalizeLatex(value);
    }

    function extractFromMathJaxScripts(formulaElement) {
      if (!formulaElement) {
        return null;
      }

      const directScripts = formulaElement.querySelectorAll('script[type*="math/tex"]');
      for (const script of directScripts) {
        const latex = textFromNode(script);
        if (latex) {
          return latex;
        }
      }

      let nextSibling = formulaElement.nextElementSibling;
      if (nextSibling?.tagName === 'SCRIPT' && nextSibling.type?.startsWith('math/tex')) {
        const latex = textFromNode(nextSibling);
        if (latex) {
          return latex;
        }
      }

      if (formulaElement.parentElement) {
        nextSibling = formulaElement.parentElement.nextElementSibling;
        if (nextSibling?.tagName === 'SCRIPT' && nextSibling.type?.startsWith('math/tex')) {
          const latex = textFromNode(nextSibling);
          if (latex) {
            return latex;
          }
        }
      }

      return null;
    }

    function extractFromAnnotations(formulaElement) {
      if (!formulaElement || typeof formulaElement.querySelector !== 'function') {
        return null;
      }

      const annotation = formulaElement.querySelector('annotation[encoding="application/x-tex"]');
      if (annotation) {
        const latex = textFromNode(annotation);
        if (latex) {
          return latex;
        }
      }

      const katexMathmlAnnotation = formulaElement.querySelector('.katex-mathml annotation');
      if (katexMathmlAnnotation) {
        const latex = textFromNode(katexMathmlAnnotation);
        if (latex) {
          return latex;
        }
      }

      let wikiMathContainer = formulaElement;
      if (!wikiMathContainer.classList?.contains('mwe-math-element')) {
        wikiMathContainer = formulaElement.closest('.mwe-math-element');
      }
      if (wikiMathContainer) {
        const wikiAnnotation = wikiMathContainer.querySelector('annotation');
        if (wikiAnnotation) {
          const latex = textFromNode(wikiAnnotation);
          if (latex) {
            return latex;
          }
        }
      }

      return null;
    }

    function extractFromDataMath(formulaElement) {
      if (!formulaElement) {
        return null;
      }

      const currentDataMath = getAttributeLatex(formulaElement, 'data-math');
      if (currentDataMath) {
        return currentDataMath;
      }

      const documentBody = env.documentRef && env.documentRef.body ? env.documentRef.body : null;
      let parent = formulaElement.parentElement;
      while (parent && parent !== documentBody) {
        const parentDataMath = getAttributeLatex(parent, 'data-math');
        if (parentDataMath) {
          return parentDataMath;
        }
        parent = parent.parentElement;
      }

      return null;
    }

    function extractFromDoubao(formulaElement) {
      if (!formulaElement) {
        return null;
      }

      const currentValue = getAttributeLatex(formulaElement, 'data-custom-copy-text');
      if (currentValue) {
        return currentValue;
      }

      const inlineParent = formulaElement.closest('.math-inline');
      if (inlineParent) {
        const parentValue = getAttributeLatex(inlineParent, 'data-custom-copy-text');
        if (parentValue) {
          return parentValue;
        }
      }

      const childNode =
        typeof formulaElement.querySelector === 'function'
          ? formulaElement.querySelector('[data-custom-copy-text]')
          : null;
      if (childNode) {
        return getAttributeLatex(childNode, 'data-custom-copy-text');
      }

      return null;
    }

    function extractFromGenericAttributes(formulaElement) {
      if (!formulaElement || !formulaElement.hasAttribute) {
        return null;
      }
      for (const attr of LATEX_ATTRIBUTE_CANDIDATES) {
        const latex = getAttributeLatex(formulaElement, attr);
        if (latex) {
          return latex;
        }
      }
      return null;
    }

    function extractLatex(formulaElement) {
      if (!formulaElement) {
        return null;
      }

      const orderedExtractors = [
        extractFromDoubao,
        extractFromDataMath,
        extractFromAnnotations,
        extractFromMathJaxScripts,
        extractFromGenericAttributes
      ];

      for (const extractor of orderedExtractors) {
        const latex = extractor(formulaElement);
        if (latex) {
          return latex;
        }
      }

      return null;
    }

    function extractMathML(formulaElement) {
      if (!formulaElement) {
        return null;
      }

      if (formulaElement.tagName?.toLowerCase() === 'math') {
        return formulaElement.outerHTML;
      }

      const inlineMath =
        formulaElement.querySelector?.('.katex-mathml > math') ||
        formulaElement.querySelector?.('math') ||
        formulaElement.closest?.('math');
      if (!inlineMath) {
        return null;
      }
      return inlineMath.outerHTML || null;
    }

    function isDisplayFormula(formulaElement, latexHint) {
      if (!formulaElement) {
        return false;
      }

      if (
        formulaElement.classList?.contains('katex-display') ||
        formulaElement.classList?.contains('math-block') ||
        formulaElement.classList?.contains('MathJax_Display') ||
        formulaElement.classList?.contains('MathJax_SVG_Display')
      ) {
        return true;
      }

      const latex = typeof latexHint === 'string' ? latexHint.trim() : '';
      if (!latex) {
        return false;
      }

      return (
        latex.startsWith('\\[') ||
        latex.startsWith('$$') ||
        latex.startsWith('\\begin{equation') ||
        latex.startsWith('\\begin{align')
      );
    }

    function getFormulaSelector(platform) {
      if (!platform) {
        return PLATFORM_FORMULA_SELECTORS.generic;
      }
      return PLATFORM_FORMULA_SELECTORS[platform] || PLATFORM_FORMULA_SELECTORS.generic;
    }

    function resolveFormulaElement(target, platform) {
      if (!target || typeof target.closest !== 'function') {
        return null;
      }
      return target.closest(getFormulaSelector(platform));
    }

    return {
      extractLatex,
      extractMathML,
      isDisplayFormula,
      getFormulaSelector,
      resolveFormulaElement,
      FORMULA_ROOT_SELECTOR
    };
  }

  const formulaExtractorApi = createFormulaExtractorApi();
  ns.formulaExtractor = Object.assign({}, ns.formulaExtractor, formulaExtractorApi, { createFormulaExtractorApi });

  window.ChatGptNav = ns;
})();
