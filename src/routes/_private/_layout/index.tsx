import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Navigate to='/staffs' />
}
