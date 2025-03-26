import { Toaster } from 'react-hot-toast'

import { Utils } from '@/lib'
import { MessageModal, ResetPasswordModal } from '@/modals'
import { ModalRenderer } from '@ayarayarovich/react-modals'
import { createRootRoute, Outlet } from '@tanstack/react-router'

export const Route = createRootRoute({
  beforeLoad: async () => {
    await Utils.preloadImages(['/logo.svg'])
  },
  component: () => (
    <>
      <ModalRenderer Component={MessageModal.Component} />
      <ModalRenderer Component={ResetPasswordModal.Component} />

      <Toaster />
      <Outlet />
    </>
  ),
})
