import { observer } from 'mobx-react-lite'
import { Navigate, Outlet } from 'react-router'
import { useAppInitialization } from '@/entities/lib/hooks/useAppInitialization'
import { AUTH_URL } from '@/shared/config/route.config'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Loading } from '@/shared/ui/Loading/Loading'

export const AuthenticatedRoutesWithoutLayout = observer(() => {
  const {
    authStore: { isAuth, isAppInitialization }
  } = useRootStore()

  useAppInitialization()

  if (!isAppInitialization && isAuth) {
    return (
      <div className={'w-screen h-screen flex items-center justify-center'}>
        <Loading variant={'spinner'} className={''} />
      </div>
    )
  }

  return isAuth ? <Outlet /> : <Navigate to={AUTH_URL} />
})
