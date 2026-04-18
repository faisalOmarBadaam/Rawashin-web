import assert from 'node:assert/strict'
import test from 'node:test'

import {
  applyVariantToCreateOrUpdateDto,
  applyVariantToListQuery,
  isTypeAllowed
} from '@/domains/clients/variants/clientVariants'

test('employees variant enforces fixed type in DTO', () => {
  assert.deepEqual(
    applyVariantToCreateOrUpdateDto('employees', { clientType: 2, name: 'x' }),
    { clientType: 0, name: 'x' }
  )
})

test('users variant coerces list query to allowed types when invalid', () => {
  assert.deepEqual(applyVariantToListQuery('users', { ClientType: 0, PageNumber: 1 }), {
    ClientType: 3,
    PageNumber: 1
  })
})

test('clients variant accepts clientType 0 and rejects 5', () => {
  assert.equal(isTypeAllowed('clients', 0), true)
  assert.equal(isTypeAllowed('clients', 5), false)
})
