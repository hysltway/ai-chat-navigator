# JumpNav 公式点击复制（LaTeX / MathML）实现说明

本文基于 `examplecode` 中的 3 套示例实现（`CopyTex`、`deep-share`、`AITimeline`），给出一份可直接落地到你当前插件（`chatgpt-nav-extension`）的方案说明。

目标能力：

1. 点击 AI 对话中的公式。
2. 自动提取 LaTeX（按平台 DOM 差异适配）。
3. 按设置复制为 `LaTeX` 或 `MathML`。
4. 默认优先 `MathML`，保证用户在 Word 公式编辑器里粘贴更稳定。

---

## 1. 示例代码中“关键脚本”定位

### 1.1 最小可用实现（CopyTex）

- `examplecode/CopyTex/content.js`

作用：

1. 识别公式节点（KaTeX/MathJax/data-latex）。
2. 提取 LaTeX（`annotation`、`script[type*=math/tex]` 等）。
3. 悬浮按钮触发 `navigator.clipboard.writeText()`。

适合借鉴点：

1. 公式识别兜底非常全。
2. 代码简单，便于迁移。

### 1.2 Word 友好实现（deep-share）

- `examplecode/deep-share/scripts/copyKatex.js`  
  ChatGPT 等 KaTeX 平台：点击 `.katex`，从 `annotation[encoding="application/x-tex"]` 提取 LaTeX。
- `examplecode/deep-share/scripts/copyGeminiMath.js`  
  Gemini 平台：点击 `.math-inline/.math-block`，直接读 `data-math`。
- `examplecode/deep-share/scripts/formulaConverter.js`  
  把 LaTeX 转为 MathML（MathJax/KaTeX 双引擎 + 清洗逻辑）。
- `examplecode/deep-share/manifest.json`  
  按站点注入不同脚本（Gemini 用专用脚本，其他 KaTeX 站点复用通用脚本）。

适合借鉴点：

1. 支持 LaTeX 与 MathML 两种复制格式。
2. MathML 清洗（移除 `data-semantic-*`、不可见操作符）对 Word 粘贴很关键。
3. Gemini 使用 window 捕获阶段点击拦截，避免与其它扩展抢事件。

### 1.3 多平台提取器（AITimeline）

- `examplecode/AITimeline/js/formula/latex-extractor.js`  
  核心是“按优先级依次尝试”的提取器。
- `examplecode/AITimeline/js/formula/formula-manager.js`  
  负责扫描公式、绑定点击复制、动态监听新增内容。
- `examplecode/AITimeline/js/formula/index.js`  
  模块入口，自动初始化与销毁。

适合借鉴点：

1. 提取逻辑和交互逻辑解耦，便于维护。
2. 对动态页面（SPA）稳定，支持重新扫描和 URL 变化清理。
3. 对多平台 DOM 差异采用“多策略提取 + 兜底”模式，比写死选择器更稳。

---

## 2. ChatGPT / Gemini / Claude 的 DOM 差异与处理方式

下面按“平台差异 -> 示例实现策略”来说明。

### 2.1 ChatGPT

常见公式结构：

```html
<span class="katex">
  <span class="katex-mathml">
    <math>
      <annotation encoding="application/x-tex">\frac{a}{b}</annotation>
    </math>
  </span>
</span>
```

实现策略：

1. 匹配 `.katex`。
2. 从 `.katex-mathml annotation[encoding="application/x-tex"]` 读取 LaTeX。
3. 根据设置直接复制 LaTeX，或先转 MathML 再复制。

对应示例：

- `deep-share/scripts/copyKatex.js`
- `AITimeline/js/formula/latex-extractor.js`（方法 6/7）

### 2.2 Gemini

常见公式结构：

```html
<span class="math-inline" data-math="\frac{a}{b}">...</span>
<div class="math-block" data-math="\int_0^1 x dx">...</div>
```

实现策略：

