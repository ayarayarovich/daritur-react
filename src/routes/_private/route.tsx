import { AuthService } from '@/services'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { Query } from '@/shared'
import Queries from '@/shared/queries'

export const Route = createFileRoute('/_private')({
  beforeLoad: async () => {
    const tokens = AuthService.getUserData()
    const isSignedIn = !!tokens?.accessToken
    if (!isSignedIn) {
      throw redirect({ to: '/login' })
    }
  },
  loader: async () => {
    await Query.client.fetchQuery(Queries.me.self)
  },
})
