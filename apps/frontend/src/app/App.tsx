import { MantineProvider } from '@mantine/core'
import 'driver.js/dist/driver.css'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { SkeletonTheme } from 'react-loading-skeleton'
import { RouterProvider } from 'react-router'
import 'react-toastify/dist/ReactToastify.css'
import {
  ThemeProvider,
  darkTheme,
  defaultTheme
} from '@/app/providers/ThemeProvider/ThemeProvider'
import router from '@/app/providers/router/router'
import { AppWrapper } from '@/app/ui/AppWrapper/AppWrapper'
import { DeleteDialog } from '@/features/DeleteDialog/DeleteDialog'
import { ThemeType } from '@/entities/lib/stores/theme-mode.store'
import '@/shared/config/i18n/i18n'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ToastNotification } from '@/shared/ui/ToastNotification/ToastNotification'
import './styles/globals.scss'


const App = observer(() => {
  const { themeModeStore } = useRootStore()

  return (
    <MantineProvider>
      <ThemeProvider
        theme={
          themeModeStore.mode === ThemeType.dark ? darkTheme : defaultTheme
        }
      >
        <AppWrapper>
          <SkeletonTheme baseColor='var(--hover)'>
            <RouterProvider router={router} />
            <DeleteDialog />
          </SkeletonTheme>
          <ToastNotification />
        </AppWrapper>
      </ThemeProvider>
    </MantineProvider>
  )
})

export default App
