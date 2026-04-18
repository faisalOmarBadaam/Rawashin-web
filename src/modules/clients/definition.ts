import { defineModule } from '@/core/policy/module.definition'

export const clientsDefinition = defineModule({
  key: 'clients',
  resource: 'clients',
  routes: {
    base: '/clients',
    add: '/clients/add',
    view: '/clients/[id]/view',
    edit: '/clients/[id]/edit'
  },
  clientTypeSupport: true,
  actions: {
    print: true,
    charge: true,
    attachments: true,
    export: true
  },
  permissions: {
    add: 'create',
    edit: 'update',
    delete: 'delete'
  }
})
