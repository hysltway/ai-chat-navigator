<p align="center">
  <img src="Poster.png" alt="JumpNav Poster" width="100%" />
</p>

# JumpNav

JumpNav 是一款为 **ChatGPT、Gemini、Claude** 打造的悬浮侧边导航插件。
它会把长对话自动整理成可点击目录，并展示提问与回复预览，帮助你快速回到关键上下文。

**语言**：**简体中文** | [English](README_EN.md)

> 当前版本：**v2.2.2**

## 本次更新（v2.2.2）

- 新增导航折叠状态持久化：点击 `Hide` 后刷新页面，导航面板保持隐藏；点击 `Fab` 重新展开并记忆状态。
- 重构导航核心架构：`core` 拆分为编排层、导航控制器、会话索引器，降低耦合并提升稳定性。
- 抽离站点识别与公式设置共享服务，Popup 与内容脚本使用统一配置逻辑，减少跨模块配置偏差。
- 统一公式提取、转换与存储模块的 API 结构，提升后续测试与功能扩展效率。

## Chrome Web Store（推荐安装）

已上架 Chrome Web Store，推荐从商店安装以获得自动更新。

[JumpNav: The most elegant AI chat navigator you’ve ever seen.](https://chromewebstore.google.com/detail/chatgpt-gemini-quick-navi/kkemkfabmgjcjlileggigaaemcheapep)

## 核心价值

- **少滚动，多思考**：把超长聊天转成结构化导航，减少反复翻找。
- **即点即达**：点击条目即可平滑跳转到对应提问位置。
- **低打扰体验**：面板可隐藏、可拖拽，并记忆隐藏状态与位置，不影响主阅读区。

## 功能清单

- 自动提取用户提问并生成可点击导航目录，支持 ChatGPT、Gemini、Claude。
- 导航条目支持鼠标点击和键盘 `Enter` / `Space` 跳转到对应消息。
- 自动跟踪当前阅读位置，高亮当前条目并自动保持当前条目可见。
- 提供简约模式（Minimal）和自适应简约模式（面板与正文重叠时自动切换）。
- 简约模式下支持悬停/聚焦预览回答内容，点击预览可直接跳转。
- 支持一键 `Hide` / `Fab` 展开，刷新后保持隐藏或展开状态，并记忆 `Fab` 位置。
- 导航面板支持亮暗主题切换，并自动跟随站点主题变化（含过渡动画）。
- 支持 SPA 路由变化与消息流式更新的自动重建，无需手动刷新扩展。
- 公式点击复制支持 MathML / LaTeX：默认复制 MathML，`Shift+Click` 复制 LaTeX。
- 公式 MathML 引擎支持 MathJax / KaTeX / Auto，并在 Popup 中可配置与持久化。
- 内置公式提取兼容逻辑，覆盖 KaTeX、MathJax、`data-math`、`annotation` 等常见结构。


## 界面预览

**正常模式**
![正常模式](image1.png)

**简约模式**
![简约模式](image2.png)

**界面预览 3**
![界面预览 3](image3.png)

**界面预览 4**
![界面预览 4](image4.png)

**界面预览 5**
![界面预览 5](image5.png)

## 支持站点

- `chatgpt.com`
- `gemini.google.com`
- `claude.ai`

## 致谢

- 主题切换扩散动画参考了 [urzeye/ophel](https://github.com/urzeye/ophel) 的实现思路。

## 许可证

CC BY-NC-SA 4.0（知识共享署名-非商业性使用-相同方式共享）

- ✅ 可以自由使用、复制、修改和分发
- ✅ 必须署名（注明原作者）
- ❌ 不可用于商业目的
- ✅ 修改后的作品必须采用相同许可证

详见：[CC BY-NC-SA 4.0 许可证完整文本](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh)
