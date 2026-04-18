'use client'

import type { ReactNode } from 'react';
import React, { createContext, useState } from 'react'

import type { LayoutAction, BreadcrumbItem, LayoutContextType } from './types'

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

interface LayoutProviderProps {
    children: ReactNode
    permissions?: string[]
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children, permissions = [] }) => {
    const [actions, setActions] = useState<LayoutAction[]>([])
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
    const [editMode, setEditModeState] = useState(false)
    const [dirty, setDirty] = useState(false)

    const toggleEditMode = () => setEditModeState((prev) => !prev)

    const hasPermission = (permission: string) => {
        return permissions.includes(permission)
    }

    const value: LayoutContextType = {
        actions,
        breadcrumbs,
        editMode,
        dirty,
        permissions,
        setActions,
        setBreadcrumbs,
        toggleEditMode,
        setEditMode: setEditModeState,
        setDirty,
        hasPermission,
    }

    return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}
