import { isActionAllowedByClientTypeMatrix } from '@/core/policy/clientType.matrix'

import type { ActionDescriptor, EntityActionKey, ResolveEntityActionsInput } from './action.types'

import { isActionAllowedByPermissions } from './permissions.engine'
import { isActionAllowedByWorkflowStatus } from './workflow.engine'

type ResolveOptions = {
  defaultAddHandler?: () => void
}

const ACTION_META: Record<EntityActionKey, Omit<ActionDescriptor, 'onClick'>> = {
  add: { key: 'add', label: 'إضافة', icon: 'mdi:plus', tone: 'primary', group: 'primary' },
  attachments: {
    key: 'attachments',
    label: 'إدارة المرفقات',
    icon: 'mdi:file-document-outline',
    tone: 'default',
    group: 'secondary',
  },
  edit: {
    key: 'edit',
    label: 'تعديل',
    icon: 'mdi:pencil-outline',
    tone: 'default',
    group: 'secondary',
  },
  save: {
    key: 'save',
    label: 'حفظ',
    icon: 'mdi:content-save-outline',
    tone: 'primary',
    group: 'primary',
  },
  delete: {
    key: 'delete',
    label: 'حذف',
    icon: 'mdi:delete-outline',
    tone: 'danger',
    group: 'danger',
  },
  undo: { key: 'undo', label: 'تراجع', icon: 'mdi:undo', tone: 'default', group: 'secondary' },
  cancel: { key: 'cancel', label: 'إلغاء', icon: 'mdi:close', tone: 'default', group: 'secondary' },
  print: {
    key: 'print',
    label: 'طباعة',
    icon: 'mdi:printer-outline',
    tone: 'default',
    group: 'secondary',
  },
  export: {
    key: 'export',
    label: 'تصدير',
    icon: 'mdi:file-export-outline',
    tone: 'default',
    group: 'secondary',
  },
  reprint: {
    key: 'reprint',
    label: 'إعادة طباعة',
    icon: 'mdi:printer',
    tone: 'default',
    group: 'secondary',
  },
  approve: {
    key: 'approve',
    label: 'اعتماد',
    icon: 'mdi:check-circle-outline',
    tone: 'primary',
    group: 'primary',
  },
  reject: {
    key: 'reject',
    label: 'رفض',
    icon: 'mdi:close-circle-outline',
    tone: 'danger',
    group: 'danger',
  },
  post: {
    key: 'post',
    label: 'ترحيل',
    icon: 'mdi:send-outline',
    tone: 'primary',
    group: 'primary',
  },
  charge: {
    key: 'charge',
    label: 'تعبئة حساب',
    icon: 'ri:wallet-3-line',
    tone: 'primary',
    group: 'primary',
  },
  assign: {
    key: 'assign',
    label: 'إسناد بطاقة',
    icon: 'ri:id-card-line',
    tone: 'primary',
    group: 'primary',
  },
  commission: {
    key: 'commission',
    label: 'إضافة العمولة',
    icon: 'ri:wallet-3-line',
    tone: 'primary',
    group: 'primary',
  },
  passRest: {
    key: 'passRest',
    label: 'تغيير كلمة المرور',
    icon: 'ri:lock-password-line',
    tone: 'default',
    group: 'secondary',
  },
  chargeCharger: {
    key: 'chargeCharger',
    label: 'إضافة رصيد',
    icon: 'ri:flashlight-line',
    tone: 'primary',
    group: 'primary',
  },
  deposit: {
    key: 'deposit',
    label: 'تغذية الحساب',
    icon: 'ri:bank-line',
    tone: 'primary',
    group: 'primary',
  },
  debt: {
    key: 'debt',
    label: 'تديين العميل',
    icon: 'ri:bank-card-line',
    tone: 'primary',
    group: 'primary',
  },
  roles: {
    key: 'roles',
    label: 'إدارة الصلاحيات',
    icon: 'ri:shield-keyhole-line',
    tone: 'default',
    group: 'secondary',
  },
}

const VIEW_ORDER: EntityActionKey[] = [
  'add',
  'attachments',
  'edit',
  'print',
  'export',
  'reprint',
  'charge',
  'assign',
  'commission',
  'chargeCharger',
  'deposit',
  'debt',
  'roles',
  'passRest',
  'approve',
  'post',
  'reject',
  'delete',
]

const EDIT_ORDER: EntityActionKey[] = [
  'attachments',
  'undo',
  'cancel',
  'save',
  'approve',
  'post',
  'reject',
]

export const resolveEntityActions = (
  input: ResolveEntityActionsInput,
  options?: ResolveOptions,
): ActionDescriptor[] => {
  const order = input.mode === 'view' ? VIEW_ORDER : EDIT_ORDER
  const resolved: ActionDescriptor[] = []

  for (const action of order) {
    const explicitHandler = input.handlers[action]
    const onClick =
      action === 'add' ? (explicitHandler ?? options?.defaultAddHandler) : explicitHandler

    if (!onClick) continue
    if (action === 'add' && input.mode !== 'view') continue

    if (!isActionAllowedByClientTypeMatrix(action, input.clientType)) continue
    if (!isActionAllowedByPermissions(action, input.roles, input.resource, input.permissionsMap))
      continue
    if (!isActionAllowedByWorkflowStatus(action, input.status)) continue

    const meta = ACTION_META[action]
    const isExplicitlyDisabled = Boolean(input.disabledActions?.[action])

    resolved.push({
      ...meta,
      onClick,
      disabled:
        isExplicitlyDisabled ||
        (action === 'save'
          ? Boolean(input.loading || input.dirty === false)
          : Boolean(input.loading && action !== 'add')),
      loading: action === 'save' ? Boolean(input.loading) : false,
    })
  }

  return resolved
}
