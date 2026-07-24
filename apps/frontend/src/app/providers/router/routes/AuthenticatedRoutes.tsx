import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import { Navigate, Outlet } from 'react-router'
import { FilterSidebar } from '@/widgets/FilterSidebar/FilterSidebar'
import { MainSidebar } from '@/widgets/MainSidebar/MainSidebar'
import { Layout } from '@/features/Layout/Layout'
import { useAppInitialization } from '@/entities/lib/hooks/useAppInitialization'
import { AUTH_URL } from '@/shared/config/route.config'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Loading } from '@/shared/ui/Loading/Loading'


export const AuthenticatedRoutes = observer(() => {
  const {
    authStore,
    sidebarStore: { isRightOpen }
  } = useRootStore()

  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  const [bodyWidth, setBodyWidth] = useState('100%')

  useEffect(() => {
    const updateWidth = () => {
      const leftWidth = leftRef.current?.offsetWidth || 0
      const rightWidth = rightRef.current?.offsetWidth || 0
      setBodyWidth(`calc(100% - ${leftWidth + rightWidth}px)`)
    }

    let leftObserver: ResizeObserver
    let rightObserver: ResizeObserver

    const setupObservers = () => {
      if (!leftRef.current || !rightRef.current) {
        requestAnimationFrame(setupObservers)
        return
      }

      leftObserver = new ResizeObserver(updateWidth)
      rightObserver = new ResizeObserver(updateWidth)

      leftObserver.observe(leftRef.current)
      rightObserver.observe(rightRef.current)

      updateWidth()
    }

    setupObservers()

    return () => {
      leftObserver?.disconnect()
      rightObserver?.disconnect()
    }
  }, [])

  const { isAuth, isAppInitialization } = authStore

  //useUrlChanges()
  useAppInitialization()

  if (!isAppInitialization && isAuth) {
    return (
      <div className={'w-screen h-screen flex items-center justify-center'}>
        <Loading variant={'spinner'} className={'stroke-red'} />
      </div>
    )
  }

  return isAuth ? (
    <Layout>
      <Layout.LeftSidebar ref={leftRef}>
        <MainSidebar />
      </Layout.LeftSidebar>
      <Layout.Body style={{ width: bodyWidth }}>
        <Outlet />
      </Layout.Body>
      <Layout.RightSidebar ref={rightRef}>
        {isRightOpen && <FilterSidebar />}
      </Layout.RightSidebar>
    </Layout>
  ) : (
    <Navigate to={AUTH_URL} />
  )
})
