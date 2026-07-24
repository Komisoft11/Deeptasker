import classNames from 'classnames'
import { FC } from 'react'
import Skeleton from 'react-loading-skeleton'
import styles from './TaskItemSkeleton.module.scss'

interface Props {
  className?: string
}

const TaskItemSkeleton: FC<Props> = ({ className }) => {
  return (
    <div className={classNames(styles.container, className)}>
      <div className={'flex'}>
        <Skeleton circle width={24} height={24} className={'mr-3'} />
        <div>
          <Skeleton width={300} />
          <Skeleton width={150} />
        </div>
      </div>
      <div>
        <Skeleton width={100} />
      </div>
    </div>
  )
}

export default TaskItemSkeleton
