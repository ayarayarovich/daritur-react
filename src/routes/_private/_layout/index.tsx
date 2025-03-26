import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/_layout/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='p-5'>
      {[...Array(200)].map(() => (
        <div className='mb-4'>salam</div>
      ))}
    </div>
  )
}
