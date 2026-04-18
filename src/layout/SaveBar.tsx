'use client'

import React from 'react'

import { useLayout } from './useLayout'

interface SaveBarProps {
    onSave?: () => void
    onCancel?: () => void
}

export const SaveBar: React.FC<SaveBarProps> = ({ onSave, onCancel }) => {
    const { editMode, dirty, setDirty, setEditMode } = useLayout()

    if (!editMode || !dirty) {
        return null
    }

    const handleCancel = () => {
        setDirty(false)
        // Optional: Turn off edit mode on cancel if desired, or just reset data
        // setEditMode(false)
        if (onCancel) onCancel()
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-lg animate-slide-up dark:bg-gray-800 dark:border-gray-700">
            <div className="container mx-auto flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    You have unsaved changes.
                </div>
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}
