'use client'

import React from 'react'

import { useLayout } from './useLayout'
import { Breadcrumbs } from './Breadcrumbs'
import { PermissionGuard } from './PermissionGuard'

export const Topbar: React.FC = () => {
    const { breadcrumbs, actions } = useLayout()

    return (
        <div className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700 transition-colors duration-300">
            <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8 justify-between">
                {/* Left: Breadcrumbs */}
                <div className="flex items-center overflow-hidden">
                    <Breadcrumbs items={breadcrumbs} />
                </div>

                {/* Right: Actions */}
                <div className="flex items-center space-x-4 rtl:space-x-reverse ml-4 rtl:mr-4 rtl:ml-0">
                    {actions.map((action) => {
                        const Button = (
                            <button
                                key={action.id}
                                onClick={action.onClick}
                                disabled={action.disabled}
                                title={action.title}
                                className={`
                  inline-flex items-center px-3 py-1.5 border border-transparent
                  text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2
                  transition-colors duration-200
                  ${action.variant === 'danger'
                                        ? 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500'
                                        : action.variant === 'primary'
                                            ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                            : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                                    }
                  ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                            >
                                {action.icon && <span className="mr-2 rtl:ml-2 rtl:mr-0 -ml-1 h-5 w-5">{action.icon}</span>}
                                {action.label}
                            </button>
                        )

                        if (action.permission) {
                            return (
                                <PermissionGuard key={action.id} permission={action.permission}>
                                    {Button}
                                </PermissionGuard>
                            )
                        }

                        return Button
                    })}
                </div>
            </div>
        </div>
    )
}
