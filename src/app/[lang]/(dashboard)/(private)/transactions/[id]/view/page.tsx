import { getServerMode } from '@core/utils/serverHelpers'

import TransactionViewPageWrapper from './TransactionViewPageWrapper'

type Props = {
  params: Promise<{ id: string }>
}

const TransactionViewPage = async ({ params }: Props) => {
  await getServerMode()
  const { id } = await params

  return <TransactionViewPageWrapper id={id} />
}

export default TransactionViewPage
