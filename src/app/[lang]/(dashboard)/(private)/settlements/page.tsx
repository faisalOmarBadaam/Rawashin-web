import { getServerMode } from '@core/utils/serverHelpers'

import SettlementsPageWrapper from './SettlementsPageWrapper'

const Settlements = async () => {
  await getServerMode()

  return <SettlementsPageWrapper />
}

export default Settlements
