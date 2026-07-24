import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'
import instance, { axiosClassic } from '@/shared/api/interceptors'


i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ru',
    debug: false,

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },

    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  })

instance.interceptors.request.use((config) => {
  config.headers['Accept-Language'] = i18n.language
  return config
})

axiosClassic.interceptors.request.use((config) => {
  config.headers['Accept-Language'] = i18n.language
  return config
})

export default i18n