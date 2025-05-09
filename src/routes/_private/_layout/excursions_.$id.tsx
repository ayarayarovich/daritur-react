import { useEffect, useState } from 'react'
import { FileTrigger, Pressable } from 'react-aria-components'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { HiOutlineLocationMarker, HiOutlinePhotograph, HiOutlinePlusSm, HiOutlineUpload, HiX } from 'react-icons/hi'
import { HiArrowLeft } from 'react-icons/hi2'
import { Item, useAsyncList } from 'react-stately'

import Button from '@/components/ui/button'
import ComboBox from '@/components/ui/combobox'
import NumberField from '@/components/ui/number-field'
import Select from '@/components/ui/select'
import TextArea from '@/components/ui/text-area'
import TextField from '@/components/ui/text-field'
import TimeField from '@/components/ui/time-field'
import { extractErrorMessageFromAPIError, imgScheme, requiredFieldRefine, timeToString } from '@/lib/utils'
import { ExcursionsService } from '@/services'
import { zodResolver } from '@hookform/resolvers/zod'
import { Time } from '@internationalized/date'
import { useQueries, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { DateTime } from 'luxon'
import { omit, unique } from 'radashi'
import { z } from 'zod'

import { Query } from '@/shared'
import Queries from '@/shared/queries'

export const Route = createFileRoute('/_private/_layout/excursions_/$id')({
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
  id: z.number().refine(...requiredFieldRefine()),
  title: z.string().refine(...requiredFieldRefine()),
  description: z.string().refine(...requiredFieldRefine()),
  cityId: z.number().refine(...requiredFieldRefine()),
  countryId: z.number().refine(...requiredFieldRefine()),
  startAt: z.instanceof(Time, { message: 'Обязательное поле' }).refine(...requiredFieldRefine()),
  endAt: z.instanceof(Time, { message: 'Обязательное поле' }).refine(...requiredFieldRefine()),
  durationHours: z.number().refine(...requiredFieldRefine()),
  priceDefault: z.number().refine(...requiredFieldRefine()),
  priceChild: z.number().refine(...requiredFieldRefine()),
  _images: z.object({ id: z.number(), img: imgScheme, previewUrl: z.string() }).array(),
  _deletedImages: z.number().array(),
  interestsPoints: z
    .number()
    .array()
    .refine(...requiredFieldRefine()),
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const { params } = Route.useRouteContext()
  const availableCities = useQuery(Queries.excursions.cities)
  const availableCountries = useQuery(Queries.excursions.countries)
  const [showAddInterestPointCombobox, setShowAddInterestPointCombobox] = useState(false)

  const form = useForm<z.infer<typeof formScheme>>({
    resolver: zodResolver(formScheme),
    defaultValues: async () => {
      const data = await Query.client.fetchQuery(Queries.excursions.detail({ id: params.id }))
      return {
        ...data,
        startAt: new Time(data.startAt.hour, data.startAt.minute),
        endAt: new Time(data.endAt.hour, data.endAt.minute),
        interestsPoints: data.interestsPoints.map((v) => v.id),
        _images: data.images.map((v) => ({ id: v.id, img: v.url, previewUrl: v.url })),
        _deletedImages: [],
      }
    },
  })

  const formValues = form.watch()

  useEffect(() => {
    if (formValues.startAt && formValues.endAt) {
      const start = DateTime.fromObject({
        hour: formValues.startAt.hour,
        minute: formValues.startAt.minute,
      })
      const end = DateTime.fromObject({
        hour: formValues.endAt.hour,
        minute: formValues.endAt.minute,
      })
      const duration = end.diff(start, ['hours', 'minutes'])
      if (duration.hours >= 0) {
        form.resetField('durationHours', { defaultValue: duration.hours })
      }
    }
  }, [formValues.startAt, formValues.endAt, form])

  const imagesFieldArray = useFieldArray({
    control: form.control,
    name: '_images',
    keyName: 'key',
  })

  const availableInterests = useAsyncList<{ id: number; title: string; address: string }>({
    async load({ filterText, signal }) {
      signal.addEventListener('abort', () => {
        console.log('cancel', filterText)
        Query.client.cancelQueries(Queries.interests.list({ search: filterText || '', offset: 0, limit: 20 }))
      })
      const { items } = await Query.client.fetchQuery(Queries.interests.list({ search: filterText || '', offset: 0, limit: 20 }))
      return {
        items: items,
      }
    },
  })

  const selectedInterestsWithDetailsQueries = useQueries({
    queries: unique(formValues.interestsPoints).map((id) => Queries.interests.detail({ id })),
    combine(result) {
      return result
        .filter((v) => v.data)
        .reduce((acc, query) => ({ ...acc, [query.data!.id]: query }), {} as Record<number, (typeof result)[number]>)
    },
  })

  const onSubmit = form.handleSubmit(
    async (vals) => {
      const action = async () => {
        const images = vals._images
        const deletedImages = vals._deletedImages
        const values = omit(vals, ['_images', '_deletedImages'])

        const excursion = await ExcursionsService.updateExcursion({
          ...values,
          startAt: DateTime.fromObject({ minute: vals.startAt.minute, hour: vals.startAt.hour }),
          endAt: DateTime.fromObject({ minute: vals.endAt.minute, hour: vals.endAt.hour }),
        })

        await Promise.all(
          images.map((v) =>
            v.img instanceof File ? ExcursionsService.addExcursionImage({ excursion_id: excursion.id, file: v.img }) : Promise.resolve(),
          ),
        )

        await Promise.all(deletedImages.map((v) => ExcursionsService.deleteExcursionImage({ excursion_id: excursion.id, image_id: v })))
      }
      await toast.promise(action(), {
        loading: 'Секунду...',
        success: 'Успешно',
        error: (v) => extractErrorMessageFromAPIError(v) || 'Что-то пошло не так',
      })
      Query.client.invalidateQueries({
        queryKey: Queries.excursions._def,
      })
      navigate({ to: '..' })
    },
    (v) => console.log(v),
  )

  return (
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
      <h1 className='mb-4 text-xl font-medium'>Изменить экскурсию</h1>
      <div className='w-min min-w-2xl'>
        <div className='mb-8 grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2'>
          <p className='font-medium'>Название</p>
          <Controller
            control={form.control}
            name='title'
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
                selectedKey={field.value?.toString()}
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
                isDisabled={!availableCountries.data?.length || field.disabled}
                {...omit(field, ['disabled', 'onChange', 'value', 'ref'])}
              >
                {(item) => <Item key={item.id}>{item.name}</Item>}
              </Select>
            )}
          />
          <p className='font-medium'>Регион</p>
          <Controller
            control={form.control}
            name='cityId'
            render={({ field, fieldState }) => (
              <Select
                size='sm'
                label='Регион'
                intent='primary'
                items={availableCities.data || []}
                onSelectionChange={(v) => field.onChange(Number(v))}
                selectedKey={field.value?.toString()}
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

        <div className='mb-6 flex items-center gap-6 text-nowrap'>
          <div className='flex items-center gap-2'>
            <p className='font-medium'>Начало ({DateTime.local().offsetNameShort})</p>
            <Controller
              control={form.control}
              name='startAt'
              render={({ field, fieldState }) => (
                <TimeField
                  size='sm'
                  label='Начало'
                  intent='primary'
                  {...field}
                  value={(field.value ?? null) as never}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />
          </div>
          <div className='flex items-center gap-2'>
            <p className='font-medium'>Окончание ({DateTime.local().offsetNameShort})</p>
            <Controller
              control={form.control}
              name='endAt'
              render={({ field, fieldState }) => (
                <TimeField
                  size='sm'
                  label='Окончание'
                  intent='primary'
                  {...field}
                  value={(field.value ?? null) as never}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />
          </div>
          <div className='flex items-center gap-2'>
            <p className='font-medium'>Продолжительность ~</p>
            <Controller
              control={form.control}
              name='durationHours'
              render={({ field, fieldState }) => (
                <NumberField
                  size='sm'
                  centered
                  aria-label='Продолжительность'
                  intent='primary'
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />
            <p className='font-medium'>ч</p>
          </div>
        </div>
        <p className='mb-4 font-medium'>Точки экскурсионного маршрута</p>
        <div className='mb-6 flex flex-col items-stretch gap-x-4 gap-y-2'>
          <div className='flex items-center gap-4'>
            <div className='text-sm font-semibold'>{timeToString(formValues.startAt)}</div>
            <div className='border-gray-1 flex size-10 shrink-0 grow-0 items-center justify-center rounded-full border'>
              <HiOutlineLocationMarker className='text-[1.5rem]' />
            </div>
            <div className='border-gray-4 grow rounded-md border px-3 py-2'>
              <div className='text-sm font-semibold'>Встреча с экскурсоводом в холле гостиницы.</div>
            </div>
          </div>
          {formValues.interestsPoints?.map((id, index) => (
            <div className='flex items-center gap-4' key={index}>
              <div className='invisible text-sm font-semibold'>{timeToString(formValues.startAt)}</div>
              <div className='border-gray-1 invisible flex size-10 shrink-0 grow-0 items-center justify-center rounded-full border'>
                <HiOutlineLocationMarker className='text-[1.5rem]' />
              </div>
              <div className='border-gray-4 bg-gray-6 grow rounded-md border px-3 py-2'>
                {selectedInterestsWithDetailsQueries[id]?.isSuccess && (
                  <>
                    <div className='flex items-center justify-between gap-2'>
                      <div className='text-sm font-semibold'>{selectedInterestsWithDetailsQueries[id]?.data.title}</div>
                      <Button
                        type='button'
                        size='xs'
                        intent='ghost'
                        onPress={() =>
                          form.setValue(
                            'interestsPoints',
                            formValues.interestsPoints.filter((_, idx) => idx !== index),
                          )
                        }
                      >
                        <HiX />
                      </Button>
                    </div>
                    <div className='text-xs font-light'>{selectedInterestsWithDetailsQueries[id]?.data.description}</div>
                    <div className='text-xs font-light'>
                      <span className='underline'>Адрес:</span> {selectedInterestsWithDetailsQueries[id]?.data.address}
                    </div>
                  </>
                )}
                {selectedInterestsWithDetailsQueries[id]?.isError && <div>Ошибка</div>}
                {(!selectedInterestsWithDetailsQueries[id] || selectedInterestsWithDetailsQueries[id].isLoading) && <div>Загрузка...</div>}
              </div>
            </div>
          ))}
          <div className='flex items-center gap-4'>
            <div className='invisible text-sm font-semibold'>{timeToString(formValues.startAt)}</div>
            <div className='flex size-10 shrink-0 grow-0 items-center justify-center rounded-full'>
              <div className='bg-gray-6 size-2 rounded-full'></div>
            </div>
            {showAddInterestPointCombobox ? (
              <div className='flex items-center gap-2'>
                <ComboBox
                  label='Поиск'
                  size='sm'
                  items={availableInterests.items}
                  onInputChange={availableInterests.setFilterText}
                  inputValue={availableInterests.filterText}
                  onSelectionChange={(v) => {
                    if (!v) {
                      return
                    }
                    form.setValue('interestsPoints', [...formValues.interestsPoints, Number(v)])
                    setShowAddInterestPointCombobox(false)
                    availableInterests.setFilterText('')
                  }}
                >
                  {(item) => <Item key={item.id.toString()}>{item.title}</Item>}
                </ComboBox>
                <Button
                  intent='ghost'
                  size='xs'
                  type='button'
                  onPress={() => {
                    setShowAddInterestPointCombobox(false)
                    availableInterests.setFilterText('')
                  }}
                >
                  <HiX />
                </Button>
              </div>
            ) : (
              <Button
                className='flex w-fit items-center gap-1 text-sm opacity-75'
                intent='ghost'
                size='sm'
                type='button'
                onPress={() => setShowAddInterestPointCombobox(true)}
              >
                <HiOutlinePlusSm />
                Добавить точку
              </Button>
            )}
          </div>
          <div className='flex items-center gap-4'>
            <div className='text-sm font-semibold'>{timeToString(formValues.endAt)}</div>
            <div className='border-gray-1 flex size-10 shrink-0 grow-0 items-center justify-center rounded-full border'>
              <HiOutlineLocationMarker className='text-[1.5rem]' />
            </div>
            <div className='border-gray-4 grow rounded-md border px-3 py-2'>
              <div className='text-sm font-semibold'>Окончание программы..</div>
            </div>
          </div>
        </div>
        <p className='mb-2 font-medium'>Описание</p>
        <div className='mb-6'>
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
        <div className='mb-2 flex items-center gap-2'>
          <p className='font-medium'>Фотографии</p>
          <FileTrigger
            onSelect={(e) => {
              if (!e) return
              const files = Array.from(e)
              for (const file of files) {
                const previewUrl = URL.createObjectURL(file)
                imagesFieldArray.append({ id: 0, img: file, previewUrl })
              }
            }}
          >
            <Pressable>
              <button className='flex w-fit items-center gap-1 text-sm opacity-75 not-disabled:cursor-pointer' type='button'>
                <HiOutlinePhotograph />
                Добавить фотографию
              </button>
            </Pressable>
          </FileTrigger>
        </div>
        <div className='mb-6 flex flex-wrap items-center gap-2'>
          {imagesFieldArray.fields.map((field, index) => (
            <div className='relative' key={field.key}>
              <div className='absolute top-2 right-2'>
                <Button
                  type='button'
                  size='xs'
                  intent='secondary'
                  onPress={() => {
                    URL.revokeObjectURL(field.previewUrl)
                    imagesFieldArray.remove(index)
                    form.setValue('_deletedImages', [...form.getValues('_deletedImages'), field.id])
                  }}
                >
                  <HiX className='text-red-500' />
                </Button>
              </div>
              <img className='h-48' src={field.previewUrl} />
            </div>
          ))}
        </div>
        <p className='mb-2 font-medium'>Стоимость экскурсии за одного человека</p>
        <div className='mb-6 w-fit rounded-md bg-teal-100 p-4'>
          <div className='grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2'>
            <p>Взрослый</p>
            <Controller
              control={form.control}
              name='priceDefault'
              render={({ field, fieldState }) => (
                <NumberField
                  size='sm'
                  label='Взрослый'
                  intent='primary'
                  className='font-semibold'
                  formatOptions={{ style: 'currency', currency: 'RUB' }}
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />
            <p>Детский</p>
            <Controller
              control={form.control}
              name='priceChild'
              render={({ field, fieldState }) => (
                <NumberField
                  size='sm'
                  label='Детский'
                  intent='primary'
                  className='font-semibold'
                  formatOptions={{ style: 'currency', currency: 'RUB' }}
                  {...field}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div>
        <Button type='submit' size='md' className='flex items-center gap-2'>
          <HiOutlineUpload />
          Сохранить
        </Button>
      </div>
    </form>
  )
}