1. 匹配 `.math-inline, .math-block`。
2. 直接读 `data-math`（必要时向父节点回溯）。
3. 在 `window.addEventListener('click', handler, true)` 捕获阶段处理。
4. 对命中的公式点击执行 `preventDefault + stopPropagation + stopImmediatePropagation`，避免事件被其它脚本拦截。

对应示例：

- `deep-share/scripts/copyGeminiMath.js`
- `AITimeline/js/formula/latex-extractor.js`（方法 4/5）

### 2.3 Claude

在示例代码中，Claude 没有单独的公式复制脚本，但通过“通用 KaTeX/MathJax 路径”处理：

1. Claude 公式通常也能命中 `.katex` + `annotation` 结构。
2. 若非 KaTeX，可走 MathJax `script[type^="math/tex"]` 兄弟节点策略。
3. 再兜底 `data-latex` / `data-tex` / `aria-label` 等属性。

对应示例：

- `CopyTex/content.js`（通用提取）
- `AITimeline/js/formula/latex-extractor.js`（方法 6/9/10）

结论：Claude 不一定需要“专用脚本”，但需要“通用提取兜底链路”。

---

## 3. 面向你当前插件的推荐落地架构

你当前插件已经支持 `chatgpt.com / gemini.google.com / claude.ai`，见 `manifest.json` 和 `content/adapter.js`。建议新增 3 个模块：

1. `content/formula-extractor.js`  
   只负责“从 DOM 提取 LaTeX + 判断行内/块级”。
2. `content/formula-converter.js`  
   只负责“Latex -> MathML 转换与清洗”。
3. `content/formula-copy.js`  
   只负责“事件绑定、调用 extractor/converter、写入剪贴板、提示”。

这样能和现有模块化结构保持一致，不污染 `core.js`。

---

## 4. 代码示例（可直接改造成你项目代码）

下面是推荐实现骨架，按你当前命名空间 `window.ChatGptNav` 组织。

### 4.1 `content/formula-extractor.js`

```javascript
(() => {
  'use strict';

  const ns = window.ChatGptNav || {};

  function isDisplayFormula(el) {
    if (!el) return false;
    if (el.classList.contains('katex-display')) return true;
    if (el.classList.contains('math-block')) return true;
    return false;
  }

  function extractLatex(formulaElement) {
    if (!formulaElement) return null;

    if (formulaElement.hasAttribute('data-custom-copy-text')) {
      return formulaElement.getAttribute('data-custom-copy-text').trim();
    }

    if (formulaElement.hasAttribute('data-math')) {
      return formulaElement.getAttribute('data-math').trim();
    }

    const mathHost = formulaElement.closest('.math-inline, .math-block');
    if (mathHost?.dataset?.math) {
      return mathHost.dataset.math.trim();
    }

    const annotation = formulaElement.querySelector('annotation[encoding="application/x-tex"]');
    if (annotation?.textContent) {
      return annotation.textContent.trim();
    }

    const mathJaxScriptSibling = formulaElement.nextElementSibling;
    if (
      mathJaxScriptSibling?.tagName === 'SCRIPT' &&
      mathJaxScriptSibling.type?.startsWith('math/tex')
    ) {
      return mathJaxScriptSibling.textContent.trim();
    }

    if (formulaElement.hasAttribute('data-latex')) {
      return formulaElement.getAttribute('data-latex').trim();
    }

    return null;
  }

  ns.formulaExtractor = {
    extractLatex,
    isDisplayFormula
  };

  window.ChatGptNav = ns;
})();
```

### 4.2 `content/formula-converter.js`

