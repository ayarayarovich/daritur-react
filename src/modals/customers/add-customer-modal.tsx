import { useState } from 'react'
import { Heading } from 'react-aria-components'
import { Controller, useForm } from 'react-hook-form'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { Item, useAsyncList } from 'react-stately'

import Button from '@/components/ui/button'
import ComboBox from '@/components/ui/combobox'
import DateField from '@/components/ui/date-field'
import PhoneField from '@/components/ui/phone-field'
import TextArea from '@/components/ui/text-area'
import TextField from '@/components/ui/text-field'
import { requiredFieldRefine } from '@/lib/utils'
import { CustomersService } from '@/services'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDate } from '@internationalized/date'
import { z } from 'zod'

import { Query } from '@/shared'
import Queries from '@/shared/queries'

import BaseModal from '../base-modal'

const formSchema = z.object({
  id: z.number().nullable(),
  firstName: z.string().refine(...requiredFieldRefine()),
  lastName: z.string().refine(...requiredFieldRefine()),
  middleName: z.string().refine(...requiredFieldRefine()),
  phone: z
    .string()
    .transform((v) => v || null)
    .refine((v) => (v ? isValidPhoneNumber(v) : true), 'Некорректный номер'),
  email: z
    .string()
    .email()
    .or(z.literal(''))
    .transform((v) => v || null),
  birthday: z.instanceof(CalendarDate, { message: 'Обязательное поле' }).refine(...requiredFieldRefine()),
  passportSerial: z.string().refine(...requiredFieldRefine()),
  passportGivenAt: z.instanceof(CalendarDate, { message: 'Обязательное поле' }).refine(...requiredFieldRefine()),
  passportGivenBy: z.string().refine(...requiredFieldRefine()),
  passportActualUntil: z.instanceof(CalendarDate, { message: 'Обязательное поле' }).refine(...requiredFieldRefine()),
  passportAddress: z.string().refine(...requiredFieldRefine()),
  comment: z.string().refine(...requiredFieldRefine()),
})

interface Props {
  customerId: number | null
  onSelect?: (customer: { id: number; customerName: string }) => unknown
}

