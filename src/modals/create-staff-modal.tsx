import { Heading } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { isValidPhoneNumber } from 'react-phone-number-input'

import Button from '@/components/ui/button'
import PhoneField from '@/components/ui/phone-field'
import TextField from '@/components/ui/text-field'
import { requiredFieldRefine } from '@/lib/utils'
import { StaffService } from '@/services'
import { useModalInstance } from '@ayarayarovich/react-modals'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import { Query } from '@/shared'
import Queries from '@/shared/queries'

import BaseModal from './base-modal'

export type Data = never

const formSchema = z.object({
  firstName: z.string().refine(...requiredFieldRefine()),
  lastName: z.string().refine(...requiredFieldRefine()),
  middleName: z.string().refine(...requiredFieldRefine()),
  phone: z
    .string()
    .refine(...requiredFieldRefine())
    .refine(isValidPhoneNumber, 'Некорректный номер'),
  email: z.string().refine(...requiredFieldRefine()),
  password: z.string().refine(...requiredFieldRefine()),
  // officeId: z.number(),
})

export default function CreateStaffModalComponent() {
  const { isOpen, close } = useModalInstance<Data>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      middleName: '',
      password: '',
      phone: '',
    },
  })

  const mutation = useMutation({
    mutationFn: StaffService.createEmployee,
    onSuccess: () => {
      toast.success('Успешно')
      Query.client.invalidateQueries({
        queryKey: Queries.employees._def,
      })
    },
    onError: () => {
      toast.error('Ошибка')
    },
  })

  const onSubmit = form.handleSubmit(async (vals) => {
    await mutation.mutateAsync(vals)
  })

  return (
    <BaseModal isOpen={isOpen} onOpenChange={(v) => !v && close()}>
      {() => (
        <form onSubmit={onSubmit} className='flex flex-col items-stretch p-6'>
          <div className='relative mb-8'>
            <Heading slot='title'>Добавить сотрудника</Heading>
          </div>
          <div className='mb-8 grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2 [&_p]:text-end'>
            <p>Имя</p>
            <Controller
              control={form.control}
              name='firstName'
              render={({ field, fieldState }) => (
                <TextField
                  size='sm'
                  label='Имя'
                  intent='primary'
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />

            <p>Фамилия</p>
            <Controller
              control={form.control}
              name='lastName'
              render={({ field, fieldState }) => (
                <TextField
                  size='sm'
                  label='Фамилия'
                  intent='primary'
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />

            <p>Отчество</p>
            <Controller
              control={form.control}
              name='middleName'
              render={({ field, fieldState }) => (
                <TextField
                  size='sm'
                  label='Отчество'
                  intent='primary'
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />

            <p>Телефон</p>
            <Controller
              control={form.control}
              name='phone'
              render={({ field, fieldState }) => (
                <PhoneField
                  size='sm'
                  label='Телефон'
                  intent='primary'
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />

            <p>Email</p>
            <Controller
              control={form.control}
              name='email'
              render={({ field, fieldState }) => (
                <TextField
                  size='sm'
                  label='Email'
                  intent='primary'
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />

            <p>Пароль</p>
            <Controller
              control={form.control}
              name='password'
              render={({ field, fieldState }) => (
                <TextField
                  size='sm'
                  label='Пароль'
                  type='password'
                  intent='primary'
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />
          </div>
          <div className='flex items-center justify-end gap-2'>
            {form.formState.isDirty && (
              <Button size='sm' type='button' intent='ghost' isDisabled={form.formState.isSubmitting} onPress={() => form.reset()}>
                Сбросить
              </Button>
            )}
            <Button size='sm' type='submit' intent='primary' isDisabled={form.formState.isSubmitting}>
              Сохранить
            </Button>
          </div>
        </form>
      )}
    </BaseModal>
  )
}
