import { isActionAllowedByClientType, isActionAllowedByRBAC } from './smart-topbar.policies'
import type { ResolvedTopbarAction, SmartActionKey, SmartTopBarConfig } from './smart-topbar.types'

const ACTION_META: Record<SmartActionKey, Omit<ResolvedTopbarAction, 'onClick'>> = {
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

const VIEW_ORDER: SmartActionKey[] = [
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

const EDIT_ORDER: SmartActionKey[] = [
  'attachments',
  'undo',
  'cancel',
  'save',
  'approve',
  'post',
  'reject',
]

const WORKFLOW_ACTIONS: SmartActionKey[] = ['approve', 'reject', 'post']

const isActionAllowedByStatus = (action: SmartActionKey, status?: string): boolean => {
  if (!WORKFLOW_ACTIONS.includes(action)) return true

  return Boolean(status)
}

type ResolveOptions = {
  defaultAddHandler?: () => void
}

export const resolveTopbarActions = (
  config: SmartTopBarConfig,
  options?: ResolveOptions,
): ResolvedTopbarAction[] => {
  const order = config.mode === 'view' ? VIEW_ORDER : EDIT_ORDER
  const resolved: ResolvedTopbarAction[] = []

  for (const action of order) {
    const explicitHandler = config.actions[action]
    const onClick =
      action === 'add' ? (explicitHandler ?? options?.defaultAddHandler) : explicitHandler

    if (!onClick) continue
    if (action === 'add' && config.mode !== 'view') continue

    if (!isActionAllowedByClientType(action, config.clientType)) continue
    if (!isActionAllowedByRBAC(action, config.roles, config.resource, config.permissionsMap))
      continue
    if (!isActionAllowedByStatus(action, config.status)) continue

    const meta = ACTION_META[action]

    resolved.push({
      ...meta,
      onClick,
      disabled:
        action === 'save'
          ? Boolean(config.loading || config.dirty === false)
          : Boolean(config.loading && action !== 'add'),
      loading: action === 'save' ? Boolean(config.loading) : false,
    })
  }

  return resolved
}
