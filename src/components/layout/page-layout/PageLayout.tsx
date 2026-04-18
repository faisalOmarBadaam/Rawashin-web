'use client'

import type { ReactNode } from 'react';
import React from 'react'

import clsx from 'clsx'

import Topbar from './Topbar'
import type { BreadcrumbItem, TopbarAction, ResponsiveColumns } from './types'

interface PageLayoutProps {
    children: ReactNode
    breadcrumbs?: BreadcrumbItem[]
    actions?: TopbarAction[]
    columns?: number
    responsiveColumns?: ResponsiveColumns
    gap?: number
    loading?: boolean
    className?: string
}

const PageLayout = ({
    children,
    breadcrumbs,
    actions,
    columns = 1,
    responsiveColumns,
    gap = 4,
    loading = false,
    className
}: PageLayoutProps) => {

    // Dynamic grid column classes
    // NOTE: Tailwind scans your code for class names. If you use dynamic strings like `grid-cols-${columns}`,
    // you must ensure these classes are safelisted in your tailwind.config.js or used elsewhere.
    // Example Safe List: pattern: /grid-cols-./
    const gridClass = clsx(
        'grid',
        `grid-cols-${columns}`,
        breadcrumbs && 'mt-6', // Add margin top if breadcrumbs exist
        `gap-${gap}`,
        responsiveColumns?.sm && `sm:grid-cols-${responsiveColumns.sm}`,
        responsiveColumns?.md && `md:grid-cols-${responsiveColumns.md}`,
        responsiveColumns?.lg && `lg:grid-cols-${responsiveColumns.lg}`,
        responsiveColumns?.xl && `xl:grid-cols-${responsiveColumns.xl}`
    )

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col">
            <Topbar breadcrumbs={breadcrumbs} actions={actions} />

            <main className={clsx('flex-1 p-6 container mx-auto max-w-7xl', className)}>
                {loading ? (
                    <div className="flex items-center justify-center h-64 animate-pulse">
                        <div className="text-gray-400">Loading content...</div>
                        {/* You can allow passing a custom loader here */}
                    </div>
                ) : (
                    <div className={gridClass}>
                        {children}
                    </div>
                )}
            </main>
        </div>
    )
}

export default PageLayout
