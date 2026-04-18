'use client'

import React from 'react'

import Link from 'next/link'

import { FiChevronRight, FiHome } from 'react-icons/fi'
import clsx from 'clsx'

import type { BreadcrumbItem } from './types'

interface BreadcrumbsProps {
    items?: BreadcrumbItem[]
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
    if (!items || items.length === 0) {
        return null
    }

    return (
        <nav aria-label="Breadcrumb" className="flex items-center text-sm">
            <ol className="flex items-center space-x-2 rtl:space-x-reverse">
                {/* Home Icon (Optional, can be removed if not needed) */}
                <li>
                    <Link
                        href="/"
                        className="text-gray-400 hover:text-gray-700 transition-colors flex items-center"
                        aria-label="Home"
                    >
                        <FiHome size={16} />
                    </Link>
                </li>

                {items.length > 0 && (
                    <li className="text-gray-400">
                        <FiChevronRight className="rtl:rotate-180" size={16} />
                    </li>
                )}

                {items.map((item, index) => {
                    const isLast = index === items.length - 1

                    return (
                        <li key={`${item.label}-${index}`} className="flex items-center">
                            {index > 0 && (
                                <span className="mx-2 text-gray-400">
                                    <FiChevronRight className="rtl:rotate-180" size={16} />
                                </span>
                            )}

                            {isLast ? (
                                <span
                                    className="font-medium text-gray-900 cursor-default"
                                    aria-current="page"
                                >
                                    {item.label}
                                </span>
                            ) : item.href ? (
                                <Link
                                    href={item.href}
                                    className="text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-gray-500 cursor-default">
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

export default Breadcrumbs
