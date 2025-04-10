import { Controller, useForm } from 'react-hook-form'
import { HiArrowLeft } from 'react-icons/hi2'
import { Item } from 'react-stately'

import Button from '@/components/ui/button'
import Select from '@/components/ui/select'
import TextField from '@/components/ui/text-field'
import { requiredFieldRefine } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { omit } from 'radashi'
import { z } from 'zod'

import Queries from '@/shared/queries'

export const Route = createFileRoute('/_private/_layout/excursions_/new')({
  component: RouteComponent,
})

const formScheme = z.object({
  title: z.string().refine(...requiredFieldRefine()),
  cityId: z
    .number()
    .nullable()
    .refine(...requiredFieldRefine()),
  countryId: z
    .number()
    .nullable()
    .refine(...requiredFieldRefine()),
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const availableCities = useQuery(Queries.excursions.cities)
  const availableCountries = useQuery(Queries.excursions.countries)

  const form = useForm<z.infer<typeof formScheme>>({
    resolver: zodResolver(formScheme),
    defaultValues: {
      title: '',
      cityId: 0,
      countryId: 0,
    },
  })

  const onSubmit = form.handleSubmit((vals) => {
    console.log(vals)
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
      <div className='w-min min-w-2xl'>
        <div className='mb-8 grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2 [&_p]:text-end'>
          <p>Название</p>
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
                isDisabled={!availableCountries.data?.length || field.disabled}
                {...omit(field, ['disabled', 'onChange', 'value', 'ref'])}
              >
                {(item) => <Item key={item.id}>{item.name}</Item>}
              </Select>
            )}
          />
        </div>
      </div>
      <div>
        <p>Точки экскурсионного маршрута</p>
      </div>
    </form>
  )
}
