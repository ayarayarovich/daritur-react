import { Heading } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { Item } from 'react-stately'

import Button from '@/components/ui/button'
import PhoneField from '@/components/ui/phone-field'
import Select from '@/components/ui/select'
import TextField from '@/components/ui/text-field'
import { requiredFieldRefine } from '@/lib/utils'
import BaseModal from '@/modals/base-modal'
import { StaffService } from '@/services'
import { useModalInstance } from '@ayarayarovich/react-modals'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { omit } from 'radashi'
import { z } from 'zod'

import { Query } from '@/shared'
import Queries from '@/shared/queries'

export type Data = {
  staffId: number
}

const formSchema = z.object({
  id: z.number(),
  firstName: z.string().refine(...requiredFieldRefine()),
  lastName: z.string().refine(...requiredFieldRefine()),
  middleName: z.string().refine(...requiredFieldRefine()),
  phone: z
    .string()
    .refine(...requiredFieldRefine())
    .refine(isValidPhoneNumber, 'Некорректный номер'),
  email: z.string().refine(...requiredFieldRefine()),
  password: z.string().optional(),
  officeId: z.number().refine(...requiredFieldRefine()),
})

export default function UpdateStaffModalComponent() {
  const { isOpen, close, data } = useModalInstance<Data>()

  const officesQuery = useQuery(Queries.offices.all)

  const detailQueryDescriptor = Queries.employees.detail({ id: data.staffId })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: () => Query.client.fetchQuery(detailQueryDescriptor),
  })

  const detailQuery = useQuery(detailQueryDescriptor)
  const hasAPISentWrongData = detailQuery.isError

  const mutation = useMutation({
    mutationFn: StaffService.updateEmployee,
    onSuccess: async () => {
      toast.success('Успешно')
      await Query.client.invalidateQueries({
        queryKey: Queries.employees._def,
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
            <Heading slot='title'>Изменить сотрудника №{data.staffId}</Heading>
          </div>
          {hasAPISentWrongData && (
            <div className='mb-4 rounded-lg bg-red-400/10 px-4 py-2'>
              <p className='text-sm text-red-400'>
                <span className='font-semibold'>Внимание!</span> Некорректный формат данных с API
              </p>
            </div>
          )}
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

            <p>Офис</p>
            <Controller
              control={form.control}
              name='officeId'
              render={({ field, fieldState }) => (
                <Select
                  size='sm'
                  label='Офис'
                  intent='primary'
                  items={officesQuery.data?.items || []}
                  onSelectionChange={(v) => field.onChange(Number(v))}
                  selectedKey={field.value?.toString()}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  isDisabled={!officesQuery.data?.items.length || field.disabled}
                  {...omit(field, ['disabled', 'onChange', 'value', 'ref'])}
                >
                  {(item) => <Item key={item.id}>{item.name}</Item>}
                </Select>
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
              <Button
                size='sm'
                type='button'
                intent='ghost'
                isDisabled={form.formState.isSubmitting || form.formState.isLoading}
                onPress={() => form.reset()}
              >
                Сбросить
              </Button>
            )}
            <Button size='sm' type='submit' intent='primary' isDisabled={form.formState.isSubmitting || form.formState.isLoading}>
              Сохранить
            </Button>
          </div>
        </form>
      )}
    </BaseModal>
  )
}
