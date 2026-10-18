import { en, type TranslationKey } from './en'
import { km } from './km'
import type { Language } from '../types'

export const translations = { en, km }

export function getTranslation(lang: Language, key: TranslationKey): string {
  return translations[lang]?.[key] || translations.en[key] || key
}

export type { TranslationKey }
