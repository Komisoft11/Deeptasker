import { yupResolver } from '@hookform/resolvers/yup'
import React, { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { bugFormSchema } from '@/widgets/Settings/SettingsSupport/BugForm/lib/bugFormSchema'
import { Files } from '@/widgets/Settings/SettingsSupport/BugForm/ui/Files/Files'
import { LocationOption } from '@/widgets/Settings/SettingsSupport/FeedbackForm/const/options'
import {
  RadioQuestions,
  TextareaQuestion
} from '@/widgets/Settings/SettingsSupport/FeedbackForm/ui'
import { SupportService } from '@/entities/Support/services/support.service'
import { FileData } from '@/entities/TaskComment/model/types/task-comment.interface'
import { ERRORS, SUPPORT, TRANSLATION } from '@/shared/const/translation'
import { getCollectedErrors } from '@/shared/helpers/errorCollector'
import { getBugReportMeta } from '@/shared/helpers/getMeta'
import { getCollectedLogs } from '@/shared/helpers/logCollector'
import { Button } from '@/shared/ui/Button/Button'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'


export interface BugFormData {
  titleField: string
  location: string
  actual: string
  expected: string
  files: FileData[]
}

export interface BugReportPayload extends BugFormData {
  environment: ReturnType<typeof getBugReportMeta>
  consoleLogs: string[]
  errorStack: string[]
}

export const BugForm = () => {
  const { t } = useTranslation([SUPPORT, TRANSLATION, ERRORS])
  const [isOtherSelected, setIsOtherSelected] = useState(false)

  const form = useForm<BugFormData>({
    mode: 'all',
    resolver: yupResolver(bugFormSchema),
    defaultValues: {
      titleField: '',
      location: LocationOption.AUTH,
      actual: '',
      expected: '',
      files: []
    }
  })

  const handleSubmitBug = async (data: BugFormData) => {
    let uploadedFiles: FileData[] = []
    if (data.files.length > 0) {
      uploadedFiles = await Promise.all(
        (data.files || []).map(async (fileData) => {
          if (!fileData.file) return fileData

          return await uploadBugFile(fileData.file)
        })
      )
    }

    const payload: BugReportPayload = {
      ...data,
      files: uploadedFiles,
      environment: getBugReportMeta(),
      consoleLogs: getCollectedLogs(),
      errorStack: getCollectedErrors()
    }

    await SupportService.sendBugReport(payload)
      .then(() => {
        form.reset()
        setIsOtherSelected(false)
        showToast({
          title: t('bugReport.success', { ns: SUPPORT }),
          type: 'success'
        })
      })
      .catch((e) => {
        console.error(e)
        showToast({
          title: t('submitError', { ns: ERRORS }),
          type: 'error'
        })
      })
  }

  const uploadBugFile = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return await SupportService.uploadBugFile(formData)
  }

  const isButtonDisabled =
    form.formState.isSubmitting || !form.formState.isValid

  return (
    <div className={'flex flex-col gap-4 px-1'}>
      <p className={'secondaryText body-14-16'}>
        {t('bugReport.description', { ns: SUPPORT })}
      </p>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmitBug)}>
          <TextareaQuestion name={'titleField'} isBugReport maxLength={100} />

          <RadioQuestions
            options={LocationOption}
            name={'location'}
            isBugReport
            className={'flex-col'}
            isOtherSelected={isOtherSelected}
            setIsOtherSelected={setIsOtherSelected}
          />
          <TextareaQuestion name={'expected'} isBugReport />

          <TextareaQuestion name={'actual'} isBugReport />
          <Files />

          <div className={'flex justify-center items-center w-full pt-4'}>
            <Button
              type={'submit'}
              styleButton={'filled'}
              colorButton={'accent'}
              className={'body-14-20 px-3'}
              disabled={isButtonDisabled}
            >
              {form.formState.isSubmitting
                ? t('submitting', { ns: TRANSLATION })
                : t('bugReport.submit', { ns: SUPPORT })}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
