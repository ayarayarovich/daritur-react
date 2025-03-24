import NotFoundComponent from '@/components/not-found'
import { createRouter, RouterProvider } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'

// Create a new router instance
export const router = createRouter({ routeTree, defaultNotFoundComponent: NotFoundComponent })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export const Provider = () => {
  return <RouterProvider router={router} />
}

export type Routes = (typeof router)['routeTree']['fullPath']
