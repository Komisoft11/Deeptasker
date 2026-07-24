import debounce from 'debounce'
import React, {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { Close, Magnify } from '@/shared/assets/images/icons'
import { RouterParams } from '@/shared/config/route.config'
import { TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Input } from '@/shared/ui/Input/Input'
import styles from './Search.module.scss'


export const SearchInput = () => {
  const { taskFilterStore, folderFilterStore } = useRootStore()

  const { folderId, taskId } = useParams<RouterParams>()

  const { t } = useTranslation(TRANSLATION)

  const inputRef = useRef<HTMLInputElement>(null)

  const [searchQuery, setSearchQuery] = useState('')

  const handleUpdateQuery = debounce((value: string) => {
    taskFilterStore.queryTask = value
    folderFilterStore.queryFolder = value
  }, 1000)

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    handleUpdateQuery(e.target.value)
  }

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      clearSearch()
    }
  }

  const clearSearch = useCallback(() => {
    taskFilterStore.queryTask = ''
    folderFilterStore.queryFolder = ''
    setSearchQuery('')
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.blur()
    }
  }, [taskFilterStore, folderFilterStore])

  useEffect(() => {
    clearSearch()
  }, [folderId, taskId])

  return (
    <Input
      ref={inputRef}
      placeholder={t('search') as string}
      className={styles.input}
      onChange={handleChangeInput}
      onKeyDown={handleKeyDown}
      Icon={Magnify}
      EndIcon={searchQuery.length ? Close : undefined}
      onEndIconClick={clearSearch}
      defaultValue={taskFilterStore.queryTask}
    />
  )
}
