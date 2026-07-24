import classNames from 'classnames'
import {
  DetailedHTMLProps,
  FC,
  HTMLAttributes,
  useEffect,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_OPTIONS } from '@/features/LangSwitcher/const/language'
import styles from './LangSwitcher.module.scss'


const LANGUAGES = Object.values(LANGUAGE_OPTIONS)

interface Props
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {}

export const LangSwitcher: FC<Props> = ({ className, ...props }) => {
  const { i18n } = useTranslation()
  const [language, setLanguage] = useState<string>(i18n.language)

  useEffect(() => {
    setLanguage(i18n.language)
  }, [i18n.language])

  const handleLanguageChange = async (code: string) => {
    await i18n.changeLanguage(code)
  }

  return (
    <div className={classNames(styles.wrapper, className)} {...props}>
      {LANGUAGES.map(({ code, label }) => (
        <div
          key={code}
          onClick={() => handleLanguageChange(code)}
          className={classNames(styles.button, 'body-16', {
            [styles.selected]: language === code
          })}
        >
          {label}
        </div>
      ))}
    </div>
  )
}
