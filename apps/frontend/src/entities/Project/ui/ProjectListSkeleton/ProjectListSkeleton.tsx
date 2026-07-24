import classNames from 'classnames'
import React, { FC } from 'react'
import Skeleton from 'react-loading-skeleton'
import styles from './ProjectItemSkeleton.module.scss'

interface Props {
  className?: string
}

export const ProjectListSkeleton: FC<Props> = ({ className }) => {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <div className={classNames(styles.container, className)} key={index}>
          <Skeleton circle width={24} height={24} className={'mr-3'} />
          <Skeleton width={150} />
        </div>
      ))}
    </>
  )
}
