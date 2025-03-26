import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

import Button from '@/components/ui/button'
import TextField from '@/components/ui/text-field'
import { extractErrorMessageFromAPIError } from '@/lib/utils'
import { ResetPasswordModal } from '@/modals'
import { AuthService } from '@/services'
import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

export const Route = createFileRoute('/_public/login/')({
  component: RouteComponent,
  beforeLoad: () => {
    const tokens = AuthService.getUserData()
    const isSignedIn = !!tokens?.accessToken
    if (isSignedIn) {
      throw redirect({ to: '/' })
    }
  },
})

function RouteComponent() {
  const resetPasswordModal = ResetPasswordModal.use()

  const navigate = Route.useNavigate()
  const formScheme = useMemo(
    () =>
      z.object({
        username: z.string().refine((v) => !!v, 'Обязательное поле'),
        password: z.string().refine((v) => !!v, 'Обязательное поле'),
      }),
    [],
  )
  const form = useForm<z.infer<typeof formScheme>>({
    resolver: zodResolver(formScheme),
    defaultValues: {
      username: '',
      password: '',
    },
  })
  const onSubmit = form.handleSubmit(
    async (v) => {
      await toast.promise(AuthService.login(v), {
        loading: 'Секунду...',
        error: (v) => extractErrorMessageFromAPIError(v) || 'Что-то пошло не так',
      })
      navigate({ to: '/' })
    },
    () => {
      toast.error('Некорректные данные. Проверьте форму')
    },
  )
  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4'>
      <div className='grow'></div>
      <img src='/logo.svg' alt='logo' className='mb-6 w-60' />
      <form onSubmit={onSubmit} className='bg-gray-6 :lg:gap-6 flex w-full max-w-sm flex-col items-stretch gap-4 rounded-xl p-6 lg:p-10'>
        <Controller
          control={form.control}
          name='username'
          render={({ field, fieldState }) => <TextField label='Логин' intent='primary' {...field} isInvalid={fieldState.invalid} />}
        />
        <Controller
          control={form.control}
          name='password'
          render={({ field, fieldState }) => (
            <TextField label='Пароль' intent='primary' {...field} isInvalid={fieldState.invalid} type='password' />
          )}
        />
        <div className='flex flex-col items-stretch gap-2'>
          <Button type='submit' isDisabled={form.formState.isSubmitting || form.formState.isSubmitSuccessful}>
            Войти
          </Button>
          <div className='self-center'>
            <Button
              type='button'
              intent='link'
              size='linkMd'
              onPress={() => resetPasswordModal.open()}
              isDisabled={form.formState.isSubmitting || form.formState.isSubmitSuccessful}
            >
              Забыли пароль?
            </Button>
          </div>
        </div>
      </form>
      <div className='grow'></div>
      <div className='text-gray-4'>version: {__APP_VERSION__}</div>
    </div>
  )
}
