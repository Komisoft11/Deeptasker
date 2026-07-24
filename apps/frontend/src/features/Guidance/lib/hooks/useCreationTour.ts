import { driver } from 'driver.js'
import { useTranslation } from 'react-i18next'
import { createPopoverStep, FIRST_CREATION_STEP, SECOND_CREATION_STEP, THIRD_CREATION_STEP } from '@/entities/Guidance'
import { GUIDANCE, TRANSLATION } from '@/shared/const/translation'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'

type IReturn = () => () => void

export const useCreationTour = (): IReturn => {
  const { t, ready } = useTranslation([GUIDANCE, TRANSLATION])

  return () => {
    if (!ready) return () => {}

    const steps = [
      createPopoverStep(
        FIRST_CREATION_STEP,
        t('creation.project.title', { ns: GUIDANCE }),
        t('creation.project.description', { ns: GUIDANCE }),
        'bottom',
        'start'
      ),
      createPopoverStep(
        SECOND_CREATION_STEP,
        t('creation.task.title', { ns: GUIDANCE }),
        t('creation.task.description', { ns: GUIDANCE })
      ),
      createPopoverStep(
        THIRD_CREATION_STEP,
        t('creation.folder.title', { ns: GUIDANCE }),
        t('creation.folder.description', { ns: GUIDANCE })
      )
    ]

    const d = driver({
      showProgress: true,
      progressText: '',
      steps,
      nextBtnText: t('next', { ns: TRANSLATION }) as string,
      prevBtnText: t('back', { ns: TRANSLATION }) as string,
      doneBtnText: t('complete', { ns: TRANSLATION }) as string,
      onPopoverRender: (popover, opts) => {
        const currentStep = (opts.state.activeIndex ?? 0) + 1
        const totalSteps = steps.length

        popover.progress.textContent = `${currentStep}/${totalSteps}`
      },
      allowClose: true,
      onDestroyed: () => {
        LocalStorageHelper.setGuidanceVisible(false)
      }
    })

    if (LocalStorageHelper.getGuidanceVisible()) {
      d.drive()

      return () => d.destroy()
    }

    return () => {}
  }
}