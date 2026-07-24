import { Node } from '@tiptap/core'
import classNames from 'classnames'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { getIconOrPreview } from '@/widgets/Task/TaskItem/Files/helpers/getIconOrPreview'
import { Trash } from '@/shared/assets/images/icons'


export const FileNode = Node.create({
  name: 'file',

  group: 'block',

  inline: false,

  addAttributes() {
    return {
      files: {
        default: []
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="file"]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { 'data-type': 'file' },
      ...(HTMLAttributes.files || []).map(
        (file: { src: string; name: string }) => [
          'a',
          {
            href: file.src,
            target: '_blank',
            rel: 'noopener noreferrer',
            style: 'display: block; margin: 4px 0;'
          },
          file.name || 'Download File'
        ]
      )
    ]
  },

  addNodeView() {
    return ({ node }) => {
      const container = document.createElement('div')
      container.style.display = 'flex'
      container.style.gap = '8px'
      container.style.padding = '8px'

      const files = node.attrs.files || []

      files.forEach((file: { src: string; name: string }) => {
        const fileContainer = document.createElement('div')
        fileContainer.style.backgroundColor = 'transparent'
        fileContainer.style.borderRadius = '8px'
        const root = createRoot(fileContainer)

        const handleDelete = () => {
          container.removeChild(fileContainer)
        }

        root.render(
          <div
            className={classNames(
              'flex gap-2 p-4 flex-col w-[184px] h-[108px] rounded-lg border border-border'
            )}
          >
            <div className={'flex justify-between w-full'}>
              {getIconOrPreview(file.name, file.src)}
              <div
                className={classNames('iconContainer h-max')}
                onClick={handleDelete}
              >
                <Trash className={'iconRed w-4 h-4'} />
              </div>
            </div>

            <p className={classNames('body-12 w-full line-clamp-2')}>
              {file.name}
            </p>
          </div>
        )
        container.appendChild(fileContainer)
      })

      return {
        dom: container
      }
    }
  }
})
