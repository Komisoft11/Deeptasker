import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { LegalNavigator } from '@/shared/lib/navigators/legal.navigator'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'


export const LegalDocsLink = () => {
  const { t } = useTranslation([ENTITY, TRANSLATION])
  return (
    <HorizontalLayout
      isSettingsPage
      labelText={t('legal.title', { ns: ENTITY })}
      className={'max-w-[480px] w-full'}
      containerClassName={'items-center'}
      labelDescription={t('legal.description', { ns: ENTITY }) as string}
    >
      <div className={'w-full'}>
        <Link
          to={LegalNavigator.getLegalTab({})}
          className={
            'bg-hover justify-center ' +
            'border-border ' +
            'hover:opacity-70 hover:cursor-pointer max-w-[120px] w-full ' +
            'body-14-16 py-3 h-max rounded-lg flex'
          }
        >
          {t('view', { ns: TRANSLATION })}
        </Link>
      </div>
    </HorizontalLayout>
  )
}
