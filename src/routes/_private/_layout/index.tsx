import toast from 'react-hot-toast'

import { createFileRoute, redirect } from '@tanstack/react-router'

import { Query } from '@/shared'
import Queries from '@/shared/queries'

export const Route = createFileRoute('/_private/_layout/')({
  beforeLoad: async () => {
    const menu = await Query.client.fetchQuery(Queries.me.menu)
    const first = menu[0]
    if (!first) {
      toast.error('У вас нет доступов!')
    }
    throw redirect({ to: `/${first.path}` })
  },
})
