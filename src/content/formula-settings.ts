import { ns } from './namespace';
import { createFormulaSettingsApi } from '../shared/formula-settings';

const formulaSettingsApi = createFormulaSettingsApi({
  storageApi: ns.storage ?? null
});

ns.formulaSettings = Object.assign({}, ns.formulaSettings, formulaSettingsApi, {
  createFormulaSettingsApi
});
window.ChatGptNav = ns;
