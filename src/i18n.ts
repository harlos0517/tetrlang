
import { Locale } from 'discord.js'
import { readFileSync } from 'fs'
import YAML from 'yaml'

export const LANGUAGE = Locale

export const LANGUAGES = [
  Locale.EnglishUS,
  Locale.ChineseTW,
  Locale.Japanese,
  Locale.Korean,
] as const

const FALLBACK_LANGUAGE = Locale.EnglishUS

const dictionary = Object.fromEntries(
  LANGUAGES.map(lang => {
    const filePath = `./src/i18n/${lang}.yml`
    const fileContent = readFileSync(filePath, 'utf8')
    return [lang, YAML.parse(fileContent)]
  }),
) as Record<Locale, Record<string, string>>

export const t = (
  key: string,
  lang: Locale = FALLBACK_LANGUAGE,
  ...vars: (string | number)[]
): string => {
  const dict = dictionary[lang] || dictionary[FALLBACK_LANGUAGE]
  const raw = dict?.[key] || key

  const translation = raw.replace(/\$\d+/g, token => {
    const idx = parseInt(token, 10) - 1
    return idx >= 0 && idx < vars.length ? String(vars[idx]) : ''
  })

  return translation
}

export const tMap = (
  key: string,
  ...vars: (string | number)[]
): Record<Locale, string> => {
  const map = Object.fromEntries(
    LANGUAGES.map(lang => [lang, t(key, lang, ...vars)]),
  ) as Record<Locale, string>
  return map
}
