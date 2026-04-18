import type { EntityActionKey } from './action.types'

const WORKFLOW_ACTIONS: EntityActionKey[] = ['approve', 'reject', 'post']

export const isActionAllowedByWorkflowStatus = (action: EntityActionKey, status?: string): boolean => {
  if (!WORKFLOW_ACTIONS.includes(action)) return true

  return Boolean(status)
}
