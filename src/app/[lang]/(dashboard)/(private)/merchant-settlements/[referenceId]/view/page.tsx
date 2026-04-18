import { getServerMode } from '@core/utils/serverHelpers'

import MerchantSettlementViewPageWrapper from './MerchantSettlementViewPageWrapper'

type Props = {
  params: Promise<{
    referenceId: string
  }>
}

export default async function MerchantSettlementDetailsRoute({ params }: Props) {
  await getServerMode()

  const { referenceId } = await params

  return <MerchantSettlementViewPageWrapper settlementId={referenceId} />
}
