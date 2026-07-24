import { RouteObject } from 'react-router'
import { ProfilePage } from '@/pages/User/ProfilePage/ProfilePage'
import { PROFILE_ID_URL } from '@/shared/config/route.config'

const ProfileRoutes: RouteObject[] = [
  {
    path: PROFILE_ID_URL,
    element: <ProfilePage />
  }
]

export default ProfileRoutes
