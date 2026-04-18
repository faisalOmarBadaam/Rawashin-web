import { getServerMode } from '@core/utils/serverHelpers'
import AuditLogsPageWrapper from './AuditLogsPageWrapper'


const AuditLogs = async () => {
  await getServerMode()

  return <AuditLogsPageWrapper />
}

export default AuditLogs
