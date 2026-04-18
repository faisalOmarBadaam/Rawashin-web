import { getServerMode } from '@core/utils/serverHelpers'

import ClientsPageWrapper from './ClientsPageWrapper'

const Clients = async () => {
  await getServerMode()

  return <ClientsPageWrapper />
}

export default Clients
