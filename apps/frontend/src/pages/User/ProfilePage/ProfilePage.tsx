import { yupResolver } from '@hookform/resolvers/yup'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { About, Dob, PersonalInfo, Sex } from '@/features/User/Profile'
import { UserMainInfo } from '@/features/User/UserMainInfo/UserMainInfo'
import { useUsers } from '@/entities/User'
import { profilePageSchema } from '@/entities/User/lib/profileSchema'
import { IUpdateUserProfileDTO } from '@/entities/User/model/types/user.interface'
import { Exit } from '@/shared/assets/images/icons'
import { AUTH_URL } from '@/shared/config/route.config'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { formatDateWithoutTime } from '@/shared/helpers/dates/formatDateWithoutTime'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { FooterButton } from '@/shared/ui/FooterButton/FooterButton'
import { Header } from '@/shared/ui/Header/Header'
import styles from './ProfilePage.module.scss'


type FormData = IUpdateUserProfileDTO

export const ProfilePage = observer(() => {
  const { authStore, webSocketStore } = useRootStore()
  const rootStore = useRootStore()
  const navigate = useNavigate()
  const { user } = authStore

  const { t } = useTranslation([ENTITY, TRANSLATION])

  const { updateInformationAsync } = useUsers()

  const initialValues = {
    lastName: user.lastName,
    firstName: user.firstName,
    middleName: user.middleName,
    dob: user.dob,
    sex: user.sex ?? '',
    description: user.description ?? ''
  }

  const {
    register,
    handleSubmit,
    formState: { dirtyFields, isDirty, isValid },
    resetField,
    reset,
    control
  } = useForm<FormData>({
    defaultValues: initialValues,
    resolver: yupResolver(profilePageSchema),
    mode: 'all'
  })

  const onSubmit = async (data: FormData) => {
    const updatedInfo: Partial<FormData> = Object.entries(data).reduce(
      (acc, [key, value]) => {
        if (dirtyFields[key as keyof FormData]) {
          acc[key as keyof FormData] =
            value === '' || value === undefined ? null : value
        }

        return acc
      },
      {} as Partial<FormData>
    )

    if (updatedInfo.dob) {
      updatedInfo.dob = new Date(formatDateWithoutTime(updatedInfo.dob))
    }

    await updateInformationAsync.mutateAsync(updatedInfo)
    reset(data)
  }

  const logout = async () => {
    await authStore.logout()
    webSocketStore.disconnect()
    rootStore.destructor()
    navigate(AUTH_URL)
  }

  return (
    <div className={'relative h-full'}>
      <Header title={t('user.userProfile')} />
      <div
        className={classNames(
          styles.content,
          isDirty && 'pb-[81px]',
          'scrollbarContainerOnBg'
        )}
      >
        <div className={'flex w-full justify-between'}>
          <UserMainInfo user={user} isForChange />
          <Button
            styleButton={'outline'}
            colorButton={'red'}
            className={'h-max px-4 body-14-20'}
            icon={<Exit className={'iconRed w-5 h-5'} />}
            onClick={logout}
          >
            {t('signOut', { ns: TRANSLATION })}
          </Button>
        </div>

        <form className={'flex flex-col'} onSubmit={handleSubmit(onSubmit)}>
          <div className={'flex flex-col py-6 border-b border-border gap-2'}>
            <h3>{t('user.yourPersonalInfo', { ns: ENTITY })}</h3>
            <p className={'secondaryText body-14-16'}>
              {t('user.updatePersonalInfo', { ns: ENTITY })}
            </p>
          </div>

          <PersonalInfo register={register} />
          <Dob control={control} resetField={resetField} />
          <Sex control={control} />
          <About control={control} />

          {isDirty && isValid && (
            <FooterButton
              colorButton={'accent'}
              styleButton={'filled'}
              buttonText={t('save', { ns: TRANSLATION })}
              type={'submit'}
              isAbsolute
              buttonClassName={'w-[220px]'}
            >
              <Button
                styleButton={'filled'}
                colorButton={'dark'}
                onClick={() => {
                  reset(initialValues, { keepDirty: false })
                }}
                className={'w-[220px]'}
              >
                <p className={'body-16'}>{t('cancel', { ns: TRANSLATION })}</p>
              </Button>
            </FooterButton>
          )}
        </form>
      </div>
    </div>
  )
})
