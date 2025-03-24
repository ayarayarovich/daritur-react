import { Link, NotFoundRouteComponent } from '@tanstack/react-router'

const NotFoundComponent: NotFoundRouteComponent = () => {
  return (
    <div className='flex h-screen w-full flex-col items-center justify-center gap-8 p-4 text-center leading-none'>
      <img src='/logo.svg' alt='logo' className='w-60' />
      <strong className='text-8xl font-bold'>404</strong>
      <p>Такой страницы не существует</p>
      <Link to='/' replace>
        На главную
      </Link>
    </div>
  )
}

export default NotFoundComponent
