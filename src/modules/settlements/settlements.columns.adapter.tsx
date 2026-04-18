import { clientSettlments } from '@/views/settlements/components/clientSettlments'
import { getSettlementColumns } from '@/views/settlements/components/settlements.columns'

/**
 * Legacy compatibility adapter.
 * Keeps module layer decoupled from direct `views/*` imports.
 */
export const settlementsColumnsAdapter = {
  list: getSettlementColumns,
  clientList: clientSettlments,
}
