import { getServerMode } from '@core/utils/serverHelpers'

import TransactionsPageWrapper from './TransactionsPageWrapper'

const Transactions = async () => {
  await getServerMode()

  return <TransactionsPageWrapper />
}

export default Transactions
