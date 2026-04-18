import { getServerMode } from '@core/utils/serverHelpers'

import SupportTicketPageWrapper from './SupportTicketPageWrapper'

const SupportTicket = async () => {
  await getServerMode()

  return <SupportTicketPageWrapper />
}

export default SupportTicket
