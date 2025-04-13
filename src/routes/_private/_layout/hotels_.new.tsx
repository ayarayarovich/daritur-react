import { FileTrigger } from 'react-aria-components'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { HiOutlineOfficeBuilding, HiOutlinePhotograph, HiOutlineUpload, HiX } from 'react-icons/hi'
import { HiArrowLeft } from 'react-icons/hi2'
import { Item } from 'react-stately'

import Button from '@/components/ui/button'
import NumberField from '@/components/ui/number-field'
import Select from '@/components/ui/select'
import TextArea from '@/components/ui/text-area'
import TextField from '@/components/ui/text-field'
import TimeField from '@/components/ui/time-field'
import { extractErrorMessageFromAPIError, imgScheme, requiredFieldRefine } from '@/lib/utils'
import { HotelsService } from '@/services'
import { zodResolver } from '@hookform/resolvers/zod'
import { Time } from '@internationalized/date'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { DateTime } from 'luxon'
import { omit, unique } from 'radashi'
import { z } from 'zod'

import { Query } from '@/shared'
import Queries from '@/shared/queries'

export const Route = createFileRoute('/_private/_layout/hotels_/new')({
  component: RouteComponent,
})

const PlaceTypes = {
  single: 'Одноместный',
  double: 'Двухместный',
  double_with_extra: 'Двухместный + дополнительное место',
  triple: 'Трехместный',
  child_without_place: 'Ребенок без места',
} as Record<string, string>

const FoodTypes = {
  pension: 'Полный пансион',
  half_pension: 'Полупансион',
  breakfast: 'Завтрак',
  all_inclusive: 'Всё включено',
} as Record<string, string>

