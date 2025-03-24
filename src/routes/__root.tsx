import { Toaster } from 'react-hot-toast'

import { Utils } from '@/lib'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  beforeLoad: async () => {
    await Utils.preloadImages(['/logo.svg'])
  },
  component: () => (
    <>
      <Toaster />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
