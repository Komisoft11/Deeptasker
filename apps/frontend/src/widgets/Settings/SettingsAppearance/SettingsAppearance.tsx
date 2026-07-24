import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { LangSwitcher } from '@/features/LangSwitcher/LangSwitcher'
import { ShowIdSwitcher } from '@/features/ShowIdSwitcher/ShowIdSwitcher'
import { ThemeType } from '@/entities/lib/stores/theme-mode.store'
import DarkTheme from '@/shared/assets/images/theme/dark.jpg'
import LightTheme from '@/shared/assets/images/theme/light.jpg'
import { ENTITY } from '@/shared/const/translation'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Header } from '@/shared/ui/Header/Header'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'


export const SettingsAppearance = observer(() => {
  const { themeModeStore } = useRootStore()
  const { t } = useTranslation([ENTITY])

  const changeTheme = (changedMode: 'light' | 'dark') => {
    const mode = changedMode === 'dark' ? ThemeType.dark : ThemeType.light
    themeModeStore.mode = mode
    LocalStorageHelper.setThemeMode(mode)
  }
  return (
    <div className={'flex flex-col h-full'}>
      <Header title={t('appearance.title')} />
      <div className={'flex flex-col '}>
        <HorizontalLayout
          labelText={t('appearance.theme')}
          isSettingsPage
          labelDescription={t('appearance.selectTheme') as string}
          className={'w-[480px] max-w-[480px]'}
          containerClassName={'justify-normal px-6'}
        >
          <div className={'flex gap-4'}>
            <div className={'flex flex-col gap-2'}>
              <div
                className={classNames(
                  'rounded-xl border  w-[213px] h-[150px] overflow-hidden cursor-pointer',
                  themeModeStore.mode === 'light'
                    ? 'border-accent'
                    : 'border-border'
                )}
                onClick={() => changeTheme('light')}
              >
                <img
                  src={LightTheme}
                  className={'h-full w-full'}
                  alt={'Dark theme layout.'}
                />
              </div>
              <h4>{t('appearance.light')}</h4>
            </div>
            <div className={'flex flex-col gap-2'}>
              <div
                className={classNames(
                  'rounded-xl border w-[213px] h-[150px] overflow-hidden cursor-pointer',
                  themeModeStore.mode === 'dark'
                    ? 'border-accent'
                    : 'border-border'
                )}
                onClick={() => changeTheme('dark')}
              >
                <img
                  className={'h-full w-full'}
                  src={DarkTheme}
                  alt={'Dark theme layout.'}
                />
              </div>
              <h4>{t('appearance.dark')}</h4>
            </div>
          </div>
        </HorizontalLayout>
        <HorizontalLayout
          labelText={t('appearance.language')}
          isSettingsPage
          labelDescription={t('appearance.selectLanguage') as string}
          className={'w-[480px] max-w-[480px]'}
          containerClassName={'justify-normal px-6'}
        >
          <LangSwitcher />
        </HorizontalLayout>
        <HorizontalLayout
          labelText={t('appearance.taskId')}
          isSettingsPage
          labelDescription={t('appearance.taskIdDescription') as string}
          className={'w-[480px] max-w-[480px]'}
          containerClassName={'justify-normal items-center px-6'}
        >
          <ShowIdSwitcher />
        </HorizontalLayout>
      </div>
    </div>
  )
})
