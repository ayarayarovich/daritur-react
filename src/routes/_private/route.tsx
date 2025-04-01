import { CreateStaffModal, UpdateStaffModal } from '@/modals'
import { AuthService } from '@/services'
import { ModalRenderer } from '@ayarayarovich/react-modals'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { Query } from '@/shared'
import Queries from '@/shared/queries'

export const Route = createFileRoute('/_private')({
  component: RouteComponent,
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

function RouteComponent() {
  return (
    <>
      <Outlet />

      <ModalRenderer Component={CreateStaffModal.Component} />
      <ModalRenderer Component={UpdateStaffModal.Component} />
    </>
  )
}
