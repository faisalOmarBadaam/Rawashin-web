'use client'

import React from 'react'

import Link from 'next/link'

import type { BreadcrumbItem } from './types'

interface BreadcrumbsProps {
    items: BreadcrumbItem[]
}

const ChevronRight = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        width="16"
        height="16"
    >
        <polyline points="9 18 15 12 9 6" />
    </svg>
)

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    if (!items || items.length === 0) return null

    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3 rtl:space-x-reverse">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1

                    return (
                        <li key={index} className="inline-flex items-center">
                            {index > 0 && (
                                <ChevronRight className="w-4 h-4 text-gray-400 mx-1 rtl:rotate-180" />
                            )}
                            {isLast ? (
                                <span className="text-sm font-medium text-gray-500 md:ml-2 rtl:mr-2">
                                    {item.label}
                                </span>
                            ) : item.href ? (
                                <Link
                                    href={item.href}
                                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                    {item.label}
                                </span>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
