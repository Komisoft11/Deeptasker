import classNames from 'classnames'
import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { LEGAL_TABS_CONFIG } from '@/widgets/Legal/const/tabsConfig'
import { ArrowLeft } from '@/shared/assets/images/icons'
import { legalTab } from '@/shared/config/route.config'
import { LegalNavigator } from '@/shared/lib/navigators/legal.navigator'


export const LegalTabs = () => {
  const location = useLocation()
  const currentTab = location.pathname.split('/').pop() || legalTab.CONSENT
  const navigate = useNavigate()

  return (
    <div className='flex justify-between'>
      <div onClick={() => navigate(-1)} className={'iconContainer'}>
        <ArrowLeft className={'icon w-4 h-4'} />
      </div>
      {LEGAL_TABS_CONFIG.map(({ slug, label }) => (
        <Link
          key={slug}
          to={LegalNavigator.getLegalTab({ tab: slug })}
          className={classNames(
            'body-14-16 p-2 rounded-lg hover:cursor-pointer hover:bg-hover',
            currentTab === slug && 'bg-hover'
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}
