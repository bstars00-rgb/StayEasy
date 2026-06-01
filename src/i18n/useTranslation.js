import { useApp } from '../context/AppContext.jsx'
import { translate, LANGUAGES } from './translations.js'

/**
 * Hook bound to the app's active language (persisted in localStorage via
 * AppContext). Returns t(key, vars), the current lang, a setter, and the
 * list of supported languages for the selector.
 */
export function useTranslation() {
  const { lang, setLang } = useApp()
  const t = (key, vars) => translate(lang, key, vars)
  return { t, lang, setLang, languages: LANGUAGES }
}

export { translate } from './translations.js'