```javascript
(() => {
  'use strict';

  const ns = window.ChatGptNav || {};

  function cleanMathML(mathmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(mathmlString, 'text/xml');
    const math = doc.querySelector('math');
    if (!math) return mathmlString;

    math.querySelectorAll('*').forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.startsWith('data-semantic') || attr.name === 'data-latex') {
          el.removeAttribute(attr.name);
        }
      });
    });

    math.querySelectorAll('mo').forEach((mo) => {
      const t = mo.textContent;
      if (t === '\u2061' || t === '\u2062' || t === '\u2063' || t === '\u2064') {
        mo.remove();
      }
    });

    return new XMLSerializer().serializeToString(math);
  }

  async function latexToMathML(latex, options = {}) {
    const displayMode = options.displayMode !== false;

    if (window.MathJax?.tex2mml) {
      try {
        return cleanMathML(window.MathJax.tex2mml(latex, { display: displayMode }));
      } catch (e) {
        console.warn('[formula] MathJax convert failed:', e);
      }
    }

    if (typeof window.katex !== 'undefined') {
      try {
        const tmp = document.createElement('div');
        window.katex.render(latex, tmp, {
          output: 'mathml',
          throwOnError: false,
          displayMode
        });
        const math = tmp.querySelector('math');
        if (math) return math.outerHTML;
      } catch (e) {
        console.warn('[formula] KaTeX convert failed:', e);
      }
    }

    return latex;
  }

  ns.formulaConverter = {
    latexToMathML
  };

  window.ChatGptNav = ns;
})();
```

### 4.3 `content/formula-copy.js`

```javascript
(() => {
  'use strict';

  const ns = window.ChatGptNav;
  if (!ns?.formulaExtractor || !ns?.formulaConverter) return;

  const DEFAULT_SETTINGS = {
    enableFormulaCopy: true,
    formulaFormat: 'mathml' // 推荐默认值，Word 兼容更稳
  };

  let settings = { ...DEFAULT_SETTINGS };

  function getPlatform() {
    const host = location.hostname;
    if (host.includes('chatgpt.com') || host.includes('chat.openai.com')) return 'chatgpt';
    if (host.includes('gemini.google.com')) return 'gemini';
    if (host.includes('claude.ai')) return 'claude';
    return 'generic';
  }

  function getFormulaSelector(platform) {
    if (platform === 'gemini') return '.math-inline, .math-block';
    if (platform === 'chatgpt') return '.katex, .MathJax, math';
    if (platform === 'claude') return '.katex, .MathJax, math';
    return '.katex, .math-inline, .math-block, .MathJax, math';
  }

  async function loadSettings() {
    const saved = await ns.storage.getJson('formula_copy_settings');
    if (saved && typeof saved === 'object') {
      settings = { ...DEFAULT_SETTINGS, ...saved };
    }
  }

  async function copyFormula(formulaEl) {
    const latex = ns.formulaExtractor.extractLatex(formulaEl);
    if (!latex) return;

    let payload = latex;
    if (settings.formulaFormat === 'mathml') {
      const displayMode = ns.formulaExtractor.isDisplayFormula(formulaEl);
      payload = await ns.formulaConverter.latexToMathML(latex, { displayMode });
    }

    await navigator.clipboard.writeText(payload);
  }

  async function handleClick(evt) {
    if (!settings.enableFormulaCopy) return;
    const platform = getPlatform();
    const selector = getFormulaSelector(platform);
    const formulaEl = evt.target?.closest?.(selector);
    if (!formulaEl) return;

    if (platform === 'gemini') {
      evt.preventDefault();
      evt.stopPropagation();
      evt.stopImmediatePropagation();
    }

    try {
      await copyFormula(formulaEl);
    } catch (e) {
      console.error('[formula] copy failed:', e);
    }
  }

  async function start() {
    await loadSettings();
    window.addEventListener('click', handleClick, true);

    const observer = new MutationObserver(() => {
      // 这里可加 hover 样式刷新逻辑；点击代理模式下可以为空实现
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  ns.formulaCopy = { start };
})();
```

---

## 5. 配置步骤（按你当前工程结构）

### 5.1 `manifest.json` 注入顺序

把新脚本放到 `content_scripts.js` 中，顺序建议：