const formScheme = z.object({
  name: z.string().refine(...requiredFieldRefine()),
  address: z.string().refine(...requiredFieldRefine()),
  description: z.string().refine(...requiredFieldRefine()),
  checkinAt: z.instanceof(Time, { message: 'Обязательное поле' }).refine(...requiredFieldRefine()),
  checkoutAt: z.instanceof(Time, { message: 'Обязательное поле' }).refine(...requiredFieldRefine()),
  cityId: z.number().refine(...requiredFieldRefine()),
  countryId: z.number().refine(...requiredFieldRefine()),
  roomTypes: z
    .object({
      placeType: z.string().refine(...requiredFieldRefine()),
      comment: z.string().refine(...requiredFieldRefine()),
      category: z.string().refine(...requiredFieldRefine()),
      price: z.number().refine(...requiredFieldRefine()),
      count: z.number().refine(...requiredFieldRefine()),
    })
    .array(),
  _images: z.object({ img: imgScheme, previewUrl: z.string() }).array(),
  foodTypes: z
    .string()
    .array()
    .refine(...requiredFieldRefine()),
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const availableCountries = useQuery(Queries.excursions.countries)
  const availableCities = useQuery(Queries.excursions.cities)

  const form = useForm<z.infer<typeof formScheme>>({
    resolver: zodResolver(formScheme),
    defaultValues: {
      name: '',
      cityId: 0,
      countryId: 0,
      address: '',
      checkinAt: new Time(),
      checkoutAt: new Time(),
      description: '',
      roomTypes: [],
      _images: [],
      foodTypes: [],
    },
  })

  const roomTypesFieldArray = useFieldArray({
    control: form.control,
    name: 'roomTypes',
  })

  const imagesFieldArray = useFieldArray({
    control: form.control,
    name: '_images',
  })

  const onSubmit = form.handleSubmit(async (vals) => {
    const action = async () => {
      const images = vals._images
      const values = omit(vals, ['_images'])

      const hotel = await HotelsService.createHotel({
        ...values,
        checkinAt: DateTime.fromObject({ minute: vals.checkinAt.minute, hour: vals.checkinAt.hour }),
        checkoutAt: DateTime.fromObject({ minute: vals.checkoutAt.minute, hour: vals.checkoutAt.hour }),
      })

      await Promise.all(
        images.map((v) => (v.img instanceof File ? HotelsService.addHotelImage({ hotel_id: hotel.id, file: v.img }) : Promise.resolve())),
      )
    }
    await toast.promise(action(), {
      loading: 'Секунду...',
      success: 'Успешно',
      error: (v) => extractErrorMessageFromAPIError(v) || 'Что-то пошло не так',
    })
    Query.client.invalidateQueries({
      queryKey: Queries.hotels._def,
    })
    navigate({ to: '..' })
  })

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
      <h1 className='mb-4 text-xl font-medium'>Добавление новой гостиницы</h1>
      <div className='w-min min-w-2xl'>
        <div className='mb-8 grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2'>
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
          <p>Страна</p>
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
          <p>Регион</p>
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
          <p>Адрес</p>
          <Controller
            control={form.control}
            name='address'
            render={({ field, fieldState }) => (
              <TextField
                size='sm'
                label='Адрес'
                intent='primary'
                {...field}
                errorMessage={fieldState.error?.message}
                isInvalid={fieldState.invalid}
              />
            )}
          />
        </div>
      </div>
      <div className='w-min min-w-2xl'>
        <p className='mb-2'>Номера</p>
        <div className='mb-4 flex flex-col items-stretch gap-2'>
          {roomTypesFieldArray.fields.map((field, index) => (
            <div className='rounded-md bg-teal-50 p-2 pb-4' key={field.id}>
              <div className='mb-2 flex justify-end'>
                <Button
                  type='button'
                  size='xs'
                  intent='ghost'
                  onPress={() => roomTypesFieldArray.remove(index)}
                  className='flex items-center justify-center gap-1'
                >
                  <HiX />
                </Button>
              </div>
              <div className='flex items-start gap-2'>
                <div className='shrink-0 grow-0 rounded-md bg-white px-2 py-1 font-bold'>{index + 1}</div>
                <div className='grid grow grid-cols-[max-content_2fr_1fr_1fr] items-center gap-x-4 gap-y-2 [&_p]:text-sm'>
                  <p>Вид размещения</p>
                  <div className='col-span-3'>
                    <Controller
                      control={form.control}
                      name={`roomTypes.${index}.placeType`}
                      render={({ field, fieldState }) => (
                        <Select
                          size='sm'
                          label='Вид размещения'
                          intent='primary'
                          items={Object.keys(PlaceTypes).map((v) => ({ id: v, name: PlaceTypes[v] }))}
                          onSelectionChange={(v) => field.onChange(v)}
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
                  <p>Дополнительно</p>
                  <Controller
                    control={form.control}
                    name={`roomTypes.${index}.comment`}
                    render={({ field, fieldState }) => (
                      <TextField
                        size='sm'
                        label='Дополнительно'
                        intent='primary'
                        {...field}
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                      />
                    )}
                  />
                  <div className='col-span-2 flex items-center gap-4'>
                    <p className='text-nowrap'>Цена/сут</p>
                    <Controller
                      control={form.control}
                      name={`roomTypes.${index}.price`}
                      render={({ field, fieldState }) => (
                        <NumberField
                          size='sm'
                          label='Цена/сут'
                          formatOptions={{ style: 'currency', currency: 'RUB' }}
                          intent='primary'
                          {...field}
                          errorMessage={fieldState.error?.message}
                          isInvalid={fieldState.invalid}
                        />
                      )}
                    />
                  </div>
                  <p>Кат. номера</p>
                  <Controller
                    control={form.control}
                    name={`roomTypes.${index}.category`}
                    render={({ field, fieldState }) => (
                      <TextField
                        size='sm'
                        label='Кат. номера'
                        intent='primary'
                        {...field}
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                      />
                    )}
                  />
                  <div className='col-span-2 flex items-center gap-4'>
                    <p className='text-nowrap'>Кол-во номеров</p>
                    <Controller
                      control={form.control}
                      name={`roomTypes.${index}.count`}
                      render={({ field, fieldState }) => (
                        <NumberField
                          size='sm'
                          label='Кол-во'
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
            </div>
          ))}
          <Button
            className='flex w-max items-center gap-1 text-sm opacity-75'
            intent='ghost'
            size='sm'
            onPress={() => roomTypesFieldArray.append({} as never)}
          >
            <HiOutlineOfficeBuilding />
            Добавить номер
          </Button>
        </div>
        <p className='mb-2'>Описание</p>
        <div className='mb-4'>
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
        <div className='mb-4 flex items-center gap-2'>
          <div className='flex items-center gap-2'>
            <p className='font-medium'>Заезд ({DateTime.local().offsetNameShort})</p>
            <Controller
              control={form.control}
              name='checkinAt'
              render={({ field, fieldState }) => (
                <TimeField
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
          <div className='flex items-center gap-2'>
            <p className='font-medium'>Выезд ({DateTime.local().offsetNameShort})</p>
            <Controller
              control={form.control}
              name='checkoutAt'
              render={({ field, fieldState }) => (
                <TimeField
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

        <p className='mb-2'>Питание</p>
        <div className='mb-4 flex items-center gap-2'>
          <Controller
            control={form.control}
            name='foodTypes'
            render={({ field, fieldState }) => (
              <div>
                <div className='w-fit'>
                  <Select
                    size='sm'
                    label='Тип питания'
                    intent='primary'
                    onSelectionChange={(v) => {
                      field.onChange(unique(field.value.concat([v.toString()])))
                    }}
                    items={Object.keys(FoodTypes).map((id) => ({ id, name: FoodTypes[id] }))}
                    errorMessage={fieldState.error?.message}
                    isInvalid={fieldState.invalid}
                    isDisabled={field.disabled}
                    {...omit(field, ['disabled', 'onChange', 'value', 'ref'])}
                  >
                    {(v) => <Item key={v.id}>{v.name}</Item>}
                  </Select>
                </div>
                <div className='mt-2 flex flex-wrap items-center gap-2'>
                  {field.value.map((v) => (
                    <Button
                      key={v}
                      type='button'
                      onPress={() => field.onChange(field.value.filter((t) => t !== v))}
                      intent='primary'
                      size='sm'
                      className='flex items-center gap-1'
                    >
                      {FoodTypes[v]}
                      <HiX />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          />
        </div>
        <div className='mb-2 flex items-center gap-2'>
          <p>Фотографии</p>
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
            <div className='relative'>
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
              <img key={field.id} className='h-48' src={field.previewUrl} />
            </div>
          ))}
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
