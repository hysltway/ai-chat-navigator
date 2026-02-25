<p align="center">
  <img src="Poster.png" alt="JumpNav Poster" width="100%" />
</p>

# JumpNav

JumpNav is a floating side navigator for **ChatGPT, Gemini, and Claude**.
It turns long conversations into clickable outlines with prompt and reply previews, so you can jump back to key context in seconds.

**Language:** [简体中文](README.md) | **English**

> Current Version: **v2.0.0**

## Chrome Web Store (Recommended)

Now live on the Chrome Web Store. Install from the store for automatic updates.

[JumpNav: The most elegant AI chat navigator you’ve ever seen.](https://chromewebstore.google.com/detail/chatgpt-gemini-quick-navi/kkemkfabmgjcjlileggigaaemcheapep)

## Core Value

- **Less scrolling, more thinking**: Convert long chats into structured navigation.
- **One-click jump**: Click an entry to smoothly return to the exact prompt location.
- **Low-distraction workflow**: Draggable floating panel with hide/show and position memory.

## Core Features

### 1. Intelligent Navigation

- Automatically detects user prompts and builds ordered navigation entries.
- Shows reply previews for quick context scanning.
- Highlights current reading position based on viewport.
- Keeps list synced during SPA route changes and dynamic message loading.

### 2. Two Display Modes

**Normal Mode (Default)**
- Shows prompt text (2-line clamp) and reply preview (1-line clamp).
- Better for rich browsing and review.

**Minimal Mode**
- Shows compact numbered dots only.
- Expands preview on hover or keyboard focus.

**Adaptive Switching (Automatic)**
- Prevents overlap by switching mode based on panel/content geometry.
- Returns to normal mode automatically when enough space is available.
- Uses stability thresholds during resize to avoid flicker.

### 3. Interaction & Accessibility

- Right-side floating FAB with vertical drag.
- Saves and restores panel position automatically.
- Keyboard-friendly focus behavior.
- Respects `prefers-reduced-motion` for reduced animation users.
- Auto theme adaptation for ChatGPT, Gemini, and Claude.

## Interface Preview

**Normal Mode**
![Normal Mode](image1.png)

**Minimal Mode**
![Minimal Mode](image2.png)

**Interface Preview 3**
![Interface Preview 3](image3.png)

**Interface Preview 4**
![Interface Preview 4](image4.png)

**Interface Preview 5**
![Interface Preview 5](image5.png)

## Supported Sites

- `chatgpt.com`
- `gemini.google.com`
- `claude.ai`

## Acknowledgements

- The theme transition effect is inspired by [urzeye/ophel](https://github.com/urzeye/ophel).

## License

CC BY-NC-SA 4.0 (Creative Commons Attribution-NonCommercial-ShareAlike 4.0)

- ✅ Free to use, copy, modify, and distribute
- ✅ Must provide attribution
- ❌ Not for commercial use
- ✅ Derivatives must use the same license

Read more: [CC BY-NC-SA 4.0 License](https://creativecommons.org/licenses/by-nc-sa/4.0/)
