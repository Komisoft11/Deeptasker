import { BulletList } from '@tiptap/extension-bullet-list'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { Heading } from '@tiptap/extension-heading'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { OrderedList } from '@tiptap/extension-ordered-list'
import SubScript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { Dropcursor } from '@tiptap/extensions'
import StarterKit from '@tiptap/starter-kit'
import { all, createLowlight } from 'lowlight'
import { FileNode } from '@/widgets/MantineTextEditor/nodes'
import { CustomTextStyle } from '@/widgets/MantineTextEditor/utils/CustomTextStyle'
import { ResizableImage } from '@/widgets/MantineTextEditor/utils/ResizableImage'

const lowlight = createLowlight(all)

export const extensions = [
  StarterKit,
  Highlight,
  SubScript,
  Superscript,
  Underline,
  Heading.configure({ levels: [1, 2, 3, 4] }),
  BulletList,
  OrderedList,
  CustomTextStyle,
  Image.configure({
    allowBase64: true,
    inline: true
  }),
  ResizableImage,
  Dropcursor,
  CodeBlockLowlight.configure({
    lowlight
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph']
  }),
  FileNode,
  Link.configure({
    openOnClick: true,
    autolink: true,
    defaultProtocol: 'https',
    protocols: ['http', 'https'],
    isAllowedUri: (url, ctx) => {
      try {
        const parsedUrl = url.includes(':')
          ? new URL(url)
          : new URL(`${ctx.defaultProtocol}://${url}`)

        if (!ctx.defaultValidate(parsedUrl.href)) {
          return false
        }

        const disallowedProtocols = ['ftp', 'file', 'mailto', 'javascript']
        const protocol = parsedUrl.protocol.replace(':', '')

        return !disallowedProtocols.includes(protocol)
      } catch {
        return false
      }
    }
  })
]