```json
[
  "content/namespace.js",
  "content/utils.js",
  "content/storage.js",
  "content/adapter.js",
  "content/formula-extractor.js",
  "content/formula-converter.js",
  "content/formula-copy.js",
  "content/ui-style.js",
  "content/ui.js",
  "content/core-theme.js",
  "content/core-ui-behavior.js",
  "content/core.js",
  "content.js"
]
```

说明：

1. `formula-copy.js` 依赖 `storage.js`、`formula-extractor.js`、`formula-converter.js`，所以必须后置。
2. 不需要新增 host，当前已经覆盖 ChatGPT/Gemini/Claude。
3. 剪贴板写入使用用户点击触发，一般不必额外声明 `clipboardWrite`。若你后续改成非用户手势写入，再评估权限。

### 5.2 `content.js` 启动入口

```javascript
(() => {
  'use strict';

  if (!window.ChatGptNav) return;

  if (window.ChatGptNav.formulaCopy?.start) {
    window.ChatGptNav.formulaCopy.start();
  }

  if (window.ChatGptNav.core?.start) {
    window.ChatGptNav.core.start();
  }
})();
```

### 5.3 设置项建议（storage）

建议统一使用一个 JSON 键：

```json
{
  "enableFormulaCopy": true,
  "formulaFormat": "mathml"
}
```

推荐默认值：

1. `enableFormulaCopy = true`
2. `formulaFormat = mathml`

### 5.4 独立运行约束（不依赖 examplecode）

推荐默认模式：插件**独立运行**，不在 `manifest.json` 里引用 `examplecode/*` 脚本。

实现策略：

1. 优先提取页面中已存在的 MathML（例如 KaTeX 渲染结果里的 `<math>`）。
2. 若无法拿到 MathML，则使用插件内置的 vendored MathJax/KaTeX 做转换。
3. 仍转换失败时，回退复制 LaTeX（保证点击一定有结果）。
4. 可加快捷键：`Shift + 点击公式` 强制复制 LaTeX（便于高级用户快速切换格式）。

这样可以保证：

1. 打包发布时路径稳定，不会出现“找不到 examplecode 脚本”。
2. 插件源码与示例仓库彻底解耦（仅一次性复制 vendor 文件）。
3. 在不同站点 CSP 下仍可稳定工作。

---

## 6. Word “无缝粘贴”关键点

要保证用户粘贴体验稳定，请优先保证这 3 件事：

1. 默认复制 `MathML`，不要只复制 `$$...$$`。
2. 在转换后清洗 MathML（去掉语义噪音属性和不可见操作符）。
3. 转换失败时退回 LaTeX，避免“点击了但无内容”。

用户侧操作建议（写进产品说明）：

1. 在 Word 中按 `Alt + =` 先进入公式编辑框。
2. 直接 `Ctrl + V` 粘贴扩展复制内容。
3. 如遇个别环境不识别 MathML，则切换插件设置为 LaTeX 再粘贴。

---

## 7. 最小测试清单（发布前手测）

ChatGPT：

1. 行内公式点击复制成功。
2. 块级公式点击复制成功。
3. 长对话滚动后新出现公式可复制。

Gemini：

1. `.math-inline` 与 `.math-block` 都可复制。
2. 不被页面/其它扩展点击处理链吞掉。
3. 复制结果在 Word 可粘贴。

Claude：

1. KaTeX 公式可复制。
2. MathJax 场景（如有）可通过 script 兜底提取。
3. 复制失败时有可见反馈（console 或 toast）。

---

## 8. 迁移建议（从示例到生产）

1. 优先复用 AITimeline 的“提取器分层”思路。
2. 引入 deep-share 的 MathML 清洗与双引擎回退。
3. 保留 CopyTex 的通用兜底属性提取，覆盖 Claude 等未显式适配页面。
4. 事件层面采用 Gemini 特判（捕获阶段拦截），其余平台可常规代理。

这样组合后，你的插件会同时具备“多平台稳定提取”和“Word 粘贴兼容”两项能力。
