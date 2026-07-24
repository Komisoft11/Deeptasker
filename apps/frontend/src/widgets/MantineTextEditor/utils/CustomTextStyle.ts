import { TextStyle } from '@tiptap/extension-text-style'

export const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      fontSize: {
        default: '14px',
        parseHTML: (element) => element.style.fontSize || '14px',
        renderHTML: (attributes) => {
          if (!attributes.fontSize) return {}
          return { style: `font-size: ${attributes.fontSize}` }
        }
      }
    }
  }
})
