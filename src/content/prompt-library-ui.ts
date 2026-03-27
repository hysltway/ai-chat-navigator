
  import { ns } from './namespace';
  import { t, tp } from '../shared/i18n';
  const uiStyle = ns.promptLibraryUiStyle || {};
  const uiRender = ns.promptLibraryUiRender || {};

  function createPromptLibraryUI() {
    const entryHost = document.createElement('span');
    entryHost.id = 'jumpnav-prompt-library-entry';
    entryHost.style.display = 'inline-flex';
    entryHost.style.alignItems = 'center';
    entryHost.style.height = '36px';
    entryHost.style.lineHeight = '0';
    entryHost.style.marginInlineStart = '8px';
    entryHost.style.verticalAlign = 'middle';
    entryHost.style.flex = '0 0 auto';

    const entryShadow = entryHost.attachShadow({ mode: 'open' });
    const entryRoot = createEntryRoot();
    entryShadow.appendChild(uiStyle.createStyleElement());
    entryShadow.appendChild(entryRoot.root);

    const panelHost = document.createElement('div');
    panelHost.id = 'jumpnav-prompt-library-panel';
    panelHost.style.position = 'fixed';
    panelHost.style.inset = '0';
    panelHost.style.zIndex = '2147483500';
    panelHost.style.pointerEvents = 'none';
    panelHost.style.display = 'block';

    const panelShadow = panelHost.attachShadow({ mode: 'open' });
    const panelRoot = createPanelRoot();
    panelShadow.appendChild(uiStyle.createStyleElement());
    panelShadow.appendChild(panelRoot.layer);
    (document.documentElement || document.body).appendChild(panelHost);

    const ui = {
      entryHost,
      panelHost,
      entryRoot: entryRoot.root,
      entryButton: entryRoot.button,
      panelRoot: panelRoot.layer,
      panel: panelRoot.panel,
      countText: panelRoot.countText,
      closeButton: panelRoot.closeButton,
      promptToggleButton: panelRoot.promptToggleButton,
      searchInput: panelRoot.searchInput,
      promptFormWrap: panelRoot.promptFormWrap,
      promptForm: panelRoot.promptForm,
      promptTitleInput: panelRoot.promptTitleInput,
      promptContentInput: panelRoot.promptContentInput,
      promptTitleHelper: panelRoot.promptTitleHelper,
      promptTitleHelperButton: panelRoot.promptTitleHelperButton,
      promptSaveButton: panelRoot.promptSaveButton,
      promptCancelButton: panelRoot.promptCancelButton,
      promptWarning: panelRoot.promptWarning,
      list: panelRoot.list
    };

    uiRender.setTheme(ui, 'generic', 'light');
    uiRender.setOpen(ui, false);
    return ui;
  }

  function createEntryRoot() {
    const root = document.createElement('div');
    root.className = 'prompt-ui prompt-entry ui-root';

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'prompt-entry-button';
    button.setAttribute('aria-label', t('prompt_library_entry_open'));

    const icon = document.createElement('span');
    icon.className = 'prompt-entry-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.appendChild(uiStyle.createSvgIcon('prompt'));

    const label = document.createElement('span');
    label.className = 'prompt-entry-label';
    label.textContent = t('prompt_library_entry_button');
    button.appendChild(icon);
    button.appendChild(label);

    root.appendChild(button);
    return { root, button };
  }

  function createPanelRoot() {
    const formSectionId = 'jumpnav-prompt-library-form';
    const layer = document.createElement('div');
    layer.className = 'prompt-ui prompt-layer ui-root';
    layer.dataset.open = '0';

    const panel = document.createElement('section');
    panel.id = 'jumpnav-prompt-library-dialog';
    panel.className = 'prompt-panel ui-panel';
    panel.dataset.formOpen = '0';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false');
    panel.setAttribute('aria-label', t('prompt_library_dialog_label'));
    panel.setAttribute('aria-hidden', 'true');

    const header = document.createElement('div');
    header.className = 'prompt-header';

    const promptToggleButton = uiStyle.createIconButton(
      'toggle-prompt-form',
      t('prompt_library_new_prompt'),
      'plus'
    );
    promptToggleButton.setAttribute('aria-controls', formSectionId);
    promptToggleButton.setAttribute('aria-expanded', 'false');

    const searchShell = document.createElement('label');
    searchShell.className = 'prompt-search-shell ui-input-shell';
    const searchIcon = document.createElement('span');
    searchIcon.className = 'prompt-search-icon ui-input-icon';
    searchIcon.setAttribute('aria-hidden', 'true');
    searchIcon.appendChild(uiStyle.createSvgIcon('search'));
    const searchInput = document.createElement('input');
    searchInput.className = 'prompt-search-input';
    searchInput.type = 'search';
    searchInput.placeholder = t('prompt_library_search_placeholder');
    searchInput.setAttribute('aria-label', t('prompt_library_search_aria'));
    searchInput.autocomplete = 'off';
    searchShell.appendChild(searchIcon);
    searchShell.appendChild(searchInput);

    const closeButton = uiStyle.createIconButton('close-panel', t('prompt_library_close'), 'close');

    header.appendChild(promptToggleButton);
    header.appendChild(searchShell);
    header.appendChild(closeButton);

    const toolbar = document.createElement('div');
    toolbar.className = 'prompt-toolbar';

    const countText = document.createElement('div');
    countText.className = 'prompt-count';
    countText.textContent = tp('prompt_library_count', 0);
    toolbar.appendChild(countText);

    const promptFormWrap = createExpandableSection();
    promptFormWrap.section.id = formSectionId;
    const promptForm = document.createElement('form');
    promptForm.className = 'prompt-form';
    promptForm.setAttribute('aria-busy', 'false');

    const promptTitleField = uiStyle.createField(t('prompt_library_title_label'));
    const promptTitleInput = document.createElement('input');
    promptTitleInput.className = 'prompt-input ui-input';
    promptTitleInput.type = 'text';
    promptTitleInput.name = 'title';
    promptTitleInput.placeholder = t('prompt_library_title_placeholder');
    promptTitleInput.autocomplete = 'off';
    promptTitleField.field.appendChild(promptTitleInput);

    const promptContentField = uiStyle.createField(t('prompt_library_content_label'));
    const promptContentInput = document.createElement('textarea');
    promptContentInput.className = 'prompt-textarea ui-textarea';
    promptContentInput.name = 'content';
    promptContentInput.placeholder = t('prompt_library_content_placeholder');
    promptContentField.field.appendChild(promptContentInput);

    const promptTitleHelper = document.createElement('div');
    promptTitleHelper.className = 'prompt-helper';
    promptTitleHelper.hidden = true;

    const promptTitleHelperText = document.createElement('span');
    promptTitleHelperText.className = 'prompt-helper-text';
    promptTitleHelperText.textContent = t('prompt_library_title_helper_text');

    const promptTitleHelperButton = document.createElement('button');
    promptTitleHelperButton.type = 'button';
    promptTitleHelperButton.className = 'prompt-helper-button';
    promptTitleHelperButton.textContent = t('prompt_library_title_helper_button');

    promptTitleHelper.appendChild(promptTitleHelperText);
    promptTitleHelper.appendChild(promptTitleHelperButton);

    const promptWarning = document.createElement('div');
    promptWarning.className = 'prompt-warning';
    promptWarning.hidden = true;
    promptWarning.setAttribute('role', 'status');
    promptWarning.setAttribute('aria-live', 'polite');
    promptWarning.setAttribute('aria-hidden', 'true');

    const promptFormActions = document.createElement('div');
    promptFormActions.className = 'prompt-form-actions';
    const promptCancelButton = uiStyle.createActionButton(t('prompt_library_cancel'), 'cancel-prompt-form');
    const promptSaveButton = uiStyle.createActionButton(t('prompt_library_save'), 'save-prompt');
    promptSaveButton.type = 'submit';
    promptSaveButton.dataset.tone = 'primary';
    promptFormActions.appendChild(promptCancelButton);
    promptFormActions.appendChild(promptSaveButton);

    promptForm.appendChild(promptTitleField.field);
    promptForm.appendChild(promptTitleHelper);
    promptForm.appendChild(promptContentField.field);
    promptForm.appendChild(promptWarning);
    promptForm.appendChild(promptFormActions);
    promptFormWrap.inner.appendChild(promptForm);

    const list = document.createElement('div');
    list.className = 'prompt-list ui-scrollable';
    list.setAttribute('role', 'list');

    panel.appendChild(header);
    panel.appendChild(toolbar);
    panel.appendChild(promptFormWrap.section);
    panel.appendChild(list);
    layer.appendChild(panel);

    return {
      layer,
      panel,
      countText,
      closeButton,
      promptToggleButton,
      searchInput,
      promptFormWrap: promptFormWrap.section,
      promptForm,
      promptTitleInput,
      promptContentInput,
      promptTitleHelper,
      promptTitleHelperButton,
      promptSaveButton,
      promptCancelButton,
      promptWarning,
      list
    };
  }

  function createExpandableSection() {
    const section = document.createElement('div');
    section.className = 'prompt-section';
    section.dataset.open = '0';
    const inner = document.createElement('div');
    inner.className = 'prompt-section-inner';
    section.appendChild(inner);
    return { section, inner };
  }

  function mountEntry(ui, target) {
    if (!ui || !ui.entryHost) {
      return false;
    }
    if (!target || !target.container) {
      detachEntry(ui);
      return false;
    }

    const container = target.container;
    const referenceNode = target.referenceNode;

    if (target.inlineRow) {
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.flexWrap = 'nowrap';
      if (target.gap) {
        container.style.gap = target.gap;
      }
      ui.entryHost.style.marginInlineStart = target.hostMarginInlineStart || '0';
    } else {
      ui.entryHost.style.marginInlineStart = '8px';
    }

    ui.entryHost.style.alignSelf = target.hostAlignSelf || 'center';
    ui.entryHost.style.height = target.hostHeight || '36px';

    if (referenceNode && referenceNode.parentElement === container) {
      if (ui.entryHost.previousSibling !== referenceNode || ui.entryHost.parentElement !== container) {
        ui.entryHost.remove();
        referenceNode.insertAdjacentElement('afterend', ui.entryHost);
      }
      return true;
    }

    if (ui.entryHost.parentElement !== container) {
      ui.entryHost.remove();
      container.appendChild(ui.entryHost);
    }
    return true;
  }

  function detachEntry(ui) {
    if (ui && ui.entryHost && ui.entryHost.parentElement) {
      ui.entryHost.remove();
    }
  }

  ns.promptLibraryUi = Object.assign({}, ns.promptLibraryUi, uiRender, {
    createPromptLibraryUI,
    mountEntry,
    detachEntry
  });
  window.ChatGptNav = ns;
