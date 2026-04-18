'use client'

import MarchentSettlementDetails from './MarchentSettlementDetails'

type Props = {
  settlementId: string
}

export default function MerchantSettlementViewPage({ settlementId }: Props) {
  return <MarchentSettlementDetails settlementId={settlementId} />
}
