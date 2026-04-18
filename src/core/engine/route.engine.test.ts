import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveAddPath } from '@/core/engine/route.engine'

test('resolveAddPath resolves module add route from view/edit/card routes', () => {
  assert.equal(resolveAddPath('/clients/123/view'), '/clients/add')
  assert.equal(resolveAddPath('/clients/123/edit?type=client'), '/clients/add')
  assert.equal(resolveAddPath('/clients/123/card'), '/clients/add')
  assert.equal(resolveAddPath('/employees/99/view#hash'), '/employees/add')
})

test('resolveAddPath keeps add route stable', () => {
  assert.equal(resolveAddPath('/clients/add'), '/clients/add')
  assert.equal(resolveAddPath('/users/add'), '/users/add')
})
