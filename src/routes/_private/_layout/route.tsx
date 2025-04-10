import { HiOutlineBriefcase, HiOutlineOfficeBuilding, HiOutlineShieldCheck, HiOutlineUsers } from 'react-icons/hi'
import { HiOutlineArrowRightOnRectangle } from 'react-icons/hi2'

import 'react-icons/hi2'

import Button from '@/components/ui/button'
import { AuthService } from '@/services'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

import { Query } from '@/shared'
import Queries from '@/shared/queries'

export const Route = createFileRoute('/_private/_layout')({
  component: RouteComponent,
  loader: async () => {
    await Query.client.prefetchQuery(Queries.me.menu)
  },
})

function RouteComponent() {
  const meQuery = useSuspenseQuery(Queries.me.self)
  const menuQuery = useSuspenseQuery(Queries.me.menu)

  return (
    <div className='pl-44'>
      <div className='fixed inset-y-0 left-0 z-20 flex h-full w-44 flex-col items-stretch overflow-auto bg-teal-700 py-5 text-white'>
        <div className='mb-4 px-5'>
          <img src='/logo.svg' alt='logo' className='w-full' />
        </div>
        <div className='mb-4 px-5 text-center text-base font-bold'>DariTur Admin</div>
        <div className='flex grow flex-col items-stretch gap-2'>
          {menuQuery.data.map((v) => (
            <Link
              to={`/${v.path}` as never}
              key={v.path}
              className='data-[status=active]:text-gray-1 flex items-center gap-1 px-5 py-1 text-sm font-semibold text-white data-[status=active]:bg-white'
            >
              {v.path === 'tours' && <HiOutlineBriefcase className='text-[1.2em]' />}
              {v.path === 'booking' && <HiOutlineShieldCheck className='text-[1.2em]' />}
              {v.path === 'hotels' && <HiOutlineOfficeBuilding className='text-[1.2em]' />}
              {v.path === 'excursions' && <HiOutlineBriefcase className='text-[1.2em]' />}
              {v.path === 'offices' && <HiOutlineOfficeBuilding className='text-[1.2em]' />}
              {v.path === 'staffs' && <HiOutlineUsers className='text-[1.2em]' />}
              {v.title}
            </Link>
          ))}
        </div>
        <div className='mb-4 px-5'>
          <div className='text-sm font-medium'>{meQuery.data.role}</div>
          <div className='mb-4 text-xs font-light'>
            {[meQuery.data.lastName, meQuery.data.firstName, meQuery.data.middleName].filter(Boolean).join(' ')}
          </div>
          <Button className='flex items-center justify-center gap-1' type='button' size='xs' onPress={() => AuthService.logout()}>
            <HiOutlineArrowRightOnRectangle className='text-[1.2em]' />
            Выйти
          </Button>
        </div>
        <div className='px-5 text-center text-sm opacity-50'>version: {__APP_VERSION__}</div>
      </div>
      <Outlet />
    </div>
  )
}
