'use client'

import React from 'react'

import clsx from 'clsx'

import Breadcrumbs from './Breadcrumbs'
import type { BreadcrumbItem, TopbarAction } from './types'

interface TopbarProps {
    breadcrumbs?: BreadcrumbItem[]
    actions?: TopbarAction[]
    className?: string
}

const Topbar = ({ breadcrumbs, actions, className }: TopbarProps) => {
    return (
        <header
            className={clsx(
                'sticky top-0 z-50 w-full',
                'bg-white/80 backdrop-blur-md border-b border-gray-200',
                'px-6 py-4',
                'flex items-center justify-between',
                'transition-all duration-300',
                className
            )}
        >
            <div className="flex items-center gap-4">
                {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
            </div>

            <div className="flex items-center gap-2">
                {actions?.map((action) => (
                    <button
                        key={action.id}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        title={action.title}
                        className={clsx(
                            'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                            'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500',
                            {
                                'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800':
                                    action.variant === 'primary' && !action.disabled,
                                'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200':
                                    action.variant === 'danger' && !action.disabled,
                                'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300':
                                    (!action.variant || action.variant === 'default') && !action.disabled,

                                'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400': action.disabled
                            }
                        )}
                        aria-label={action.label}
                    >
                        {action.icon && <span className="text-lg">{action.icon}</span>}
                        <span className="hidden sm:inline">{action.label}</span>
                    </button>
                ))}
            </div>
        </header>
    )
}

export default Topbar
