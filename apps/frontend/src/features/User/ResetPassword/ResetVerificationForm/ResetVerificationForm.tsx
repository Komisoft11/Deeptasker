import { observer } from 'mobx-react-lite'
import React from 'react'
import { Navigate } from 'react-router'
import { VerificationForm } from '@/features/User'
import { AuthService, useUsers } from '@/entities/User'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { AuthenticationNavigator } from '@/shared/lib/navigators/authentication.navigator'


export const ResetVerificationForm = observer(() => {
  const {
    authStore: { candidateEmail }
  } = useRootStore()

  if (!candidateEmail) {
    return <Navigate to={AuthenticationNavigator.getAuthUrl()} replace />
  }

  const { resetPasswordVerifyAsync } = useUsers()

  const handleVerify = async (code: string) => {
    await resetPasswordVerifyAsync.mutateAsync({ code, email: candidateEmail })
  }

  const handleResend = async () => {
    await AuthService.resendPasswordResetCode(candidateEmail)
  }

  return (
    <VerificationForm
      candidateEmail={candidateEmail}
      onVerify={handleVerify}
      onResend={handleResend}
    />
  )
})
