import { observer } from 'mobx-react-lite'
import { MouseEvent } from 'react'
import styled from 'styled-components'
import { ITag } from '@/entities/Project'
import { Success } from '@/shared/assets/images/icons'
import { IMapHook } from '@/shared/lib/hooks/useMapSet'

interface Props {
  tag: ITag
  changeTag: (e: MouseEvent, tag: ITag) => void
  tagMap: IMapHook<number, ITag>
}

export const TagSelect = observer(({ tag, tagMap, changeTag }: Props) => {
  return (
    <TagWrapperStyled onClick={(e) => changeTag(e, tag)}>
      <div className={'flex gap-2 items-center'}>
        <div
          className={'w-6 h-6 rounded-[8px]'}
          style={{ backgroundColor: tag.colorBg }}
        />
        <p className={'body-14-16'}>{tag.name}</p>
      </div>
      {tagMap.has(tag.id) ? (
        <Success className={'icon'} />
      ) : (
        <div className={'w-5 h-5'}></div>
      )}
    </TagWrapperStyled>
  )
})

const TagWrapperStyled = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: var(--objects);
  width: 100%;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 8px;

  &:first-child {
    border-top: none;
  }

  &:hover {
    border-color: transparent;
    background-color: var(--hover);
  }
`
