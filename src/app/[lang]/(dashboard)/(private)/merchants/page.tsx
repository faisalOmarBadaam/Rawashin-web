import { getServerMode } from '@core/utils/serverHelpers'

import MerchantsPageWrapper from './MerchantsPageWrapper'

const Merchants = async () => {
  await getServerMode()

  return <MerchantsPageWrapper />
}

export default Merchants
