import { getServerMode } from '@core/utils/serverHelpers'

import MerchantSettlementsPageWrapper from './MerchantSettlementsPageWrapper'

const MerchantSettlementsPage = async () => {
  await getServerMode()

  return <MerchantSettlementsPageWrapper />
}

export default MerchantSettlementsPage
