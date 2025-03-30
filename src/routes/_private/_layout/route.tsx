import { HiOutlineUsers } from 'react-icons/hi'
import { HiOutlineArrowRightOnRectangle } from 'react-icons/hi2'

import Button from '@/components/ui/button'
import { AuthService } from '@/services'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

import Queries from '@/shared/queries'

export const Route = createFileRoute('/_private/_layout')({
  component: RouteComponent,
})

function RouteComponent() {
  const meQuery = useSuspenseQuery(Queries.me.self)

  return (
    <div className='pl-44'>
      <div className='fixed inset-y-0 left-0 flex h-full w-44 flex-col items-stretch overflow-auto bg-teal-700 py-5 text-white'>
        <div className='mb-4 px-5'>
          <img src='/logo.svg' alt='logo' className='w-full' />
        </div>
        <div className='mb-4 px-5 text-center text-base font-bold'>DariTur Admin</div>
        <div className='flex grow flex-col items-stretch gap-2'>
          <Link
            to='/staffs'
            className='data-[status=active]:text-gray-1 flex items-center gap-1 px-5 py-1 text-sm text-white data-[status=active]:bg-white'
          >
            <HiOutlineUsers />
            Сотрудники
          </Link>
        </div>
        <div className='px-5'>
          <div className='text-sm font-medium'>{meQuery.data.role}</div>
          <div className='mb-4 text-xs font-light'>
            {[meQuery.data.lastName, meQuery.data.firstName, meQuery.data.middleName].filter(Boolean).join(' ')}
          </div>
          <Button className='flex items-center justify-center gap-1' type='button' size='xs' onPress={() => AuthService.logout()}>
            <HiOutlineArrowRightOnRectangle className='text-[1.2em]' />
            Выйти
          </Button>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
