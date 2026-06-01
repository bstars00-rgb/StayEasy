// Compatibility shim. The canonical dictionary now lives in translations.js
// and the React hook in useTranslation.js. Re-exported here so older imports
// of `../i18n` keep resolving.
export { translations, LANGUAGES, DEFAULT_LANG, translate } from './translations.js'
export { useTranslation } from './useTranslation.js'
