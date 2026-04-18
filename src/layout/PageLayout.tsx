'use client'

import type { ReactNode } from 'react';
import React from 'react'

import { Topbar } from './Topbar'
import { SaveBar } from './SaveBar'

interface PageLayoutProps {
  children: ReactNode
  className?: string
  onSave?: () => void
  onCancel?: () => void
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = '',
  onSave,
  onCancel,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Topbar />

      <main className={`grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
        <div className="grid grid-cols-12 gap-6">
          {children}
        </div>
      </main>

      <SaveBar onSave={onSave} onCancel={onCancel} />
    </div>
  )
}
