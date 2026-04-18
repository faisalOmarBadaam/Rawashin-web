export type FilterFieldType = 'text' | 'select' | 'date' | 'range' | 'autocomplete'

export type FilterOption = {
  label: string
  value: string | number
}

export type FilterFieldSchema<TQuery extends Record<string, unknown>> = {
  key: keyof TQuery
  type: FilterFieldType
  label?: string
  placeholder?: string
  options?: FilterOption[]
}
