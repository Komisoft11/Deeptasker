import debounce from 'debounce'
import { observer } from 'mobx-react-lite'
import { ChangeEvent, FC, KeyboardEvent, useState } from 'react'
import { Magnify } from '@/shared/assets/images/icons'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Input } from '@/shared/ui/Input/Input'
import styles from './TaskSearch.module.scss'

export const TaskSearch: FC = observer(() => {
  const { taskFilterStore } = useRootStore()

  const [searchQuery, setSearchQuery] = useState('')

  const handleUpdateQuery = debounce((value: string) => {
    taskFilterStore.queryTask = value
  }, 1000)

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    handleUpdateQuery(e.target.value)
  }

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUpdateQuery.flush()
    }
  }

  return (
    <Input
      placeholder={'Поиск задач'}
      className={styles.input}
      onChange={handleChangeInput}
      value={searchQuery}
      onKeyDown={handleKeyDown}
      Icon={Magnify}
    />
  )
})
