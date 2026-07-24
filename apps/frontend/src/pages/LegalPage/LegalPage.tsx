import { Outlet } from 'react-router'
import { LegalTabs } from '@/widgets/Legal/ui/LegalTabs/LegalTabs'

export const LegalPage = () => {
  return (
    <div className=' py-6 w-full h-full'>
      <div className='flex flex-col gap-6 max-w-[920px] mx-auto h-full'>
        <LegalTabs />

        <div
          className={'flex-[1_0_0] overflow-y-auto scrollbarContainerOnBg pr-2'}
        >
          <Outlet />
        </div>
      </div>
    </div>
  )
}
