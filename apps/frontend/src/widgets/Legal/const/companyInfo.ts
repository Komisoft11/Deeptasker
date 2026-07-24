import { LegalItem } from '@/widgets/Legal/ui/LegalDocument/LegalDocument'

export const COMPANY_INFO = {
  name: 'Комисофт',
  fullName: 'ООО «Комисофт»',
  email: 'info@komisoft.com',
  emailLink: 'mailto:info@komisoft.com',
  inn: '1101169252',
  ogrn: '1201100003521',
  address:
    'Республика Коми, г Сыктывкар, Октябрьский проспект, стр. 131/5, этаж 2'
}

export const COMPANY_CONTACTS: LegalItem[] = [
  `${COMPANY_INFO.fullName}`,
  `ОГРН: ${COMPANY_INFO.ogrn}`,
  `ИНН: ${COMPANY_INFO.inn}`,
  `Юридический адрес: ${COMPANY_INFO.address}`,
  `Email: <a href=${COMPANY_INFO.emailLink} class="text-accent hover:cursor-pointer hover:opacity-70">${COMPANY_INFO.email}</a>`
]

export const EMAIL_TAG = `<a href=${COMPANY_INFO.emailLink} class="text-accent hover:cursor-pointer hover:opacity-70">${COMPANY_INFO.email}</a>`

/* eslint-disable max-len */
export const COMPANY_EMAIL = `Email: ${EMAIL_TAG}`
