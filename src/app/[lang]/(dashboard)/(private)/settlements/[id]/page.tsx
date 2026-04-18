import ViewEditSettlementWrapper from './ViewEditSettlementWrapper'

type Props = {
  params: Promise<{
    id: string
  }>
  searchParams?: Promise<{
    mode?: 'view' | 'edit'
  }>
}

export default async function SettlementPage({
  params,
  searchParams
}: Props) {
  const { id } = await params
  const resolvedSearchParams = await searchParams

  const pageMode =
    resolvedSearchParams?.mode === 'edit' ? 'edit' : 'view'

  return (
    <ViewEditSettlementWrapper
      id={id}
      mode={pageMode}
    />
  )
}
