
  import { ns } from './namespace';

  interface MathJaxLike {
    tex2mml(latexCode: string, options?: { display?: boolean }): string;
  }

  interface KatexLike {
    render(
      latexCode: string,
      container: HTMLElement,
      options?: { output?: string; throwOnError?: boolean; displayMode?: boolean }
    ): void;
  }

  interface FormulaConverterWindow extends Window {
    MathJax?: MathJaxLike;
    katex?: KatexLike;
  }

  interface FormulaConverterEnvironment {
    windowRef?: FormulaConverterWindow;
    documentRef?: Document;
    domParserRef?: typeof DOMParser;
    xmlSerializerRef?: typeof XMLSerializer;
    nowFn?: () => number;
    setIntervalFn?: typeof window.setInterval;
    clearIntervalFn?: typeof window.clearInterval;
  }

  interface LatexToMathMLOptions {
    displayMode?: boolean;
    engine?: 'mathjax' | 'katex' | 'auto';
  }

  interface FormulaEngineReadiness {
    mathjax: boolean;
    katex: boolean;
  }

  function createEnvironment(overrides: FormulaConverterEnvironment = {}): Required<FormulaConverterEnvironment> {
    return {
      windowRef: overrides.windowRef || (window as FormulaConverterWindow),
      documentRef: overrides.documentRef || document,
      domParserRef: overrides.domParserRef || DOMParser,
      xmlSerializerRef: overrides.xmlSerializerRef || XMLSerializer,
      nowFn: overrides.nowFn || Date.now,
      setIntervalFn: overrides.setIntervalFn || setInterval,
      clearIntervalFn: overrides.clearIntervalFn || clearInterval
    };
  }

  function createFormulaConverterApi(environment: FormulaConverterEnvironment = createEnvironment()) {
    const env = createEnvironment(environment);
    let warmupPromise: Promise<FormulaEngineReadiness> | null = null;
    const readiness: FormulaEngineReadiness = {
      mathjax: false,
      katex: false
    };

    function waitFor(checker: () => boolean, timeoutMs: number, intervalMs: number): Promise<boolean> {
      return new Promise<boolean>((resolve) => {
        if (checker()) {
          resolve(true);
          return;
        }

        const startedAt = env.nowFn();
        const timer = env.setIntervalFn(() => {
          if (checker()) {
            env.clearIntervalFn(timer);
            resolve(true);
            return;
          }

          if (env.nowFn() - startedAt >= timeoutMs) {
            env.clearIntervalFn(timer);
            resolve(false);
          }
        }, intervalMs);
      });
    }

    function cleanMathML(mathmlString) {
      if (!mathmlString || typeof mathmlString !== 'string') {
        return null;
      }

      const parser = new env.domParserRef();
      const doc = parser.parseFromString(mathmlString, 'text/xml');
      const math = doc.querySelector('math');
      if (!math) {
        return null;
      }

      math.setAttribute('xmlns', 'http://www.w3.org/1998/Math/MathML');

      math.querySelectorAll('*').forEach((node) => {
        Array.from(node.attributes).forEach((attr: Attr) => {
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

      return new env.xmlSerializerRef().serializeToString(math);
    }

    function canUseMathJax() {
      return Boolean(env.windowRef.MathJax && typeof env.windowRef.MathJax.tex2mml === 'function');
    }

    function canUseKatex() {
      return Boolean(env.windowRef.katex && typeof env.windowRef.katex.render === 'function');
    }

    function getMathJax(): MathJaxLike | null {
      return canUseMathJax() ? env.windowRef.MathJax || null : null;
    }

    function getKatex(): KatexLike | null {
      return canUseKatex() ? env.windowRef.katex || null : null;
    }

    function convertWithMathJax(latexCode, displayMode) {
      const mathJax = getMathJax();
      if (!mathJax) {
        return null;
      }
      try {
        const rawMathml = mathJax.tex2mml(latexCode, { display: displayMode });
        return cleanMathML(rawMathml);
      } catch (error) {
        return null;
      }
    }

    function convertWithKatex(latexCode, displayMode) {
      const katex = getKatex();
      if (!katex) {
        return null;
      }
      try {
        const container = env.documentRef.createElement('div');
        katex.render(latexCode, container, {
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

    function pickEngines(engine: LatexToMathMLOptions['engine']) {
      if (engine === 'mathjax') {
        return ['mathjax', 'katex'];
      }
      if (engine === 'katex') {
        return ['katex', 'mathjax'];
      }
      return ['mathjax', 'katex'];
    }

    async function latexToMathML(latexCode: string, options: LatexToMathMLOptions = {}) {
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
        let converted: string | null = null;
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

    async function warmup(): Promise<FormulaEngineReadiness> {
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

    return {
      warmup,
      cleanMathML,
      canUseMathJax,
      canUseKatex,
      latexToMathML
    };
  }

  const formulaConverterApi = createFormulaConverterApi();
  ns.formulaConverter = Object.assign({}, ns.formulaConverter, formulaConverterApi, { createFormulaConverterApi });

  window.ChatGptNav = ns;
