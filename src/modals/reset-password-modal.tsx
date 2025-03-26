import { Heading } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'

import Button from '@/components/ui/button'
import TextField from '@/components/ui/text-field'
import { extractErrorMessageFromAPIError } from '@/lib/utils'
import { AuthService } from '@/services'
import { useModalInstance } from '@ayarayarovich/react-modals'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import BaseModal from './base-modal'

export type Data = never

const formSchema = z.object({
  email: z.string().email(),
})

export default function ResetPasswordModalComponent() {
  const { isOpen, close } = useModalInstance<Data>()
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = form.handleSubmit(
    async (v) => {
      await toast.promise(AuthService.resetPassword(v), {
        loading: 'Секунду...',
        error: (v) => extractErrorMessageFromAPIError(v) || 'Что-то пошло не так',
      })
    },
    () => {
      toast.error('Некорректные данные. Проверьте форму')
    },
  )

  return (
    <BaseModal isOpen={isOpen} onOpenChange={(v) => !v && close()}>
      <form onSubmit={onSubmit} className='flex flex-col items-stretch gap-5 p-10'>
        <Heading slot='title' className='text-gray-1 text-center text-xl'>
          Восстановление пароля
        </Heading>
        <div className='text-gray-1'>Введите email, на который будет отправлена информация для восстановления пароля.</div>
        <Controller
          control={form.control}
          name='email'
          render={({ field, fieldState }) => <TextField label='Email' {...field} isInvalid={fieldState.invalid} />}
        />
        <Button
          type='submit'
          intent={form.formState.isSubmitSuccessful ? 'secondary' : 'primary'}
          isDisabled={form.formState.isSubmitSuccessful}
        >
          Отправить
        </Button>
        {form.formState.isSubmitSuccessful && <div>Готово. Проверьте почту и следуйте инструкции из письма на ваше email.</div>}
      </form>
    </BaseModal>
  )
}
