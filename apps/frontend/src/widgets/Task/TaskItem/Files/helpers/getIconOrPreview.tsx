import React, { ReactNode } from 'react'
import { File } from '@/shared/assets/images/icons'
import {
  Audio,
  Code,
  Doc,
  Html,
  Jpg,
  Pdf,
  Png,
  Ppt,
  Svg,
  Txt,
  Video,
  Xls,
  Zip
} from '@/shared/assets/images/icons/fileExtensions'

const iconMap: Record<string, ReactNode> = {
  pdf: <Pdf className={'icon w-8 h-8'} />,
  doc: <Doc className={'icon w-8 h-8'} />,
  docx: <Doc className={'icon w-8 h-8'} />,
  html: <Html className={'icon w-8 h-8'} />,
  txt: <Txt className={'icon w-8 h-8'} />,
  xls: <Xls className={'icon w-8 h-8'} />,
  xlsx: <Xls className={'icon w-8 h-8'} />,
  zip: <Zip className={'icon w-8 h-8'} />,
  ppt: <Ppt className={'icon w-8 h-8'} />,
  pptx: <Ppt className={'icon w-8 h-8'} />,
  jpg: <Jpg className={'icon w-8 h-8'} />,
  jpeg: <Jpg className={'icon w-8 h-8'} />,
  png: <Png className={'icon w-8 h-8'} />,
  svg: <Svg className={'icon w-8 h-8'} />
}

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg']
const audioExtensions = ['mp3', 'wav', 'aac', 'ogg', 'flac']
const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'mkv']
const codeExtensions = [
  'js',
  'ts',
  'jsx',
  'tsx',
  'html',
  'css',
  'py',
  'java',
  'cpp'
]

export const getIconOrPreview = (name: string, fileUrl?: string) => {
  const fileExtension = name.split('.').pop()?.toLowerCase()

  if (!fileExtension) return null

  if (imageExtensions.includes(fileExtension) && fileUrl) {
    return (
      <img
        src={fileUrl}
        alt={name}
        className={'w-8 h-8 object-cover rounded-lg'}
      />
    )
  }

  if (audioExtensions.includes(fileExtension)) {
    return <Audio className={'icon w-8 h-8'} />
  }

  if (videoExtensions.includes(fileExtension)) {
    return <Video className={'icon w-8 h-8'} />
  }

  if (codeExtensions.includes(fileExtension)) {
    return <Code className={'icon w-8 h-8'} />
  }

  return (
    <div>{iconMap[fileExtension] || <File className={'icon w-8 h-8'} />}</div>
  )
}
