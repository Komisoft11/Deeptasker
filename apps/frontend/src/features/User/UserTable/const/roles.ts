import { Admin, Guest, User } from '@/shared/assets/images/icons/roles'
import { Clipboard } from '@/shared/assets/images/icons'
import { ProjectRole } from '@/entities/Project'
import { FC, SVGProps } from 'react'

export const roles = [
  {
    key: 'admin',
    Icon: Admin,
    description: 'admin'
  },
  {
    key: 'assigner',
    Icon: Clipboard,
    description: 'assigner'
  },
  // {
  //   key: 'controller',
  //   Icon: Controller,
  //   description: 'controller'
  // },
  {
    key: 'user',
    Icon: User,
    description: 'user'
  },
  {
    key: 'guest',
    Icon: Guest,
    description: 'guest'
  }
] satisfies {
  key: ProjectRole
  Icon: FC<SVGProps<SVGSVGElement>>,
  description: string
}[]