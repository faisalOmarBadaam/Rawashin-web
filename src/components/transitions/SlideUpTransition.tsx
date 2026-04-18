'use client'

import { forwardRef } from 'react'

import type { ReactElement, Ref } from 'react'

import Slide from '@mui/material/Slide'
import type { SlideProps } from '@mui/material/Slide'

const SlideUpTransition = forwardRef(function SlideUpTransition(
  props: SlideProps & { children?: ReactElement },
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />
})

export default SlideUpTransition
