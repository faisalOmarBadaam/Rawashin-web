'use client'

import type { ReactNode } from 'react';
import React from 'react'

import { useLayout } from './useLayout'

interface PermissionGuardProps {
    permission: string
    children: ReactNode
    fallback?: ReactNode
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
    permission,
    children,
    fallback = null,
}) => {
    const { hasPermission } = useLayout()

    if (!hasPermission(permission)) {
        return <>{fallback}</>
    }

    return <>{children}</>
}
