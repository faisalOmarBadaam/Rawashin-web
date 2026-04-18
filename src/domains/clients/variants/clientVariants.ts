export type ClientVariant = 'clients' | 'employees' | 'users' | 'merchants'

export type ClientVariantConfig = {
  allowedTypes: number[]
  fixedType?: number
  allowTypeSelection: boolean
  showAuthFields?: boolean
  routeKey: 'clients' | 'employees' | 'users' | 'merchants'
}

// Phase 1 scaffold only: not wired into runtime yet.
export const CLIENT_VARIANTS: Record<ClientVariant, ClientVariantConfig> = {
  clients: {
    allowedTypes: [0, 1, 2],
    allowTypeSelection: true,
    routeKey: 'clients',
  },
  employees: {
    allowedTypes: [0],
    fixedType: 0,
    allowTypeSelection: false,
    routeKey: 'employees',
  },
  users: {
    allowedTypes: [3, 4, 5, 6],
    allowTypeSelection: true,
    routeKey: 'users',
  },
  merchants: {
    allowedTypes: [1],
    fixedType: 1,
    allowTypeSelection: false,
    routeKey: 'merchants',
  },
}

export const getVariantConfig = (variant: ClientVariant): ClientVariantConfig =>
  CLIENT_VARIANTS[variant]

export const isTypeAllowed = (variant: ClientVariant, clientType: number): boolean => {
  return getVariantConfig(variant).allowedTypes.includes(clientType)
}

type UnknownObject = object

export const applyVariantToListQuery = <TQuery extends UnknownObject>(
  variant: ClientVariant,
  query: TQuery,
): TQuery => {
  const config = getVariantConfig(variant)

  if (config.fixedType !== undefined) {
    if ('ClientType' in query) {
      return { ...query, ClientType: config.fixedType } as TQuery
    }

    if ('clientType' in query) {
      return { ...query, clientType: config.fixedType } as TQuery
    }

    return { ...query, ClientType: config.fixedType } as TQuery
  }

  if ('ClientType' in query) {
    const current = query.ClientType

    if (typeof current === 'number' && config.allowedTypes.includes(current)) {
      return query
    }

    return { ...query, ClientType: config.allowedTypes[0] } as TQuery
  }

  if ('clientType' in query) {
    const current = query.clientType

    if (typeof current === 'number' && config.allowedTypes.includes(current)) {
      return query
    }

    return { ...query, clientType: config.allowedTypes[0] } as TQuery
  }

  return { ...query, ClientType: config.allowedTypes[0] } as TQuery
}

export const applyVariantToCreateOrUpdateDto = <TDto extends UnknownObject>(
  variant: ClientVariant,
  dto: TDto,
): TDto => {
  const config = getVariantConfig(variant)

  if (config.fixedType === undefined) return dto

  if ('clientType' in dto) {
    return { ...dto, clientType: config.fixedType } as TDto
  }

  if ('ClientType' in dto) {
    return { ...dto, ClientType: config.fixedType } as TDto
  }

  return { ...dto, clientType: config.fixedType } as TDto
}
