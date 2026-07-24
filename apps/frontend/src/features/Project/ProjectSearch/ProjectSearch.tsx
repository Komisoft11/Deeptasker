import debounce from 'debounce'
import React, {
  ChangeEvent,
  FC,
  KeyboardEvent,
  useCallback,
  useRef,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import { Close, Magnify } from '@/shared/assets/images/icons'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Input } from '@/shared/ui/Input/Input'

interface ProjectSearchProps {
  onClose: () => void
}

export const ProjectSearch: FC<ProjectSearchProps> = ({ onClose }) => {
  const { projectFilterStore } = useRootStore()
  const { t } = useTranslation()

  const [searchQuery, setSearchQuery] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpdateQuery = debounce((value: string) => {
    projectFilterStore.queryProject = value
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
    if (searchQuery) {
      projectFilterStore.queryProject = ''
      setSearchQuery('')
    }
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onClose()
  }, [projectFilterStore])

  return (
    <Input
      ref={inputRef}
      placeholder={t('project.search') as string}
      onChange={handleChangeInput}
      onKeyDown={handleKeyDown}
      Icon={Magnify}
      EndIcon={Close}
      onEndIconClick={clearSearch}
    />
  )
}
