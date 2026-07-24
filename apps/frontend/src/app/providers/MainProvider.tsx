import { QueryClient } from '@tanstack/query-core'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, StrictMode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { ErrorBoundary } from '@/app/providers/ErrorBoundary'
import { RootStore } from '@/entities/lib/stores/root.store'
import i18n from '@/shared/config/i18n/i18n'
import { ENTITY } from '@/shared/const/translation'
import RootProvider from './RootProvider'


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

export const rootStore = new RootStore(queryClient)

export const MainProvider = ({ children }: { children: ReactNode }) => {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <RootProvider>
            <I18nextProvider i18n={i18n} defaultNS={ENTITY}>
              {children}
            </I18nextProvider>
          </RootProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </StrictMode>
  )
}
