import { FC } from 'react'
import { SortAsc, SortDesc } from '@/shared/assets/images/icons'

interface Props {
  isSortDes: boolean
  setIsSortDes: (isSortDes: boolean) => void
}

export const CommentSorting: FC<Props> = ({ isSortDes, setIsSortDes }) => {
  const handleSortToggle = () => {
    setIsSortDes(!isSortDes)
  }

  return (
    <div
      className={
        'flex items-center p-2 rounded-lg hover:bg-hover hover:cursor-pointer'
      }
      style={{
        backgroundColor: !isSortDes ? 'var(--hover)' : undefined
      }}
      onClick={handleSortToggle}
    >
      <div className={'p-1'}>
        {!isSortDes ? (
          <SortAsc className={'icon w-4 h-4'} />
        ) : (
          <SortDesc className={'icon w-4 h-4'} />
        )}
      </div>
      <p className={'body-12'}>
        {isSortDes ? 'Сначала новые' : 'Сначала старые'}
      </p>
    </div>
  )
}
