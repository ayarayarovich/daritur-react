import { Heading } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { isValidPhoneNumber } from 'react-phone-number-input'

import Button from '@/components/ui/button'
import PhoneField from '@/components/ui/phone-field'
import TextField from '@/components/ui/text-field'
import { requiredFieldRefine } from '@/lib/utils'
import BaseModal from '@/modals/base-modal'
import { StaffService } from '@/services'
import { useModalInstance } from '@ayarayarovich/react-modals'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { z } from 'zod'

import { Query } from '@/shared'
import Queries from '@/shared/queries'

export type Data = never

const formSchema = z.object({
  name: z.string().refine(...requiredFieldRefine()),
  description: z.string().refine(...requiredFieldRefine()),
  phone: z
    .string()
    .refine(...requiredFieldRefine())
    .refine(isValidPhoneNumber, 'Некорректный номер'),
  email: z.string().refine(...requiredFieldRefine()),
  inn: z.string().refine(...requiredFieldRefine()),
  cityId: z.number().refine(...requiredFieldRefine()),
})

export default function CreateStaffModalComponent() {
  const { isOpen, close } = useModalInstance<Data>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      phone: '',
      name: '',
      description: '',
      inn: '',
      cityId: 1,
    },
  })

  const mutation = useMutation({
    mutationFn: StaffService.createOffice,
    onSuccess: async () => {
      toast.success('Успешно')
      await Query.client.invalidateQueries({
        queryKey: Queries.offices._def,
      })
      close()
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
            <Heading slot='title'>Добавить офис</Heading>
          </div>
          <div className='mb-8 grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2 [&_p]:text-end'>
            <p>Название</p>
            <Controller
              control={form.control}
              name='name'
              render={({ field, fieldState }) => (
                <TextField
                  size='sm'
                  label='Название'
                  intent='primary'
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />

            <p>Описание</p>
            <Controller
              control={form.control}
              name='description'
              render={({ field, fieldState }) => (
                <TextField
                  size='sm'
                  label='Описание'
                  intent='primary'
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />

            <p>ИНН</p>
            <Controller
              control={form.control}
              name='inn'
              render={({ field, fieldState }) => (
                <TextField
                  size='sm'
                  label='ИНН'
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
