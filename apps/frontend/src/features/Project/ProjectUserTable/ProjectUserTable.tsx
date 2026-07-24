import React, { FC, useEffect } from 'react'
import { IUser } from '@/entities/User'
import { UserService } from '@/entities/User/services/user.service'

interface Props {
  users: IUser[]
  onDelete: (user: IUser) => void
  initState: (users: IUser[]) => void
}

export const ProjectUserTable: FC<Props> = ({ users, initState, onDelete }) => {
  useEffect(() => {
    initState(users)
  }, [])

  const columns = [
    {
      key: 'name',
      title: 'Имя'
    },
    {
      key: 'department',
      title: 'Подразделение'
    },
    {
      key: 'position',
      title: 'Должность'
    },
    {
      key: 'role',
      title: 'Роль'
    },
    {
      key: 'actions',
      title: 'Дополнительные действия'
    }
  ]

  const rows = users.map((m) => ({
    name: <>{UserService.getFullName(m)} </>,
    department: 'Высший класс',
    position: 'Судья',
    role: m.projectRole
  }))
  return <></>
}
