import React, { HTMLProps } from 'react'
import Skeleton from 'react-loading-skeleton'

interface Props extends HTMLProps<HTMLSpanElement> {}

export const EmptyItem = ({ ...props }: Props) => <Skeleton {...props} />
