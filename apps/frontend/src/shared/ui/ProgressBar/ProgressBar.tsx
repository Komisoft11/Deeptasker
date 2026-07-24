import * as Progress from '@radix-ui/react-progress'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { TRANSLATION } from '@/shared/const/translation'
import './ProgressBar.scss'


export interface ProgressBarProps extends Progress.ProgressProps {
  value: number
  max: number
  showPercentage?: boolean
}

export const ProgressBar = ({
  value,
  max,
  className,
  showPercentage = false,
  ...props
}: ProgressBarProps) => {
  const { t } = useTranslation(TRANSLATION)
  const percentage = Math.min((value / max) * 100, 100)

  const transformStyle = { transform: `translateX(-${100 - percentage}%)` }

  const progressLabel = `${Math.round(percentage)}% (${t('itemsCount', {
    count: value,
    total: max
  })})`

  return (
    <div
      className={classNames({
        'flex gap-2 w-full h-max items-center': showPercentage
      })}
    >
      <Progress.Root
        className={classNames(
          'DT_ProgressRoot',
          { 'max-w-[350px] w-full': showPercentage },
          className
        )}
        {...props}
      >
        <Progress.Indicator
          className='DT_ProgressIndicator'
          style={transformStyle}
        />
      </Progress.Root>
      {showPercentage && <p className='body-12 w-max'>{progressLabel}</p>}
    </div>
  )
}
