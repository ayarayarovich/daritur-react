import { useCallback } from 'react'

import Button from '@/components/ui/button'
import { AuthService } from '@/services'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/')({
  component: RouteComponent,
})

function RouteComponent() {
  const logout = useCallback(() => {
    AuthService.logout()
  }, [])
  return (
    <div>
      <div className='mb-4'>salam</div>
      <div>
        <Button intent='secondary' type='button' onPress={logout}>
          Выйти
        </Button>
      </div>
    </div>
  )
}
