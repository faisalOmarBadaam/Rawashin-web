'use client'

import React, { useState } from 'react'

import { FiEdit, FiSave, FiTrash2, FiRotateCcw, FiPlus } from 'react-icons/fi'

import type { BreadcrumbItem, TopbarAction } from '@/components/layout/page-layout';
import { PageLayout } from '@/components/layout/page-layout'

export default function LayoutSystemExample() {
    const [loading, setLoading] = useState(false)

    // 1. Define Breadcrumbs
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Settings', href: '/dashboard/settings' },
        { label: 'Layout System' } // Active item (no href)
    ]

    // 2. Define Actions
    const actions: TopbarAction[] = [
        {
            id: 'undo',
            label: 'Undo',
            icon: <FiRotateCcw />,
            onClick: () => console.log('Undo clicked'),
            disabled: true
        },
        {
            id: 'save',
            label: 'Save Changes',
            icon: <FiSave />,
            onClick: () => {
                setLoading(true)
                setTimeout(() => setLoading(false), 2000)
            },
            variant: 'primary'
        },
        {
            id: 'delete',
            label: 'Delete',
            icon: <FiTrash2 />,
            onClick: () => alert('Delete clicked'),
            variant: 'danger',
            title: 'Delete this item permanently'
        }
    ]

    return (
        <PageLayout
            breadcrumbs={breadcrumbs}
            actions={actions}
            columns={1}
            responsiveColumns={{ md: 2, lg: 3 }}
            gap={6}
            loading={loading}
        >
            {/* Grid Item 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-40 flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">Card 1</h3>
                    <p className="text-gray-500 text-sm mt-1">Responsive Grid Item</p>
                </div>
            </div>

            {/* Grid Item 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-40 flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">Card 2</h3>
                    <p className="text-gray-500 text-sm mt-1">Responsive Grid Item</p>
                </div>
            </div>

            {/* Grid Item 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-40 flex items-center justify-center col-span-1 md:col-span-2 lg:col-span-1">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">Card 3</h3>
                    <p className="text-gray-500 text-sm mt-1">Spans 2 cols on MD</p>
                </div>
            </div>

            {/* Grid Item 4 - Full Width */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center col-span-1 md:col-span-2 lg:col-span-3">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900">Full Width Section</h3>
                    <p className="text-gray-500 text-sm mt-1">
                        This item spans all columns using standard Tailwind classes (`col-span-X`).
                    </p>
                    <button
                        className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2 mx-auto"
                        onClick={() => setLoading(true)}
                    >
                        <FiPlus /> Test Loading State
                    </button>
                </div>
            </div>

        </PageLayout>
    )
}
