import { mergeAttributes, NodeViewRendererProps } from '@tiptap/core'
import Image from '@tiptap/extension-image'

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: '',
        parseHTML: (element) => element.getAttribute('style') || '',
        renderHTML: (attributes) => {
          return {
            style: attributes.style
          }
        }
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]'
      }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ({ node, getPos, editor }: NodeViewRendererProps) => {
      const imgElement = document.createElement('img')
      imgElement.src = node.attrs.src
      imgElement.style.maxWidth = '800px'
      imgElement.style.minWidth = '100px'
      imgElement.style.border = '2px solid transparent'
      imgElement.style.cursor = 'ew-resize'

      if (node.attrs.style) {
        imgElement.style.cssText = node.attrs.style
      }

      let isSelected = false

      imgElement.addEventListener('click', (e) => {
        e.stopPropagation()
        if (!isSelected) {
          imgElement.style.border = '2px solid var(--accent)'
          isSelected = true
        }
      })

      const onClickOutside = (e: MouseEvent) => {
        if (!imgElement.contains(e.target as Node)) {
          imgElement.style.border = '2px solid transparent'
          isSelected = false
        }
      }

      document.addEventListener('click', onClickOutside)

      imgElement.addEventListener('remove', () => {
        document.removeEventListener('click', onClickOutside)
      })

      imgElement.addEventListener('mousedown', (e) => {
        e.preventDefault()

        const initialWidth = imgElement.offsetWidth
        const initialX = e.clientX

        const onMouseMove = (e: MouseEvent) => {
          let newWidth = initialWidth + (e.clientX - initialX)
          newWidth = Math.min(newWidth, 800)
          imgElement.style.width = `${newWidth}px`
        }

        const onMouseUp = () => {
          document.removeEventListener('mousemove', onMouseMove)
          document.removeEventListener('mouseup', onMouseUp)

          const style = imgElement.getAttribute('style') || ''

          if (typeof getPos === 'function') {
            const pos = getPos()
            const transaction = editor.state.tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              style
            })
            editor.view.dispatch(transaction)
          }
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      })

      return {
        dom: imgElement
      }
    }
  }
})