import { FC } from 'react'
import { Cards, List } from '@/shared/assets/images/icons'
import { Button } from '@/shared/ui/Button/Button'

interface Props {
  filesView: 'list' | 'cards'
  setFilesView: (filesView: 'list' | 'cards') => void
}

export const FileView: FC<Props> = ({ filesView, setFilesView }) => {
  const handleViewChange = (view: 'list' | 'cards') => {
    setFilesView(view)
  }

  const isActive = (view: 'list' | 'cards') => filesView === view

  const views: ('list' | 'cards')[] = ['list', 'cards']

  return (
    <div className='flex gap-2 items-center'>
      {/*<Button styleButton='outline' className='py-2 px-3 h-10'>*/}
      {/*  <p className='body-14-16'>Скачать все</p>*/}
      {/*</Button>*/}
      <div className='bg-objects rounded-lg flex'>
        {views.map((view) => (
          <Button
            key={view}
            styleButton='filled'
            colorButton={isActive(view) ? 'accent' : 'dark'}
            className='p-2'
            onClick={() => handleViewChange(view)}
          >
            {view === 'list' ? (
              <List className={isActive(view) ? undefined : 'icon'} />
            ) : (
              <Cards className={isActive(view) ? undefined : 'icon'} />
            )}
          </Button>
        ))}
      </div>
    </div>
  )
}
