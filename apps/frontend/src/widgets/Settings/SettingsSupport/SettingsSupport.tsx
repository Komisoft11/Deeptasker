import React, { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BugForm } from '@/widgets/Settings/SettingsSupport/BugForm/BugForm'
import { FeedbackForm } from '@/widgets/Settings/SettingsSupport/FeedbackForm/FeedbackForm'
import { LabelCounter } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/LabelCounter/LabelCounter'
import { ENTITY, SUPPORT } from '@/shared/const/translation'
import { Header } from '@/shared/ui/Header/Header'
import { Tabs } from '@/shared/ui/Tabs/Tabs'


interface Tab {
  value: string
  label: string
  component: ReactNode
}

export const SettingsSupport = () => {
  const { t } = useTranslation([ENTITY, SUPPORT])
  const initialTab = 'feedback'
  const [activeTab, setActiveTab] = useState(initialTab)

  const tabData: Tab[] = [
    {
      value: 'feedback',
      label: t('feedback.title', { ns: SUPPORT }),
      component: <FeedbackForm />
    },
    {
      value: 'bug',
      label: t('bugReport.title', { ns: SUPPORT }),
      component: <BugForm />
    }
  ]

  const handleTabChange = (val: string) => {
    setActiveTab(val)
  }

  return (
    <div className={'flex flex-col h-full'}>
      <Header
        className={'shrink-0'}
        title={t('settings.support', { ns: ENTITY })}
      />
      <div
        className={
          'flex flex-col gap-6 p-4 flex-1 overflow-y-auto scrollbarContainerOnBg'
        }
      >
        <Tabs
          defaultValue={activeTab}
          className={'flex flex-col gap-4 grow shrink-0 basis-0'}
          onValueChange={handleTabChange}
        >
          <div className={'flex w-full justify-between items-center flex-wrap'}>
            <Tabs.List className={'py-1'}>
              {tabData.map(({ value, label }) => (
                <Tabs.Trigger key={value} value={value}>
                  <LabelCounter label={label} />
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </div>

          {tabData.map(({ value, component }) => (
            <Tabs.Content key={value} value={value}>
              {component}
            </Tabs.Content>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
