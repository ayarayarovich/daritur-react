import { AuthService } from '@/services'
import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory'

const me = createQueryKeys('me', {
  self: {
    queryKey: null,
    queryFn: AuthService.getMe,
  },
})

const Queries = mergeQueryKeys(me)

export default Queries
