export const UI_KIT_STYLE_TEXT = `
      :host {
        box-sizing: border-box;
        font: inherit;
        color: inherit;
      }

      .ui-root,
      .ui-root * {
        box-sizing: border-box;
      }

      .ui-root {
        color: var(--ui-text, #1f1f1f);
        font-family: var(--ui-font-family, "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif);
        letter-spacing: normal;
        font-kerning: normal;
        text-rendering: optimizeLegibility;
      }

      .ui-panel {
        border: 1px solid var(--ui-panel-border, #efefef);
        border-radius: var(--ui-radius-lg, 16px);
        background: var(--ui-panel-bg, #f9f9f9);
        box-shadow: var(--ui-panel-shadow, 0 18px 42px rgba(23, 21, 16, 0.16));
        color: var(--ui-text, #1f1f1f);
      }

      .ui-button,
      .ui-icon-button {
        appearance: none;
        border: 1px solid var(--ui-control-border, #efefef);
        background: var(--ui-control-bg, #f9f9f9);
        color: var(--ui-muted, #666666);
        cursor: pointer;
        transition:
          background-color 180ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
          border-color 180ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
          color 180ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
          transform 140ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
          box-shadow 220ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
          opacity 140ms ease;
        -webkit-tap-highlight-color: transparent;
      }

      .ui-button:hover,
      .ui-icon-button:hover {
        background: var(--ui-control-hover-bg, #efefef);
        border-color: var(--ui-control-hover-border, #efefef);
        color: var(--ui-control-hover-text, var(--ui-text, #1f1f1f));
        box-shadow: 0 8px 18px color-mix(in srgb, var(--ui-surface-shadow, rgba(0, 0, 0, 0.06)) 85%, transparent);
        transform: translate3d(0, -1px, 0);
      }

      .ui-button:active,
      .ui-icon-button:active {
        transform: translate3d(0, 0, 0) scale(0.97);
        box-shadow: none;
      }

      .ui-button:focus-visible,
      .ui-icon-button:focus-visible,
      .ui-item:focus-visible,
      .ui-item-main:focus-visible,
      .ui-input-shell:focus-within,
      .ui-input:focus-visible,
      .ui-textarea:focus-visible,
      .ui-select:focus-visible {
        outline: 2px solid var(--ui-focus-outline, #1f1f1f);
        outline-offset: 2px;
      }

      .ui-button[data-active="1"],
      .ui-icon-button[data-active="1"],
      .ui-button[data-active="1"]:hover,
      .ui-icon-button[data-active="1"]:hover {
        background: var(--ui-control-active-bg, #eaeaea);
        border-color: var(--ui-control-active-border, #eaeaea);
        color: var(--ui-control-active-text, var(--ui-text, #1f1f1f));
        box-shadow: none;
        transform: translate3d(0, 0, 0);
      }

      .ui-button[data-tone="primary"],
      .ui-icon-button[data-tone="primary"] {
        background: var(--ui-primary-bg, #eaeaea);
        border-color: var(--ui-primary-border, #eaeaea);
        color: var(--ui-primary-text, var(--ui-text, #1f1f1f));
      }

      .ui-button[data-tone="primary"]:hover,
      .ui-icon-button[data-tone="primary"]:hover {
        background: color-mix(in srgb, var(--ui-primary-bg, #eaeaea) 88%, var(--ui-panel-bg, #f9f9f9));
        border-color: var(--ui-primary-border, #eaeaea);
        color: var(--ui-primary-text, var(--ui-text, #1f1f1f));
      }

      .ui-button[data-tone="danger"],
      .ui-icon-button[data-tone="danger"] {
        color: var(--ui-danger, #b42318);
      }

      .ui-button[data-tone="danger"]:hover,
      .ui-icon-button[data-tone="danger"]:hover {
        background: var(--ui-danger-soft, rgba(180, 35, 24, 0.08));
        border-color: color-mix(in srgb, var(--ui-danger, #b42318) 22%, transparent);
        color: var(--ui-danger, #b42318);
      }

      .ui-button[disabled],
      .ui-icon-button[disabled],
      .ui-input[disabled],
      .ui-textarea[disabled],
      .ui-select[disabled] {
        opacity: 0.56;
        cursor: not-allowed;
        pointer-events: none;
      }

      .ui-button {
        min-height: 34px;
        padding: 0 12px;
        border-radius: var(--ui-radius-sm, 10px);
        font: inherit;
        font-size: 12.5px;
        font-weight: 500;
        line-height: 1.25;
        letter-spacing: 0.01em;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .ui-button-label {
        display: inline-flex;
        align-items: center;
      }

      .ui-icon-button {
        width: 34px;
        height: 34px;
        padding: 0;
        border-radius: 999px;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 auto;
      }

      .ui-button svg,
      .ui-icon-button svg,
      .ui-input-icon svg {
        width: 16px;
        height: 16px;
      }

      .ui-icon-button[data-busy="1"] svg {
        opacity: 0;
      }

      .ui-icon-button[data-busy="1"]::after {
        content: '';
        position: absolute;
        inset: 9px;
        border-radius: 999px;
        border: 1.5px solid currentColor;
        border-right-color: transparent;
        animation: ui-kit-spin 720ms linear infinite;
      }

      .ui-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 28px;
        padding: 5px 10px;
        border: 1px solid var(--ui-pill-border, var(--ui-panel-border, #efefef));
        border-radius: 999px;
        background: var(--ui-pill-bg, var(--ui-control-bg, #f9f9f9));
        color: var(--ui-pill-text, var(--ui-muted, #666666));
        font-size: 12px;
        line-height: 1;
      }

      .ui-field {
        display: grid;
        gap: 6px;
        min-width: 0;
      }

      .ui-label {
        font-size: 12px;
        font-weight: 500;
        line-height: 1.4;
        letter-spacing: 0.01em;
        color: var(--ui-muted, #666666);
      }

      .ui-input-shell {
        min-width: 0;
        min-height: 36px;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
        gap: 8px;
        padding: 0 12px;
        border: 1px solid var(--ui-control-border, #efefef);
        border-radius: var(--ui-radius-md, 12px);
        background: var(--ui-control-bg, #f9f9f9);
        transition:
          border-color 180ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
          box-shadow 220ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
          background-color 180ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
          color 180ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1));
      }

      .ui-input-shell:hover,
      .ui-input-shell:focus-within {
        background: var(--ui-control-hover-bg, #efefef);
        border-color: var(--ui-control-hover-border, #efefef);
      }

      .ui-input-shell:focus-within {
        box-shadow: 0 0 0 3px var(--ui-focus-ring, rgba(31, 31, 31, 0.08));
      }

      .ui-input-icon {
        width: 16px;
        height: 16px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--ui-muted, #666666);
        flex: 0 0 auto;
      }

      .ui-input,
      .ui-textarea,
      .ui-select {
        width: 100%;
        border: 1px solid var(--ui-control-border, #efefef);
        border-radius: var(--ui-radius-md, 12px);
        background: var(--ui-control-bg, #f9f9f9);
        color: var(--ui-text, #1f1f1f);
        font: inherit;
        font-size: 13px;
        line-height: 1.6;
        transition:
          border-color 180ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
          box-shadow 220ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
          background-color 180ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1));
      }

      .ui-input:hover,
      .ui-textarea:hover,
      .ui-select:hover,
      .ui-input:focus,
      .ui-textarea:focus,
      .ui-select:focus {
        background: var(--ui-control-hover-bg, #efefef);
        border-color: var(--ui-control-hover-border, #efefef);
      }

      .ui-input:focus,
      .ui-textarea:focus,
      .ui-select:focus {
        outline: none;
        box-shadow: 0 0 0 3px var(--ui-focus-ring, rgba(31, 31, 31, 0.08));
      }

      .ui-input {
        min-height: 36px;
        padding: 0 12px;
      }

      .ui-textarea {
        min-height: 120px;
        padding: 12px;
        resize: vertical;
      }

      .ui-input::placeholder,
      .ui-textarea::placeholder {
        color: color-mix(in srgb, var(--ui-muted, #666666) 82%, transparent);
      }

      .ui-scrollable {
        scrollbar-width: thin;
        scrollbar-color: var(--ui-scrollbar-thumb, rgba(31, 31, 31, 0.16)) var(--ui-scrollbar-track, transparent);
      }

      .ui-scrollable::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      .ui-scrollable::-webkit-scrollbar-track {
        background: var(--ui-scrollbar-track, transparent);
      }

      .ui-scrollable::-webkit-scrollbar-thumb {
        border-radius: 999px;
        border: 2px solid transparent;
        background-clip: padding-box;
        background: var(--ui-scrollbar-thumb, rgba(31, 31, 31, 0.16));
      }

      .ui-scrollable:hover::-webkit-scrollbar-thumb {
        background: var(--ui-scrollbar-thumb-hover, rgba(31, 31, 31, 0.24));
      }

      .ui-item {
        position: relative;
        display: block;
        padding: 14px;
        border: 1px solid transparent;
        border-radius: var(--ui-radius-md, 12px);
        background: var(--ui-surface, #f4f4f4);
        transition:
          background-color 180ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
          border-color 180ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
          box-shadow 220ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1)),
          transform 180ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1));
        min-width: 0;
      }

      .ui-item:hover,
      .ui-item:focus-within {
        background: var(--ui-surface-hover, #efefef);
        border-color: var(--ui-surface-hover-border, #efefef);
        box-shadow: 0 10px 22px var(--ui-surface-shadow, rgba(0, 0, 0, 0.06));
        transform: translate3d(0, -2px, 0);
      }

      .ui-item:active {
        transform: translate3d(0, 0, 0) scale(0.985);
      }

      .ui-item-main {
        appearance: none;
        border: none;
        background: transparent;
        color: inherit;
        padding: 0;
        margin: 0;
        display: grid;
        align-content: start;
        gap: 8px;
        min-width: 0;
        text-align: left;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: transform 140ms var(--ui-ease-out-quart, cubic-bezier(0.25, 1, 0.5, 1));
        width: 100%;
      }

      .ui-item-main:active {
        transform: translate3d(0, 0, 0) scale(0.985);
      }

      .ui-item-title {
        margin: 0;
        min-width: 0;
        font-size: 13px;
        line-height: 1.35;
        font-weight: 600;
        color: var(--ui-accent-strong, var(--ui-text, #1f1f1f));
      }

      .ui-item-preview {
        margin: 0;
        font-size: 12px;
        line-height: 1.45;
        color: var(--ui-muted, #666666);
      }

      .ui-empty {
        display: grid;
        gap: 6px;
      }

      .ui-empty-title {
        font-size: 13px;
        line-height: 1.4;
        font-weight: 600;
        color: var(--ui-accent-strong, var(--ui-text, #1f1f1f));
      }

      .ui-empty-text {
        width: 100%;
        min-width: 0;
        font-size: 12px;
        line-height: 1.45;
        color: var(--ui-muted, #666666);
        white-space: normal;
        word-break: normal;
        overflow-wrap: break-word;
      }

      @keyframes ui-kit-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .ui-panel,
        .ui-button,
        .ui-icon-button,
        .ui-input-shell,
        .ui-input,
        .ui-textarea,
        .ui-select,
        .ui-item,
        .ui-item-main,
        .ui-empty {
          transition: none !important;
          animation: none !important;
        }

        .ui-icon-button[data-busy="1"]::after {
          animation: none !important;
          border-right-color: currentColor;
        }
      }
    `;
