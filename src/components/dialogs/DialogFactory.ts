import { createElement, type ReactNode } from 'react'

import GenericDialog, { type GenericDialogProps } from './GenericDialog'

type ConfirmDialogOptions = Omit<GenericDialogProps, 'children'> & {
  message: ReactNode
}

type FormDialogOptions = GenericDialogProps

type InfoDialogOptions = Omit<GenericDialogProps, 'hideActions'>

type ProgressDialogOptions = Omit<GenericDialogProps, 'onSubmit' | 'submitText'> & {
  progressContent: ReactNode
}

export const DialogFactory = {
  confirm: (options: ConfirmDialogOptions) =>
    createElement(GenericDialog, { ...options, children: options.message }),
  form: (options: FormDialogOptions) => createElement(GenericDialog, options),
  info: (options: InfoDialogOptions) =>
    createElement(GenericDialog, { ...options, hideActions: true, children: options.children }),
  progress: (options: ProgressDialogOptions) =>
    createElement(GenericDialog, {
      ...options,
      hideActions: true,
      children: options.progressContent,
    }),
}

export default DialogFactory
