import type { en } from '~/i18n/locales/en'
export {}

declare global {
    type AnyObject = { [ key: string]: unknown }
    type ULocaleKey = NesedKey<typeof en>
    type i18nLocale = 'en' | 'ru'
}