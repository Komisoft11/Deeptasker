import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'
import styled from 'styled-components'
import { Close } from '@/shared/assets/images/icons'

interface Props
  extends Omit<
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >,
    'ref'
  > {}

export const CloseButton = (props: Props) => {
  return (
    <Button {...props}>
      <Close />
    </Button>
  )
}

const Button = styled.button`
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
  }

  svg path {
    fill: var(--text-main);
  }

  &:hover {
    background-color: var(--hover);
  }
`
