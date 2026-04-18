import { getServerMode } from '@core/utils/serverHelpers'

import StatisticsPageWrapper from './StatisticsPageWrapper'

const StatisticsPage = async () => {
  await getServerMode()

  return <StatisticsPageWrapper />
}

export default StatisticsPage
