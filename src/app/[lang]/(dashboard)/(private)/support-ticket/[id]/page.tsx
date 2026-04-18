import SupportTicketDetailsWrapper from './SupportTicketDetailsWrapper'

type Props = {
  params: Promise<{
    id: string
  }>
  searchParams?: Promise<{
    clientId?: string
  }>
}

export default async function SupportTicketPage({ params, searchParams }: Props) {
  const { id } = await params
  const resolvedSearchParams = await searchParams

  return <SupportTicketDetailsWrapper id={id} clientId={resolvedSearchParams?.clientId} />
}