export default function AddCustomerModal(props: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const close = () => setIsOpen(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: (async () => {
      console.log(props.customerId)
      if (props.customerId) {
        const customer = await CustomersService.getCustomer({ id: props.customerId })
        return {
          ...customer,
        }
      }
      return {
        id: null,
        email: '',
        firstName: '',
        lastName: '',
        middleName: '',
        phone: '',
        passportSerial: '',
        passportGivenBy: '',
        passportAddress: '',
        comment: '',
      }
    }) as never,
  })

  const onSubmit = form.handleSubmit(
    async (vals) => {
      const hisId = vals.id
      if (!hisId) {
        const newCustomer = await CustomersService.createCustomer(vals)
        props.onSelect?.({
          id: newCustomer.id,
          customerName: [newCustomer.lastName, newCustomer.firstName, newCustomer.middleName].filter(Boolean).join(' '),
        })
        return
      }
      const updatedCustomer = await CustomersService.updateCustomer({
        ...vals,
        id: hisId,
      })
      // update here
      props.onSelect?.({
        id: hisId,
        customerName: [updatedCustomer.lastName, updatedCustomer.firstName, updatedCustomer.middleName].filter(Boolean).join(' '),
      })
    },
    (v) => console.log(v),
  )

  const availableCustomers = useAsyncList<{ id: number; name: string }>({
    async load({ filterText, signal }) {
      signal.addEventListener('abort', () => {
        console.log('cancel', filterText)
        Query.client.cancelQueries(Queries.customers.list({ search: filterText || '', offset: 0, limit: 20 }))
      })
      const { items } = await Query.client.fetchQuery(Queries.customers.list({ search: filterText || '', offset: 0, limit: 20 }))
      return {
        items: items.map((v) => ({
          id: v.id,
          name: [v.lastName, v.firstName, v.middleName].filter(Boolean).join(' '),
        })),
      }
    },
  })

  return (
    <>
      <Button type='button' size='sm' onPress={() => setIsOpen(true)}>
        Выбрать
      </Button>
      <BaseModal isOpen={isOpen} onOpenChange={(v) => !v && close()} size='xl2'>
        {() => (
          <form
            onSubmit={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
            className='flex flex-col items-stretch p-6'
          >
            <div className='relative mb-8'>
              <Heading slot='title' className='text-center'>
                Добавление заказчика
              </Heading>
            </div>
            <div className='mb-8'>
              <ComboBox
                label='Найти в базе'
                size='sm'
                grow
                items={availableCustomers.items}
                onInputChange={availableCustomers.setFilterText}
                inputValue={availableCustomers.filterText}
                onSelectionChange={(v) => {
                  if (!v) {
                    return
                  }

                  CustomersService.getCustomer({ id: Number(v) }).then((customer) => {
                    form.reset({
                      ...customer,
                    })
                  })
                }}
              >
                {(item) => <Item key={item.id.toString()}>{item.name}</Item>}
              </ComboBox>
            </div>
            <div className='mb-8 grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2 [&_p]:text-end'>
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

              <p>День рождения</p>
              <Controller
                control={form.control}
                name='birthday'
                render={({ field, fieldState }) => (
                  <DateField
                    size='sm'
                    label='День рождения'
                    intent='primary'
                    {...field}
                    value={(field.value || null) as never}
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
                    value={field.value ?? ''}
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
                    value={field.value ?? ''}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                  />
                )}
              />

              <h2 className='col-span-full mt-4 text-center'>Паспорт</h2>
              <p>Серия/номер</p>
              <Controller
                control={form.control}
                name='passportSerial'
                render={({ field, fieldState }) => (
                  <TextField
                    size='sm'
                    label='Серия/номер'
                    intent='primary'
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                  />
                )}
              />

              <p>Кем выдан</p>
              <Controller
                control={form.control}
                name='passportGivenBy'
                render={({ field, fieldState }) => (
                  <TextField
                    size='sm'
                    label='Кем выдан'
                    intent='primary'
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                  />
                )}
              />

              <p>Дата выдачи</p>
              <div className='flex items-center gap-4'>
                <Controller
                  control={form.control}
                  name='passportGivenAt'
                  render={({ field, fieldState }) => (
                    <div className='flex grow flex-col items-stretch'>
                      <DateField
                        size='sm'
                        label='Дата выдачи'
                        intent='primary'
                        {...field}
                        value={(field.value || null) as never}
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                      />
                    </div>
                  )}
                />
                <p>Актуален до</p>
                <Controller
                  control={form.control}
                  name='passportActualUntil'
                  render={({ field, fieldState }) => (
                    <div className='flex grow flex-col items-stretch'>
                      <DateField
                        size='sm'
                        label='Актуален до'
                        intent='primary'
                        {...field}
                        value={(field.value || null) as never}
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                      />
                    </div>
                  )}
                />
              </div>

              <p>Адрес рег.</p>
              <Controller
                control={form.control}
                name='passportAddress'
                render={({ field, fieldState }) => (
                  <TextField
                    size='sm'
                    label='Адрес рег.'
                    intent='primary'
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                  />
                )}
              />

              <p>Комментарий</p>
              <Controller
                control={form.control}
                name='comment'
                render={({ field, fieldState }) => (
                  <TextArea
                    size='sm'
                    label='Комментарий'
                    intent='primary'
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                  />
                )}
              />
            </div>
            <div className='flex items-center justify-end gap-2'>
              <Button
                size='sm'
                type='submit'
                onPress={() => {
                  onSubmit()
                }}
                intent='primary'
                isDisabled={form.formState.isSubmitting}
              >
                Сохранить и выбрать
              </Button>
            </div>
          </form>
        )}
      </BaseModal>
    </>
  )
}
