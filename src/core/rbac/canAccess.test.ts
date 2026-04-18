import assert from 'node:assert/strict'
import test from 'node:test'

import { canAccess, normalizeRoutePath } from '@/core/rbac/canAccess'

test('canAccess blocks blocked dashboard roles', () => {
  assert.equal(
    canAccess({
      roles: ['Customer'],
      resource: 'dashboard',
      action: 'read'
    }),
    false
  )
})

test('canAccess allows employee dashboard access', () => {
  assert.equal(
    canAccess({
      roles: ['Employee'],
      resource: 'dashboard',
      action: 'read'
    }),
    true
  )
})

test('canAccess enforces restricted charger allowed routes only', () => {
  assert.equal(
    canAccess({
      roles: ['Charger'],
      resource: 'dashboard',
      action: 'read',
      route: '/ar/transactions'
    }),
    true
  )

  assert.equal(
    canAccess({
      roles: ['Charger'],
      resource: 'dashboard',
      action: 'read',
      route: '/ar/clients'
    }),
    false
  )
})

test('normalizeRoutePath strips locale safely', () => {
  assert.equal(normalizeRoutePath('/ar/transactions'), '/transactions')
  assert.equal(normalizeRoutePath('/en/home/abc'), '/home/abc')
  assert.equal(normalizeRoutePath('/clients'), '/clients')
})
