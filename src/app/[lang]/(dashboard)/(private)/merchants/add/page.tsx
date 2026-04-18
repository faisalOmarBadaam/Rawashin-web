import { getServerMode } from '@core/utils/serverHelpers'

import AddSubMerchantWrapper from './AddSubMerchantWrapper'

const AddSubMerchantPage = async () => {
  await getServerMode()

  return <AddSubMerchantWrapper />
}

export default AddSubMerchantPage
