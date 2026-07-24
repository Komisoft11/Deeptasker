import { PROFILE_URL } from '@/shared/config/route.config'

export const ProfileNavigator = {
  getProfileUrl(): string {
    return PROFILE_URL
  }
} as const
