import { Fragment } from 'react'
import { Controller, FormProvider, SubmitErrorHandler, SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { HiOutlineUpload } from 'react-icons/hi'
import { HiArrowLeft } from 'react-icons/hi2'
import { LuLoader, LuPlus } from 'react-icons/lu'
import { Item } from 'react-stately'

import BusSeatSelector from '@/components/bus-seat-selector'
import Button from '@/components/ui/button'
import Select from '@/components/ui/select'
import { ApproveTypes, FoodTypes, TourTypes } from '@/constants'
import { boxCva } from '@/cvas'
import { cn, extractErrorMessageFromAPIError } from '@/lib/utils'
import AddCustomerModal from '@/modals/customers/add-customer-modal'
import { BookingService } from '@/services'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { omit } from 'radashi'
import { z } from 'zod'

import { Query } from '@/shared'
import Queries from '@/shared/queries'

export const Route = createFileRoute('/_private/_layout/booking_/$id')({
  component: RouteComponent,
  beforeLoad: ({ params }) => {
    const paramsScheme = z.object({
      id: z.coerce.number(),
    })
    return {
      params: paramsScheme.parse(params),
    }
  },
})

const formScheme = z.object({
  bookingId: z.number(),
  tourId: z.number(),
  startPointId: z.number(),
  hotelPointId: z.number().nullable(),
  routeId: z.number(),
  customers: z
    .object({
      customerId: z.number(),
      customerName: z.string(),
      seatNumber: z.number().nullable(),
    })
    .array(),
})

function RouteComponent() {
  const ctx = Route.useRouteContext()
  const navigate = Route.useNavigate()

  const booking = useQuery(Queries.booking.detail({ id: ctx.params.id }))
  const prepareDate = useQuery({
    ...Queries.booking.prepareDate({ tour_id: booking.data?.tour.id ?? 0 }),
    enabled: !!booking.data?.tour.id,
  })

  const form = useForm<z.infer<typeof formScheme>>({
    resolver: zodResolver(formScheme),
    defaultValues: async () => {
      const booking = await Query.client.fetchQuery(Queries.booking.detail({ id: ctx.params.id }))
      const routeId = booking.tour.route.find((v) => !!v.hotels.find((h) => h.hotel.id === booking.hotelPoint.hotel.id))?.id
      if (!routeId) {
        toast.error('Маршрут не найден')
        throw new Error('Route not found')
      }
      return {
        bookingId: booking.id,
        tourId: booking.tour.id,
        startPointId: booking.startPoint.id,
        hotelPointId: booking.hotelPoint.id,
        routeId: routeId,
        customers: booking.customers.map((v) => ({
          customerId: v.customer.id,
          customerName: `${v.customer.lastName} ${v.customer.firstName} ${v.customer.middleName}`,
          seatNumber: v.seatNumber,
        })),
      }
    },
    disabled: !booking.data?.tour.id,
  })

  const customersFieldArray = useFieldArray({
    control: form.control,
    name: 'customers',
    keyName: 'key',
  })

  const submitHandler: SubmitHandler<z.infer<typeof formScheme>> = async (vals) => {
    const action = async () => {
      return BookingService.updateBooking(vals)
    }
    await toast.promise(action(), {
      loading: 'Секунду...',
      success: 'Успешно',
      error: (v) => extractErrorMessageFromAPIError(v) || 'Что-то пошло не так',
    })
    Query.client.invalidateQueries({
      queryKey: Queries.booking._def,
    })
    navigate({ to: '..' })
  }

  const errorHandler: SubmitErrorHandler<z.infer<typeof formScheme>> = (v) => {
    console.log(v)
    toast.error('Форма не валидна')
  }

  const formValues = form.watch()
  const currentRoute = prepareDate.data?.tour.route.find((v) => v.id === formValues.routeId)

  const onSubmit = form.handleSubmit(submitHandler, errorHandler)

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className='flex flex-col items-stretch gap-4 px-5 py-22'>
        <div className='flex'>
          <Button
            type='button'
            onPress={() => navigate({ to: '..' })}
            size='sm'
            intent='ghost'
            className='flex items-center justify-center gap-1'
          >
            <HiArrowLeft />
            Вернуться
          </Button>
        </div>
        <div className='mb-4 flex items-center gap-4'>
          <h1 className='text-xl font-medium'>Оформление новой заявки</h1>
          <LuLoader className={cn('animate-spin opacity-0 transition-opacity', prepareDate.isLoading && 'opacity-100')} />
        </div>
        <div className='w-min min-w-2xl'>
          <div className='mb-8 grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2'>
            {prepareDate.data && (
              <>
                <p>Название</p>
                <div className={boxCva({})}>{prepareDate.data.tour.name}</div>
                <p>Оператор</p>
                <div className='flex items-center gap-4'>
                  <div className={boxCva({ className: 'grow' })}>{prepareDate.data.tour.operator.name}</div>
                  <p>№ тура</p>
                  <div className={boxCva({})}>{prepareDate.data.tour.id}</div>
                </div>
                <p>Тур</p>
                <div className={boxCva({})}>{TourTypes[prepareDate.data.tour.type as never]}</div>
                <p>Статус</p>
                <div className={cn('w-fit rounded-lg border-2 border-transparent bg-teal-100 px-4 py-1 text-sm text-teal-700')}>
                  {ApproveTypes[prepareDate.data.tour.approveType]}
                </div>

                <h2 className='col-span-full mt-8 font-medium'>Заказчики ({customersFieldArray.fields.length})</h2>
                {customersFieldArray.fields.map((v, idx) => (
                  <Fragment key={v.key}>
                    <p>ФИО</p>
                    <div className='flex items-center gap-2'>
                      <div className={boxCva({ className: 'grow' })}>{v.customerName ?? '...'}</div>
                      <AddCustomerModal
                        customerId={v.customerId ?? null}
                        onSelect={(selected) =>
                          customersFieldArray.update(idx, {
                            customerId: selected.id,
                            seatNumber: v.seatNumber,
                            customerName: selected.customerName,
                          })
                        }
                      />
                    </div>
                  </Fragment>
                ))}
              </>
            )}
            {prepareDate.data && (
              <div className='col-span-full'>
                <Button
                  className='flex items-center gap-2 text-sm'
                  size='sm'
                  intent='ghost'
                  onPress={() => customersFieldArray.append({} as never)}
                >
                  <LuPlus />
                  Добавить заказчика
                </Button>
              </div>
            )}
          </div>
          {prepareDate.data && (
            <>
              <div className='flex items-center gap-4'>
                <p>Пункт отправления (возвращения)</p>
                <Controller
                  control={form.control}
                  name='startPointId'
                  render={({ field, fieldState }) => (
                    <div className='grow'>
                      <Select
                        size='sm'
                        label='Пункт отправления (возвращения)'
                        intent='primary'
                        items={prepareDate.data.tour.startPoints || []}
                        onSelectionChange={(v) => field.onChange(Number(v))}
                        selectedKey={field.value?.toString() || null}
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                        isDisabled={!prepareDate.data.tour.startPoints.length || field.disabled}
                        {...omit(field, ['disabled', 'onChange', 'value', 'ref'])}
                      >
                        {(item) => <Item key={item.id}>{item.city.name}</Item>}
                      </Select>
                    </div>
                  )}
                />
                <div className={boxCva({})}>
                  {prepareDate.data.tour.startPoints.find((v) => v.id === formValues.startPointId)?.timeAt.toFormat('HH:mm') ?? '00:00'}
                </div>
              </div>
              <div className='mt-4'>
                <Controller
                  control={form.control}
                  name='customers'
                  render={({ field }) => (
                    <BusSeatSelector floors={prepareDate.data.tour.busSchema.schema.floors} value={field.value} onChange={field.onChange} />
                  )}
                />
              </div>
              <div className='mt-8'>
                <p className='mb-4 font-medium'>Маршрут и выбор гостиниц</p>{' '}
                <div className='rounded-md bg-yellow-400/20 p-4 shadow-[0px_0px_2px_0px] shadow-[#c4c4c4]'>
                  <div className='mb-2 flex items-start gap-4'>
                    <div className='w-max rounded-md bg-white px-2 py-1 font-bold'>1</div>
                    <div className='mb-4 grid grid-cols-[max-content_1fr] items-center gap-4'>
                      <p>Город (н/п)</p>
                      <div className='min-w-xs'>
                        <Controller
                          control={form.control}
                          name='routeId'
                          render={({ field, fieldState }) => (
                            <Select
                              size='sm'
                              label='Город (н/п)'
                              intent='primary'
                              items={prepareDate.data.tour.route || []}
                              onSelectionChange={(v) => field.onChange(Number(v))}
                              selectedKey={field.value?.toString() || null}
                              errorMessage={fieldState.error?.message}
                              isInvalid={fieldState.invalid}
                              isDisabled={!prepareDate.data.tour.route.length || field.disabled}
                              {...omit(field, ['disabled', 'onChange', 'value', 'ref'])}
                            >
                              {(item) => <Item key={item.id}>{item.city.name}</Item>}
                            </Select>
                          )}
                        />
                      </div>
                      <p>Дата заезда</p>
                      <div className='flex items-center gap-4'>
                        <div className={boxCva({})}>{currentRoute?.dateAt.toFormat('dd.MM.yyyy') ?? 'Не указано'}</div>
                        <p>Ночей</p>
                        <div className={boxCva({ className: 'w-16 text-center' })}>{currentRoute?.nights ?? 0}</div>
                      </div>
                    </div>
                  </div>
                  <div className='flex flex-col items-stretch gap-2'>
                    <div className='rounded-md bg-yellow-400/40 p-4'>
                      <div className='grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2'>
                        <p>Гостиница</p>
                        <div className='w-max'>
                          <Controller
                            control={form.control}
                            name={`hotelPointId`}
                            render={({ field, fieldState }) => (
                              <Select
                                size='sm'
                                label='Гостиница'
                                intent='primary'
                                optional
                                items={currentRoute?.hotels.map((v) => ({ id: v.id, name: v.hotel.name })) || []}
                                onSelectionChange={(v) => field.onChange(Number(v))}
                                selectedKey={field.value?.toString() || null}
                                errorMessage={fieldState.error?.message}
                                isInvalid={fieldState.invalid}
                                isDisabled={!currentRoute?.hotels.length || field.disabled}
                                {...omit(field, ['disabled', 'onChange', 'value', 'ref'])}
                              >
                                {(item) => <Item key={item.id}>{item.name}</Item>}
                              </Select>
                            )}
                          />
                        </div>
                        <p>Питание</p>
                        <div className='w-max'>
                          <div className={boxCva({})}>
                            {FoodTypes[currentRoute?.hotels.find((v) => v.id === formValues.hotelPointId)?.foodType as never] ??
                              'Не указано'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-8 mb-6'>
                <div className='grid grid-cols-[max-content_max-content_max-content_max-content_max-content] items-center gap-x-4 gap-y-2'>
                  <p>
                    Стоимость <span className='font-medium'>проезда</span>
                  </p>
                  <p>Взр.</p>
                  <div className={boxCva({})}>
                    {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(
                      prepareDate.data.tour.priceTransferAdult,
                    )}
                  </div>
                  <p>Дет.</p>
                  <div className={boxCva({})}>
                    {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(
                      prepareDate.data.tour.priceTransferChild,
                    )}
                  </div>
                  <p>
                    Стоимость <span className='font-medium'>участия</span>
                  </p>
                  <p>Взр.</p>
                  <div className={boxCva({})}>
                    {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(
                      prepareDate.data.tour.priceParticipateAdult,
                    )}
                  </div>
                  <p>Дет.</p>
                  <div className={boxCva({})}>
                    {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(
                      prepareDate.data.tour.priceParticipateChild,
                    )}
                  </div>
                </div>
              </div>

              <div className='mt-8'>
                <p className='mb-4 font-medium'>Итоговая стоимость тура</p>
                <div className='grid w-fit grid-cols-[max-content_max-content] items-center gap-x-4 gap-y-2 rounded-lg bg-teal-100 p-4'>
                  <div className='flex items-center justify-between gap-2'>
                    <div>Взрослый</div>
                    <div className='font-medium'>x{formValues.customers.length}</div>
                  </div>
                  <div className={boxCva({})}>
                    {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(
                      (prepareDate.data.tour.priceParticipateAdult + prepareDate.data.tour.priceTransferAdult) *
                        formValues.customers.length,
                    )}
                  </div>
                  <div className='flex items-center justify-between gap-2'>
                    <div>Детский</div>
                    <div className='font-medium'>x{formValues.customers.length}</div>
                  </div>
                  <div className={boxCva({})}>
                    {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(
                      (prepareDate.data.tour.priceParticipateChild + prepareDate.data.tour.priceTransferChild) * 0,
                    )}
                  </div>
                </div>
              </div>

              <div className='mt-4 flex items-center gap-2'>
                <div className='font-bold'>СУММА</div>
                <div className={boxCva({})}>
                  {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(booking.data?.priceFinal ?? 0)}
                </div>
              </div>
            </>
          )}
        </div>
        <div className='mt-8 flex items-center gap-4'>
          <Button type='submit' size='md' isDisabled={form.formState.disabled} className='flex items-center gap-2'>
            <HiOutlineUpload />
            Сохранить
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
