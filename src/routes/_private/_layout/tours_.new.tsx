import { Fragment, useEffect, useMemo, useState } from 'react'
import { FileTrigger } from 'react-aria-components'
import { Controller, FormProvider, SubmitErrorHandler, SubmitHandler, useFieldArray, useForm, useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'
import { BiBus } from 'react-icons/bi'
import { HiOutlineOfficeBuilding, HiOutlinePhotograph, HiOutlineUpload, HiX } from 'react-icons/hi'
import { HiArrowLeft, HiPlus } from 'react-icons/hi2'
import { Item } from 'react-stately'

import BusSeatSelector from '@/components/bus-seat-selector'
import Button from '@/components/ui/button'
import DateField from '@/components/ui/date-field'
import NumberField from '@/components/ui/number-field'
import { Radio, RadioGroup } from '@/components/ui/radio'
import Select from '@/components/ui/select'
import TextArea from '@/components/ui/text-area'
import TextField from '@/components/ui/text-field'
import TimeField from '@/components/ui/time-field'
import { distributiveOmit, extractErrorMessageFromAPIError, imgScheme, requiredFieldRefine } from '@/lib/utils'
import { ToursService } from '@/services'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarDate, getLocalTimeZone, Time } from '@internationalized/date'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { DateTime } from 'luxon'
import { omit } from 'radashi'
import { z } from 'zod'

import { Query } from '@/shared'
import Queries from '@/shared/queries'

export const Route = createFileRoute('/_private/_layout/tours_/new')({
  component: RouteComponent,
})

const TourTypes = {
  transfer_only: 'Проезд',
  transfer_and_hotel: 'Проезд + Проживание',
  transfer_and_hotel_optional: 'Проезд + Проживание (по желанию)',
} as const

const FoodTypes = {
  pension: 'Полный пансион',
  half_pension: 'Полупансион',
  breakfast: 'Завтрак',
  all_inclusive: 'Всё включено',
} as Record<string, string>

const baseFormScheme = z.object({
  name: z.string().refine(...requiredFieldRefine()),
  countryId: z.number().refine(...requiredFieldRefine()),
  description: z.string().refine(...requiredFieldRefine()),
  type: z
    .union([z.literal('transfer_only'), z.literal('transfer_and_hotel'), z.literal('transfer_and_hotel_optional')])
    .refine(...requiredFieldRefine()),
  busType: z.string().refine(...requiredFieldRefine()),
  firstStartDateAt: z.instanceof(CalendarDate, { message: 'Обязательное поле' }).refine(...requiredFieldRefine()),
  firstStartTimeAt: z.instanceof(Time, { message: 'Обязательное поле' }).refine(...requiredFieldRefine()),
  startPoints: z
    .object({
      cityId: z.number().refine(...requiredFieldRefine()),
      timeAt: z.instanceof(Time, { message: 'Обязательное поле' }).refine(...requiredFieldRefine()),
    })
    .array()
    .min(1),
  isPublished: z.boolean(),
  route: z
    .object({
      cityId: z.number().refine(...requiredFieldRefine()),
      dateAt: z.instanceof(CalendarDate, { message: 'Обязательное поле' }).refine(...requiredFieldRefine()),
      nights: z.number().refine(...requiredFieldRefine()),
      hotels: z
        .object({
          hotelId: z.number().refine(...requiredFieldRefine()),
          foodType: z.string().refine(...requiredFieldRefine()),
        })
        .array(),
    })
    .array(),
  priceTransferAdult: z.number().refine(...requiredFieldRefine()),
  priceTransferChild: z.number().refine(...requiredFieldRefine()),
  priceParticipateAdult: z.number().refine(...requiredFieldRefine()),
  priceParticipateChild: z.number().refine(...requiredFieldRefine()),
  discount: z.number().refine(...requiredFieldRefine()),
  approveType: z.union([z.literal('need_request'), z.literal('auto_approve'), z.literal('no_approve')]).refine(...requiredFieldRefine()),
  durationDays: z.number().refine(...requiredFieldRefine()),
  _images: z.object({ img: imgScheme, previewUrl: z.string() }).array(),
})

const singleTourScheme = baseFormScheme.extend({
  _regularMode: z.literal('single'),
})

