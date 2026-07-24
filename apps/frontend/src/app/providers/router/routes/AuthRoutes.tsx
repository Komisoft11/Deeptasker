import React from 'react'
import { Navigate } from 'react-router'
import {
  ActivationForm,
  ResetRequestForm,
  ResetVerificationForm,
  SetPasswordForm,
  SignInForm,
  SignUpForm
} from '@/features/User'
import {
  ACTIVATION_ACCOUNT_URL,
  LOGIN_URL,
  REGISTER_URL,
  RESET_PASSWORD_REQUEST_URL,
  RESET_PASSWORD_SET_URL,
  RESET_PASSWORD_VERIFY_URL
} from '@/shared/config/route.config'

export const AuthRoutes = [
  { path: '', element: <Navigate to={LOGIN_URL} /> },
  { path: LOGIN_URL, element: <SignInForm /> },
  { path: REGISTER_URL, element: <SignUpForm /> },
  { path: ACTIVATION_ACCOUNT_URL, element: <ActivationForm /> },
  { path: RESET_PASSWORD_REQUEST_URL, element: <ResetRequestForm /> },
  { path: RESET_PASSWORD_VERIFY_URL, element: <ResetVerificationForm /> },
  { path: RESET_PASSWORD_SET_URL, element: <SetPasswordForm /> }
]
