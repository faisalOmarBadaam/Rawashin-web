import assert from 'node:assert/strict'
import test from 'node:test'

import { createEntityStore } from '@/core/store/createEntityStore'

type Item = { id: string; name: string }
type Details = Item & { description: string }
type CreateDto = { name: string }
type UpdateDto = { name: string }
type Filters = { search?: string }

const initialDetails: Record<string, Details> = {
  '1': { id: '1', name: 'First', description: 'D1' },
  '2': { id: '2', name: 'Second', description: 'D2' }
}

test('createEntityStore fetchList/fetchById/remove flow', async () => {
  const db: Record<string, Details> = { ...initialDetails }

  const useStore = createEntityStore<Item, Details, CreateDto, UpdateDto, Filters>({
    adapter: {
      list: async () => {
        const items = Object.values(db).map(item => ({ id: item.id, name: item.name }))

        return {
          items,
          total: items.length
        }
      },
      getById: async id => db[String(id)],
      create: async dto => {
        const id = String(Object.keys(db).length + 1)
        const details: Details = { id, name: dto.name, description: `D${id}` }
        db[id] = details

        return details
      },
      update: async (id, dto) => {
        const key = String(id)
        const current = db[key]
        const details: Details = { ...current, name: dto.name }
        db[key] = details

        return details
      },
      delete: async id => {
        delete db[String(id)]
      }
    },
    initialFilters: {},
    selectListItemId: item => item.id,
    selectDetailsId: details => details.id,
    toDetailsFromCreateResult: result => result,
    toDetailsFromUpdateResult: result => result
  })

  await useStore.getState().fetchList()
  assert.equal(useStore.getState().list.length, 2)
  assert.equal(useStore.getState().pagination.total, 2)

  const details = await useStore.getState().fetchById('1')
  assert.equal(details.id, '1')
  assert.equal(useStore.getState().detailsById['1'].name, 'First')

  await useStore.getState().remove('1')
  assert.equal(useStore.getState().list.some(item => item.id === '1'), false)
})
