import { observer } from 'mobx-react-lite'
import { Dispatch, FC, SetStateAction } from 'react'
import useTaskFilter from '@/entities/Task/ui/TaskFilter/lib/useTaskFilter'
import styles from './TaskFilter.module.scss'


interface Props {
  setIsFiltersActive?: Dispatch<SetStateAction<boolean>>
}

export const TaskFilterContent: FC<Props> = observer(
  ({ setIsFiltersActive }) => {
    const { sortingItems, changeActiveSort } = useTaskFilter()

    return (
      <>
        {sortingItems.map((item, index) => (
          <button
            onClick={() => {
              setIsFiltersActive && setIsFiltersActive(false)
              changeActiveSort(item)
            }}
            key={index}
            className={styles.item}
          >
            {item.title}
          </button>
        ))}
      </>
    )
  }
)
