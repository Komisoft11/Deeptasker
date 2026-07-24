import { SVGProps } from 'react'
import styled from 'styled-components'
import { DotsLoading, SpinnerLoading } from '@/shared/assets/images/icons'

interface Props extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  variant: 'dots' | 'spinner'
}

export const Loading = ({ variant, ...props }: Props) => {
  return variant === 'dots' ? (
    <LoadingStyledDots {...props} />
  ) : (
    <LoadingStyledSpinner {...props} />
  )
}

const LoadingStyledDots = styled(DotsLoading)`
  pointer-events: none;
  display: inline-block;
  aspect-ratio: 1 / 1;
  mask-size: 100%;
`

const LoadingStyledSpinner = styled(SpinnerLoading)`
  pointer-events: none;
  display: inline-block;
  aspect-ratio: 1 / 1;
  mask-size: 100%;
  stroke: var(--accent);
`
