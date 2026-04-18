import assert from 'node:assert/strict'
import test from 'node:test'

import { AppRole } from '@/configs/roles'
import { resolveEntityActions } from '@/core/engine/action.engine'
import { ClientType } from '@/types/api/clients'

test('action.engine: hides print for non-client clientType', () => {
  const actions = resolveEntityActions({
    mode: 'view',
    roles: [AppRole.Admin],
    resource: 'clients',
    clientType: ClientType.Merchant,
    handlers: {
      print: () => undefined,
      edit: () => undefined
    }
  })

  assert.equal(actions.some(action => action.key === 'edit'), true)
  assert.equal(actions.some(action => action.key === 'print'), false)
})

test('action.engine: save disabled when not dirty', () => {
  const actions = resolveEntityActions({
    mode: 'edit',
    roles: [AppRole.Admin],
    resource: 'clients',
    dirty: false,
    loading: false,
    handlers: {
      save: () => undefined
    }
  })

  const save = actions.find(action => action.key === 'save')

  assert.ok(save)
  assert.equal(save.disabled, true)
})
