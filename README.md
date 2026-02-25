<p align="center">
  <img src="Poster.png" alt="JumpNav Poster" width="100%" />
</p>

# JumpNav

JumpNav 是一款为 **ChatGPT、Gemini、Claude** 打造的悬浮侧边导航插件。
它会把长对话自动整理成可点击目录，并展示提问与回复预览，帮助你快速回到关键上下文。

**语言**：**简体中文** | [English](README_EN.md)

> 当前版本：**v2.0.0**

## Chrome Web Store（推荐安装）

已上架 Chrome Web Store，推荐从商店安装以获得自动更新。

[JumpNav: The most elegant AI chat navigator you’ve ever seen.](https://chromewebstore.google.com/detail/chatgpt-gemini-quick-navi/kkemkfabmgjcjlileggigaaemcheapep)

## 核心价值

- **少滚动，多思考**：把超长聊天转成结构化导航，减少反复翻找。
- **即点即达**：点击条目即可平滑跳转到对应提问位置。
- **低打扰体验**：面板可隐藏、可拖拽、自动记忆位置，不影响主阅读区。

## 核心特性

### 1. 智能导航系统

- 自动识别用户提问并按顺序生成导航条目。
- 支持 AI 回复预览，帮助快速理解上下文。
- 基于视口位置自动识别当前阅读段落。
- 兼容 SPA 路由变化与动态加载内容，列表实时同步。

### 2. 双模式显示

**正常模式（默认）**
- 显示提问内容（两行截断）+ 回复预览（单行截断）。
- 信息更完整，适合浏览和回顾。

**简约模式（极简）**
- 仅显示序号圆点，最大化减少视觉占用。
- 悬停或键盘聚焦时显示预览。

**自适应切换（自动）**
- 根据面板与正文几何关系自动切换，避免遮挡内容。
- 窗口恢复可用空间后自动回到正常模式。
- 连续缩放时带稳定阈值，避免来回闪烁。

### 3. 交互与体验

- 右侧悬浮 FAB，仅支持上下拖动。
- 自动保存位置并在下次访问恢复。
- 完整键盘导航与焦点管理。
- 尊重 `prefers-reduced-motion`，照顾低动画偏好。
- 自动跟随站点主题（ChatGPT / Gemini / Claude）。

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
