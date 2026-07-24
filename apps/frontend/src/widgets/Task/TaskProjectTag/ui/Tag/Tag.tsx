import { ITag } from '@/entities/Project'
import { Close } from '@/shared/assets/images/icons'

interface Props {
  tag: ITag
  handleDeleteTag: (tag: ITag) => void
  disable?: boolean
}

export const Tag = ({ tag, handleDeleteTag, disable }: Props) => {
  return (
    <div
      className='p-2 rounded-lg flex items-center gap-1 text-activeText'
      style={{ backgroundColor: tag.colorBg }}
      data-ignore-click
    >
      <p className={'body-14-16'}>{tag.name}</p>

      {!disable && (
        <Close
          className={
            'iconActive w-4 h-4 cursor-pointer hover:opacity-70 transition-opacity'
          }
          onClick={() => handleDeleteTag(tag)}
        />
      )}
    </div>
  )
}