const regularTourScheme = baseFormScheme.extend({
  _regularMode: z.literal('regular'),
  regularFinishAt: z.instanceof(CalendarDate, { message: 'Обязательное поле' }).refine(...requiredFieldRefine()),
  regularMode: z.string({ message: 'Обязательное поле' }).refine(...requiredFieldRefine()),
})

const formScheme = z.discriminatedUnion('_regularMode', [singleTourScheme, regularTourScheme])

function RouteComponent() {
  const navigate = Route.useNavigate()
  const availableCountries = useQuery(Queries.excursions.countries)
  const availableCities = useQuery(Queries.excursions.cities)
  const availableBuses = useQuery(Queries.tours.buses)
  const [showBusDetails, setShowBusDetails] = useState(false)

  const form = useForm<z.infer<typeof formScheme>>({
    resolver: zodResolver(formScheme),
    defaultValues: {
      name: '',
      countryId: 0,
      description: '',
      type: 'transfer_only',
      busType: '',
      isPublished: false,
      priceTransferAdult: 0,
      priceTransferChild: 0,
      priceParticipateAdult: 0,
      priceParticipateChild: 0,
      _regularMode: 'single',
      discount: 1,
      durationDays: 1,
      startPoints: [
        {
          cityId: 0,
        },
      ],
      route: [
        {
          hotels: [{}],
        },
      ],
      _images: [],
    },
  })

  const imagesFieldArray = useFieldArray({
    control: form.control,
    name: '_images',
    keyName: 'key',
  })

  const startPointsFieldArray = useFieldArray({
    control: form.control,
    name: 'startPoints',
    keyName: 'key',
  })

  const routeFieldArray = useFieldArray({
    control: form.control,
    name: 'route',
    keyName: 'key',
  })

  const formValues = form.watch()
  const selectedBusDetails = useMemo(
    () => availableBuses.data?.find((v) => v.busType === formValues.busType),
    [availableBuses.data, formValues.busType],
  )

  useEffect(() => {
    console.log(formValues)
  }, [formValues])

  const submitHandler: SubmitHandler<z.infer<typeof formScheme>> = async (vals) => {
    const action = async () => {
      const images = vals._images
      const v = distributiveOmit(vals, ['_images'])

      const tour = await ToursService.createTour({
        ...v,
        firstStartDateAt: DateTime.fromJSDate(v.firstStartDateAt.toDate(getLocalTimeZone())),
        firstStartTimeAt: DateTime.fromObject({ hour: v.firstStartTimeAt.hour, minute: v.firstStartTimeAt.minute }),
        startPoints: v.startPoints.map((v) => ({
          ...v,
          timeAt: DateTime.fromObject({ hour: v.timeAt.hour, minute: v.timeAt.minute }),
        })),
        route: v.route.map((v) => ({
          ...v,
          dateAt: DateTime.fromJSDate(v.dateAt.toDate(getLocalTimeZone())),
        })),
        regularMode: v._regularMode === 'single' ? 'single' : v.regularMode,
        regularFinishAt: v._regularMode === 'regular' ? DateTime.fromJSDate(v.regularFinishAt.toDate(getLocalTimeZone())) : undefined,
      })

      await Promise.all(
        images.map((v) => (v.img instanceof File ? ToursService.addTourImage({ tour_id: tour.id, file: v.img }) : Promise.resolve())),
      )
    }
    await toast.promise(action(), {
      loading: 'Секунду...',
      success: 'Успешно',
      error: (v) => extractErrorMessageFromAPIError(v) || 'Что-то пошло не так',
    })
    Query.client.invalidateQueries({
      queryKey: Queries.tours._def,
    })
    navigate({ to: '..' })
  }

  const errorHandler: SubmitErrorHandler<z.infer<typeof formScheme>> = (v) => {
    console.log(v)
    toast.error('Создание туров еще не закончено')
  }

  const onSubmitDraft = form.handleSubmit(
    (vals) =>
      submitHandler({
        ...vals,
        isPublished: false,
      }),
    errorHandler,
  )

  const onSubmit = form.handleSubmit(
    (vals) =>
      submitHandler({
        ...vals,
        isPublished: true,
      }),
    errorHandler,
  )

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmitDraft} className='flex flex-col items-stretch gap-4 px-5 py-22'>
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
        <h1 className='mb-4 text-xl font-medium'>Оформление нового автобусного тура</h1>
        <div className='w-min min-w-2xl'>
          <div className='mb-8 grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2'>
            <p className='font-medium'>Название</p>
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
            <p className='font-medium'>Тур</p>
            <Controller
              control={form.control}
              name='type'
              render={({ field, fieldState }) => (
                <Select
                  size='sm'
                  label='Тур'
                  intent='primary'
                  items={(Object.keys(TourTypes) as (keyof typeof TourTypes)[]).map((v) => ({ id: v, name: TourTypes[v] }))}
                  onSelectionChange={(v) => field.onChange(v)}
                  selectedKey={field.value?.toString() || null}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  isDisabled={!availableCities.data?.length || field.disabled}
                  {...omit(field, ['disabled', 'onChange', 'value', 'ref'])}
                >
                  {(item) => <Item key={item.id}>{item.name}</Item>}
                </Select>
              )}
            />
            <p className='font-medium'>Страна</p>
            <Controller
              control={form.control}
              name='countryId'
              render={({ field, fieldState }) => (
                <Select
                  size='sm'
                  label='Страна'
                  intent='primary'
                  items={availableCountries.data || []}
                  onSelectionChange={(v) => field.onChange(Number(v))}
                  selectedKey={field.value?.toString() || null}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  isDisabled={!availableCountries.data?.length || field.disabled}
                  {...omit(field, ['disabled', 'onChange', 'value', 'ref'])}
                >
                  {(item) => <Item key={item.id}>{item.name}</Item>}
                </Select>
              )}
            />
          </div>
          <div className='mb-6 flex items-center gap-6 text-nowrap'>
            <div className='flex items-center gap-2'>
              <p className='font-medium'>Дата отправления ({DateTime.local().offsetNameShort})</p>
              <Controller
                control={form.control}
                name='firstStartDateAt'
                render={({ field, fieldState }) => (
                  <DateField
                    size='sm'
                    label='Дата'
                    intent='primary'
                    {...field}
                    value={field.value || null}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                  />
                )}
              />
            </div>
            <div className='flex items-center gap-2'>
              <p className='font-medium'>Время ({DateTime.local().offsetNameShort})</p>
              <Controller
                control={form.control}
                name='firstStartTimeAt'
                render={({ field, fieldState }) => (
                  <TimeField
                    size='sm'
                    label='Время'
                    intent='primary'
                    {...field}
                    value={field.value || null}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                  />
                )}
              />
            </div>
          </div>
          <div className='grid grid-cols-[max-content_1fr_min-content] items-center gap-x-4 gap-y-2'>
            <p className='font-medium'>Автобус на объект</p>
            <Controller
              control={form.control}
              name='busType'
              render={({ field, fieldState }) => (
                <Select
                  size='sm'
                  label='Автобус на объект'
                  intent='primary'
                  items={availableBuses.data?.map((v) => ({ id: v.busType, name: v.name })) || []}
                  onSelectionChange={(v) => field.onChange(v)}
                  selectedKey={field.value?.toString() || null}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  isDisabled={!availableCities.data?.length || field.disabled}
                  {...omit(field, ['disabled', 'onChange', 'value', 'ref'])}
                >
                  {(item) => <Item key={item.id}>{item.name}</Item>}
                </Select>
              )}
            />
            <Button
              type='button'
              intent={showBusDetails ? 'primary' : 'ghost'}
              size='sm'
              isDisabled={!formValues.busType || !selectedBusDetails}
              onPress={() => setShowBusDetails((v) => !v)}
            >
              <BiBus />
            </Button>
          </div>
          {formValues.busType && selectedBusDetails && showBusDetails && (
            <div className='mt-2'>
              <BusSeatSelector floors={selectedBusDetails.schema.floors} />
            </div>
          )}
          <div className='mt-8 mb-6'>
            <p className='mb-2 font-medium'>Пункты начального сбора и обратного развоза заказчиков</p>
            <div className='grid grid-cols-[max-content_1fr_max-content_min-content] items-center gap-4 rounded-md bg-teal-50 p-4 shadow-[0px_0px_2px_0px] shadow-[#c4c4c4]'>
              {startPointsFieldArray.fields.map((v, idx) => (
                <Fragment key={v.key}>
                  {idx === 0 && <p>Начальный (конечный) пункт</p>}
                  {idx > 0 && <p>Промежуточный пункт</p>}
                  <Controller
                    control={form.control}
                    name={`startPoints.${idx}.cityId`}
                    render={({ field, fieldState }) => (
                      <Select
                        size='sm'
                        label='Точка'
                        intent='primary'
                        items={availableCities.data || []}
                        onSelectionChange={(v) => field.onChange(Number(v))}
                        selectedKey={field.value?.toString() || null}
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                        isDisabled={!availableCities.data?.length || field.disabled}
                        {...omit(field, ['disabled', 'onChange', 'value', 'ref'])}
                      >
                        {(item) => <Item key={item.id}>{item.name}</Item>}
                      </Select>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name={`startPoints.${idx}.timeAt`}
                    render={({ field, fieldState }) => (
                      <TimeField
                        size='sm'
                        label='Время'
                        intent='primary'
                        {...field}
                        value={field.value || null}
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                      />
                    )}
                  />
                  {idx > 0 ? (
                    <Button size='sm' type='button' intent='ghost' onPress={() => startPointsFieldArray.remove(idx)}>
                      <HiX />
                    </Button>
                  ) : (
                    <div></div>
                  )}
                </Fragment>
              ))}

              <Button
                className='col-span-full flex w-max items-center gap-1 text-sm opacity-75'
                intent='ghost'
                size='sm'
                onPress={() => startPointsFieldArray.append({} as never)}
              >
                <HiPlus />
                Добавить промежуточный пункт
              </Button>
            </div>
          </div>
          <div className='mb-6'>
            <p className='mb-2 font-medium'>Маршрут</p>
            <div className='mb-2 flex flex-col items-stretch gap-2'>
              {routeFieldArray.fields.map((v, idx) => (
                <RouteItem fieldIdx={idx} key={v.key} remove={routeFieldArray.remove} />
              ))}
            </div>
            <Button
              type='button'
              className='flex w-max items-center justify-center'
              intent='warning'
              size='sm'
              onPress={() => routeFieldArray.append({ hotels: [{}] } as never)}
            >
              <HiPlus />
              Добавить точку маршрута
            </Button>
          </div>
          <div className='mb-6'>
            <p className='mb-2 font-medium'>Описание</p>
            <div>
              <Controller
                control={form.control}
                name='description'
                render={({ field, fieldState }) => (
                  <TextArea
                    size='sm'
                    label='Описание'
                    intent='primary'
                    {...field}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                  />
                )}
              />
            </div>
          </div>
          <div className='mb-6 grid grid-cols-[max-content_max-content_max-content_max-content_max-content] gap-x-4 gap-y-2'>
            <p>
              Стоимость <span className='font-medium'>трансфера</span>
            </p>
            <p>Взр.</p>
            <Controller
              control={form.control}
              name='priceTransferAdult'
              render={({ field, fieldState }) => (
                <NumberField
                  size='sm'
                  aria-label='Взрослый'
                  intent='primary'
                  formatOptions={{ style: 'currency', currency: 'RUB' }}
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />
            <p>Дет.</p>
            <Controller
              control={form.control}
              name='priceTransferChild'
              render={({ field, fieldState }) => (
                <NumberField
                  size='sm'
                  aria-label='Десткий'
                  intent='primary'
                  formatOptions={{ style: 'currency', currency: 'RUB' }}
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />
            <p>
              Стоимость <span className='font-medium'>участия</span>
            </p>
            <p>Взр.</p>
            <Controller
              control={form.control}
              name='priceParticipateAdult'
              render={({ field, fieldState }) => (
                <NumberField
                  size='sm'
                  aria-label='Взрослый'
                  intent='primary'
                  formatOptions={{ style: 'currency', currency: 'RUB' }}
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />
            <p>Дет.</p>
            <Controller
              control={form.control}
              name='priceParticipateChild'
              render={({ field, fieldState }) => (
                <NumberField
                  size='sm'
                  aria-label='Десткий'
                  intent='primary'
                  formatOptions={{ style: 'currency', currency: 'RUB' }}
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />
          </div>
          <div className='mb-6 grid grid-cols-[max-content_max-content] gap-4'>
            <p>График проведения</p>
            <Controller
              control={form.control}
              name='_regularMode'
              render={({ field, fieldState }) => (
                <RadioGroup
                  {...omit(field, ['ref'])}
                  isInvalid={fieldState.invalid}
                  errorMessage={fieldState.error?.message}
                  aria-label='График проведения'
                >
                  <Radio value='single'>Единоразово</Radio>
                  <Radio value='regular'>Регулярно</Radio>
                </RadioGroup>
              )}
            />
            {formValues._regularMode === 'regular' && (
              <>
                <p>Регулярность</p>
                <Controller
                  control={form.control}
                  name='regularMode'
                  render={({ field, fieldState }) => (
                    <RadioGroup
                      {...omit(field, ['ref'])}
                      isInvalid={fieldState.invalid}
                      errorMessage={fieldState.error?.message}
                      aria-label='Регулярность'
                    >
                      <Radio value='every_week'>Каждую неделю</Radio>
                      <Radio value='every_2_week'>Каждые две недели</Radio>
                      <Radio value='every_month'>Каждый месяц</Radio>
                    </RadioGroup>
                  )}
                />
                <p>Завершающий рейс</p>
                <Controller
                  control={form.control}
                  name='regularFinishAt'
                  render={({ field, fieldState }) => (
                    <DateField
                      size='sm'
                      label='Дата'
                      intent='primary'
                      {...field}
                      value={field.value || null}
                      errorMessage={fieldState.error?.message}
                      isInvalid={fieldState.invalid}
                    />
                  )}
                />
              </>
            )}
          </div>
          <div className='mb-2 flex items-center gap-2'>
            <p className='font-medium'>Фотографии</p>
            <FileTrigger
              onSelect={(e) => {
                if (!e) return
                const files = Array.from(e)
                for (const file of files) {
                  const previewUrl = URL.createObjectURL(file)
                  imagesFieldArray.append({ img: file, previewUrl })
                }
              }}
            >
              <Button className='flex w-fit items-center gap-1 text-sm opacity-75' intent='ghost' size='sm' type='button'>
                <HiOutlinePhotograph />
                Добавить фотографию
              </Button>
            </FileTrigger>
          </div>
          <div className='mb-4 flex flex-wrap items-center gap-2'>
            {imagesFieldArray.fields.map((field, index) => (
              <div className='relative' key={field.key}>
                <div className='absolute top-2 right-2'>
                  <Button type='button' size='xs' intent='secondary'>
                    <HiX
                      className='text-red-500'
                      onClick={() => {
                        URL.revokeObjectURL(field.previewUrl)
                        imagesFieldArray.remove(index)
                      }}
                    />
                  </Button>
                </div>
                <img className='h-48' src={field.previewUrl} />
              </div>
            ))}
          </div>
          <div className='mb-6 grid grid-cols-[max-content_max-content] gap-4'>
            <p>Статус тура</p>
            <Controller
              control={form.control}
              name='approveType'
              render={({ field, fieldState }) => (
                <Select
                  size='sm'
                  label='Точка'
                  intent='primary'
                  onSelectionChange={(v) => field.onChange(v)}
                  selectedKey={field.value?.toString() || null}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  isDisabled={!availableCities.data?.length || field.disabled}
                  {...omit(field, ['disabled', 'onChange', 'value', 'ref'])}
                >
                  <Item key='need_request'>Под запрос</Item>
                  <Item key='auto_approve'>Моментальное подтверждение</Item>
                  <Item key='no_approve'>Без подтверждения</Item>
                </Select>
              )}
            />
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <Button type='button' size='md' onPress={() => onSubmit()} className='flex items-center gap-2'>
            <HiOutlineUpload />
            Сохранить
          </Button>
          <Button type='submit' size='md' className='flex items-center gap-2' intent='secondary'>
            <HiOutlineUpload />
            Сохранить черновик
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

function RouteItem({ fieldIdx, remove }: { fieldIdx: number; remove: (index?: number | number[]) => void }) {
  const availableCities = useQuery(Queries.excursions.cities)
  const availableHotels = useQuery(Queries.hotels.list({ offset: 0, limit: 999999 }))
  const form = useFormContext<z.infer<typeof formScheme>>()
  const hotelsFieldArray = useFieldArray({
    control: form.control,
    name: `route.${fieldIdx}.hotels`,
    keyName: 'key',
  })
  return (
    <div className='rounded-md bg-yellow-400/20 p-4 shadow-[0px_0px_2px_0px] shadow-[#c4c4c4]'>
      {fieldIdx > 0 && (
        <div className='flex justify-end'>
          <Button
            type='button'
            intent='ghost'
            size='sm'
            onPress={() => {
              remove(fieldIdx)
            }}
          >
            <HiX />
          </Button>
        </div>
      )}
      <div className='mb-2 flex items-start gap-4'>
        <div className='w-max rounded-md bg-white px-2 py-1 font-bold'>{fieldIdx + 1}</div>
        <div className='mb-4 grid grid-cols-[max-content_1fr] items-center gap-4'>
          <p>Город (н/п)</p>
          <div className='min-w-xs'>
            <Controller
              control={form.control}
              name={`route.${fieldIdx}.cityId`}
              render={({ field, fieldState }) => (
                <Select
                  size='sm'
                  label='Город (н/п)'
                  intent='primary'
                  items={availableCities.data || []}
                  onSelectionChange={(v) => field.onChange(Number(v))}
                  selectedKey={field.value?.toString() || null}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  isDisabled={!availableCities.data?.length || field.disabled}
                  {...omit(field, ['disabled', 'onChange', 'value', 'ref'])}
                >
                  {(item) => <Item key={item.id}>{item.name}</Item>}
                </Select>
              )}
            />
          </div>
          <p>Дата заезда</p>
          <div className='flex items-center gap-4'>
            <Controller
              control={form.control}
              name={`route.${fieldIdx}.dateAt`}
              render={({ field, fieldState }) => (
                <DateField
                  size='sm'
                  label='Дата'
                  intent='primary'
                  {...field}
                  value={field.value || null}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />
            <p>Ночей</p>
            <Controller
              control={form.control}
              name={`route.${fieldIdx}.nights`}
              render={({ field, fieldState }) => (
                <NumberField
                  className='w-16'
                  size='sm'
                  centered
                  aria-label='Ночей'
                  intent='primary'
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className='flex flex-col items-stretch gap-2'>
        {hotelsFieldArray.fields.map((v, idx) => (
          <div key={v.key} className='rounded-md bg-yellow-400/40 p-4'>
            {idx > 0 && (
              <div className='flex justify-end'>
                <Button type='button' intent='ghost' size='sm' onPress={() => hotelsFieldArray.remove(idx)}>
                  <HiX />
                </Button>
              </div>
            )}
            <div className='grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2'>
              <p>Гостиница</p>
              <div className='w-max'>
                <Controller
                  control={form.control}
                  name={`route.${fieldIdx}.hotels.${idx}.hotelId`}
                  render={({ field, fieldState }) => (
                    <Select
                      size='sm'
                      label='Гостиница'
                      intent='primary'
                      items={availableHotels.data?.items.map((v) => ({ id: v.id, name: v.name })) || []}
                      onSelectionChange={(v) => field.onChange(Number(v))}
                      selectedKey={field.value?.toString() || null}
                      errorMessage={fieldState.error?.message}
                      isInvalid={fieldState.invalid}
                      isDisabled={!availableCities.data?.length || field.disabled}
                      {...omit(field, ['disabled', 'onChange', 'value', 'ref'])}
                    >
                      {(item) => <Item key={item.id}>{item.name}</Item>}
                    </Select>
                  )}
                />
              </div>
              <p>Питание</p>
              <div className='w-max'>
                <Controller
                  control={form.control}
                  name={`route.${fieldIdx}.hotels.${idx}.foodType`}
                  render={({ field, fieldState }) => (
                    <Select
                      size='sm'
                      label='Питание'
                      intent='primary'
                      items={Object.keys(FoodTypes).map((v) => ({ id: v, name: FoodTypes[v] })) || []}
                      onSelectionChange={(v) => field.onChange(v)}
                      selectedKey={field.value?.toString() || null}
                      errorMessage={fieldState.error?.message}
                      isInvalid={fieldState.invalid}
                      isDisabled={!availableCities.data?.length || field.disabled}
                      {...omit(field, ['disabled', 'onChange', 'value', 'ref'])}
                    >
                      {(item) => <Item key={item.id}>{item.name}</Item>}
                    </Select>
                  )}
                />
              </div>
            </div>
            {idx + 1 === hotelsFieldArray.fields.length && (
              <Button
                className='mt-2 flex w-fit items-center gap-1 text-sm opacity-75'
                intent='ghost'
                size='sm'
                type='button'
                onPress={() => hotelsFieldArray.append({} as never)}
              >
                <HiOutlineOfficeBuilding />
                Добавить гостиницу
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
