import { useQuery, useQueryClient } from '@tanstack/react-query'
import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { OnChangeValue, SingleValue } from 'react-select'
import { AutomationProject, ProjectUserTable } from '@/features/Project'
import { IAutomationProject, Project } from '@/entities/Project'
import { IUser } from '@/entities/User'
import { queries } from '@/entities/lib/api/all-queries'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { MainPageNavigator } from '@/shared/lib/navigators/main.navigator'
import { Autocomplete, IOption } from '@/shared/ui/Autocomplete'
import { Button } from '@/shared/ui/Button/Button'
import { Header } from '@/shared/ui/Header/Header'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'
import { Input } from '@/shared/ui/Input/Input'
import { Switch } from '@/shared/ui/Switch/Switch'
import styles from './ProjectTemplateCreatorPage.module.scss'


interface Form {
  name: string
  templateId: number
  memberIds?: number[]
  automations: IAutomationProject
}

export const ProjectTemplateCreatorPage = observer(() => {
  const {
    workspaceStore: { activeWorkspace },
    projectStore: { projects }
  } = useRootStore()
  const [showAdmins, setShowAdmins] = useState<boolean>(false)
  const [showAutomations, setShowAutomations] = useState<boolean>(false)
  const [templateProject, setTemplateProject] = useState<Project>()

  const navigate = useNavigate()
  const { register, setValue, getValues, handleSubmit } = useForm<Form>({
    mode: 'onChange'
  })

  useEffect(() => {
    if (!projects.length) {
      navigate(MainPageNavigator.getEmptyProjectUrl(activeWorkspace.id))
    }
  }, [projects.length])

  const { data: users, isLoading } = useQuery({
    ...queries.project.members(templateProject as Project, activeWorkspace.id),
    enabled: !!templateProject,
    staleTime: 1_000 * 60 * 5 // 5 minuets
  })

  const handleSelectProject = (
    newValue: OnChangeValue<IOption<Project>, false>
  ) => {
    if (!newValue) return
    setValue('templateId', newValue.entity.id, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    })
    setTemplateProject(newValue.entity)
  }

  const projectOptions = convertProjectsToOptions(projects)
  const selectedProjectValue = templateProject
    ? convertOptionValue(templateProject)
    : undefined

  const ql = useQueryClient()

  const handleDeleteMember = (user: IUser) => {
    if (!templateProject) return

    const updatedUsers = users?.filter((m) => m.id !== user.id) ?? []

    ql.setQueryData(
      queries.project.members(templateProject, activeWorkspace.id).queryKey,
      updatedUsers
    )

    setValue(
      'memberIds',
      updatedUsers.map((u) => u.id)
    )
  }

  const initUsersForm = (users: IUser[]) => {
    setValue(
      'memberIds',
      users.map((u) => u.id)
    )
  }

  // TODO::FINALISE QUERY
  return (
    <div>
      <Header title={'Создание проекта'} />
      <form
        className={styles.container}
        onSubmit={handleSubmit((data) => console.log(data))}
      >
        <div className={'flex'}>
          <HorizontalLayout labelText={'Название проекта'}>
            <Input
              {...register('name')}
              placeholder={'Введите название проекта'}
            />
          </HorizontalLayout>
        </div>
        <div className={'flex'}>
          <span>Какой проект использовать как шаблон</span>
          <Autocomplete
            value={selectedProjectValue}
            isClearable={false}
            options={projectOptions}
            placeholder={'Введите название проекта'}
            onChange={handleSelectProject}
          />
        </div>
        {templateProject && (
          <>
            <Switch
              label={'Люди'}
              onCheckedChange={setShowAdmins}
              checked={showAdmins}
            />
            {showAdmins && !isLoading && users && (
              <ProjectUserTable
                onDelete={handleDeleteMember}
                initState={initUsersForm}
                users={users}
              />
            )}

            <Switch
              label={'Автоматизация'}
              checked={showAutomations}
              onCheckedChange={setShowAutomations}
            />
            {showAutomations && (
              <AutomationProject
                defaultValues={getValues('automations')}
                onChange={(name, checked) =>
                  setValue(`automations.${name}`, checked)
                }
              />
            )}
          </>
        )}
        <Button styleButton={'filled'} type={'submit'}>
          Создать проект
        </Button>
      </form>
    </div>
  )
})

const convertProjectsToOptions = (projects: Project[]): IOption<Project>[] => {
  return projects.map((project) => ({
    value: project.id.toString(),
    label: project.title,
    entity: project
  }))
}

const convertOptionValue = (
  project: Project
): SingleValue<IOption<Project>> => ({
  value: project.id.toString(),
  entity: project,
  label: project.title
})
