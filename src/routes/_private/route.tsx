import { AuthService } from '@/services'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_private')({
  beforeLoad: async () => {
    const tokens = AuthService.getUserData()
    const isSignedIn = !!tokens?.accessToken
    if (!isSignedIn) {
      throw redirect({ to: '/login' })
    }
  },
})
