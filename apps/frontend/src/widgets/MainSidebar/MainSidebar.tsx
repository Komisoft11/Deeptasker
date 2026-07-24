import { observer } from 'mobx-react-lite'
import React from 'react'
import { useNavigate, useParams } from 'react-router'
import { ProjectSidebar } from '@/widgets/Project'
import { SettingsSidebar } from '@/widgets/Settings/SettingsSidebar/SettingsSidebar'
import { ActiveTaskTimer } from '@/features/ActiveTaskTimer/ActiveTaskTimer'
import { Logo } from '@/features/Logo/Logo'
import { MainMenu, MenuItem, UserMenu } from '@/features/Menu'
import { SidebarWrapper } from '@/entities/Sidebar'
import { elementView as viewMap } from '@/entities/Sidebar/const/const'
import { CaretLeft, CaretRight, Workspaces } from '@/shared/assets/images/icons'
import { INIT_URL } from '@/shared/config/route.config'
import { useBreakpoints } from '@/shared/lib/hooks/useBreakpoints'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { WorkspacesNavigator } from '@/shared/lib/navigators/worksapce.navigator'
import { useFeedbackToast } from '@/shared/ui/ToastNotification/hooks/useFeedbackToast'
import styles from './MainSidebar.module.scss'


export const MainSidebar = observer(() => {
  const {
    sidebarStore,
    workspaceStore,
    taskStore: { trackingTask },
    taskTimerStore,
    authStore: { user }
  } = useRootStore()
  const isCurrentTaskRunning = taskTimerStore.isCurrentTaskRunning(trackingTask)
  const { activeWorkspace } = workspaceStore
  const navigate = useNavigate()
  const { IS_MOBILE_OR_TABLET, isDesktopStandard } = useBreakpoints()

  const { spaceId } = useParams()
  useFeedbackToast({ userSignupDate: user.dateCreated })

  const {
    isFirstLeftOpen,
    isSecondLeftOpen,
    elementView,
    isExtendedFirstLeftOpen
  } = sidebarStore

  const isCollapsedForced = IS_MOBILE_OR_TABLET || isDesktopStandard

  const isExpanded = !isCollapsedForced && isExtendedFirstLeftOpen

  const handleClick = () => {
    if (isCollapsedForced) return
    if (isExtendedFirstLeftOpen) {
      sidebarStore.collapseLeftFirstSidebar()
    } else {
      sidebarStore.extendLeftFirstSidebar()
    }
  }

  const showTimer = isExpanded && !!trackingTask.activeDate

  const handleNavigate = () => {
    navigate(INIT_URL)
  }

  const isProjectSidebar = spaceId && elementView === viewMap.project

  const handleWorkspaceClick = () => {
    if (sidebarStore.elementView === viewMap.project) return

    sidebarStore.elementView = viewMap.project
  }

  return (
    <div className={styles.sidebar}>
      {isFirstLeftOpen && (
        <div
          className={styles.menu}
          style={{ width: isExpanded ? '240px' : '76px' }}
        >
          <section className={styles.logoSection} onClick={handleNavigate}>
            <div className={'w-11 h-11'}>
              <Logo
                width={44}
                className={
                  isCurrentTaskRunning
                    ? styles.logoAnimation
                    : styles.noAnimation
                }
              />
            </div>
            {showTimer ? (
              <ActiveTaskTimer />
            ) : isExpanded ? (
              <h3>Deeptasker</h3>
            ) : null}
          </section>

          <section className={styles.section}>
            <MenuItem
              to={WorkspacesNavigator.getWorkspaceGridUrl(activeWorkspace.id)}
              onClick={handleWorkspaceClick}
              title={activeWorkspace.title}
              icon={<Workspaces className={'icon'} />}
              isSidebarCollapsed={!isExpanded}
            />
          </section>

          <section className={styles.mainMenuSection}>
            <MainMenu isSidebarCollapsed={!isExpanded} />
          </section>

          <section className={styles.userSection}>
            <UserMenu isSidebarCollapsed={!isExpanded} />
          </section>

          {!isCollapsedForced && (
            <section className={styles.caretSection} onClick={handleClick}>
              {!isExpanded ? (
                <CaretRight className='icon w-5 h-5' />
              ) : (
                <CaretLeft className='icon w-5 h-5' />
              )}
            </section>
          )}
        </div>
      )}
      {isSecondLeftOpen && (
        <SidebarWrapper isVisible={isSecondLeftOpen}>
          {isProjectSidebar ? <ProjectSidebar /> : <SettingsSidebar />}
        </SidebarWrapper>
      )}
    </div>
  )
})
