import { getServerMode } from '@core/utils/serverHelpers'

import UsersPageWrapper from './UsersPageWrapper'

const Users = async () => {
  await getServerMode()

  return <UsersPageWrapper />
}

export default Users
