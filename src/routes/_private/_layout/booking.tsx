import { useCallback, useMemo, useState } from 'react'
import { useCalendar } from 'react-aria'
import { Button as AriaButton, CheckboxGroup, Checkbox as RACCheckbox, useLocale } from 'react-aria-components'
import toast from 'react-hot-toast'
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi'
import { HiX } from 'react-icons/hi'
import { HiPencil, HiPlus, HiPrinter, HiTrash } from 'react-icons/hi2'
import { useCalendarState } from 'react-stately'

import { DataTable } from '@/components/data-table'
import Button from '@/components/ui/button'
import Checkbox from '@/components/ui/checkbox'
import EventsCalendarGrid from '@/components/ui/events-calendar'
import TextField from '@/components/ui/text-field'
import { cn, extractErrorMessageFromAPIError } from '@/lib/utils'
import { BookingService } from '@/services'
import { createCalendar, parseDate, today } from '@internationalized/date'
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useDebounce } from '@uidotdev/usehooks'
import { DateTime } from 'luxon'
import { z } from 'zod'

import { Query } from '@/shared'
import Queries from '@/shared/queries'

export const Route = createFileRoute('/_private/_layout/booking')({
  component: RouteComponent,
  loader: async () => {
    await Promise.all([Query.client.prefetchQuery(Queries.booking.info)])
  },
  validateSearch: z.object({
    pageIndex: z
      .number()
      .optional()
      .default(0)
      .transform((page) => Math.max(0, page)),
    pageSize: z
      .number()
      .optional()
      .default(10)
      .transform((size) => Math.max(0, Math.min(size, 50))),
    search: z.string().optional().default(''),
  }),
})

function RouteComponent() {
  const searchParams = Route.useSearch()

  const navigate = Route.useNavigate()
  const setPaggination = useCallback(
    (p: { pageIndex: number; pageSize: number }) => {
      navigate({
        to: '.',
        search: {
          ...searchParams,
          ...p,
        },
        replace: true,
      })
    },
    [navigate, searchParams],
  )
  const setSearch = useCallback(
    (search: string) => {
      navigate({
        to: '.',
        search: {
          ...searchParams,
          search,
        },
        replace: true,
      })
    },
    [searchParams, navigate],
  )

  const debouncedSearch = useDebounce(searchParams.search, 500)

  const [filters, setFilters] = useState<string[]>([])
  const infoQuery = useSuspenseQuery(Queries.booking.info)
  const listQuery = useQuery({
    ...Queries.booking.list({
      offset: searchParams.pageIndex * searchParams.pageSize,
      limit: searchParams.pageSize,
      search: debouncedSearch,
      filters,
    }),
    placeholderData: (v) => v,
  })

  type Entity = NonNullable<typeof listQuery.data>['items'][number]

  const columnHelper = useMemo(() => createColumnHelper<Entity>(), [])

  const columns = [
    columnHelper.accessor('id', {
      header: '№',
    }),

    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          isSelected={table.getIsAllPageRowsSelected()}
          isIndeterminate={table.getIsSomePageRowsSelected()}
          onChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox isSelected={row.getIsSelected()} onChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor('number', {
      header: '№ заявки',
      size: 9999,
    }),
    columnHelper.accessor('tour.id', {
      header: '№ тура',
      size: 9999,
    }),
    columnHelper.accessor('tour.name', {
      header: 'Название тура',
      size: 9999,
    }),
    columnHelper.accessor('createdAt', {
      header: 'Дата создания',
      size: 9999,
      cell: (ctx) => ctx.getValue().toLocaleString(DateTime.DATE_HUGE),
    }),
    columnHelper.accessor('status', {
      header: 'Статус',
      size: 9999,
      cell: (ctx) =>
        ({
          created: 'Создана',
          approved: 'Подтверждена',
          paid: 'Оплачена',
          declined: 'Отклонена',
        })[ctx.getValue()] || 'Неизвестно',
    }),
  ]
  if (infoQuery.data.canEdit) {
    columns.push(
      columnHelper.display({
        id: 'edit',
        cell: ({ row }) => (
          <Button
            type='button'
            size='xs'
            intent='ghost'
            onPress={() => navigate({ to: './$id', params: { id: row.original.id.toString() } })}
          >
            <HiPencil />
          </Button>
        ),
        enableSorting: false,
        enableHiding: false,
      }),
    )
  }

  const table = useReactTable({
    columns,
    data: listQuery.data?.items || [],
    rowCount: listQuery.data?.count || 0,
    state: {
      pagination: {
        pageIndex: searchParams.pageIndex,
        pageSize: searchParams.pageSize,
      },
    },
    onPaginationChange: (v) => {
      if (typeof v === 'function') {
        const newState = v({
          pageIndex: searchParams.pageIndex,
          pageSize: searchParams.pageSize,
        })
        setPaggination(newState)
      } else {
        setPaggination(v)
      }
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  const deleteMutation = useMutation({
    mutationFn: BookingService.deleteBookings,
    onSuccess: async () => {
      await Query.client.invalidateQueries({
        queryKey: Queries.booking._def,
      })
      table.toggleAllRowsSelected(false)
      toast.success('Заявки удалены!')
    },
    onError: (err) => {
      toast.error(extractErrorMessageFromAPIError(err) || 'Что-то пошло не так')
    },
  })

  const downloadOffersMutation = useMutation({
    mutationFn: BookingService.downloadOffers,
    onSuccess: async () => {
      await Query.client.invalidateQueries({
        queryKey: Queries.booking._def,
      })
      table.toggleAllRowsSelected(false)
    },
  })

  const downloadOffers = (ids: number[]) => {
    toast.promise(downloadOffersMutation.mutateAsync({ ids }), {
      loading: 'Секунду...',
      error: (err) => extractErrorMessageFromAPIError(err) || 'Что-то пошло не так',
      success: 'Заявки выгружены',
    })
  }

  return (
    <div className='flex flex-col items-stretch gap-16 px-5 py-22'>
      <div className='flex flex-col items-stretch gap-3'>
        <div>
          {infoQuery.data.canCreate && (
            <Button
              type='button'
              onPress={() => navigate({ to: './new' })}
              size='sm'
              intent='warning'
              className='flex items-center justify-center gap-1'
            >
              <HiPlus />
              Создать заявку
            </Button>
          )}
        </div>
        <div className='flex items-center gap-4'>
          <div className='text-xl font-medium text-nowrap'>Список заявок</div>
          <CheckboxGroup className='flex flex-wrap items-center gap-2' value={filters} onChange={setFilters}>
            <RACCheckbox
              value='created'
              className='group data flex cursor-pointer items-center gap-1 rounded-md bg-[#E9D8FD] px-3 py-1 text-base font-medium text-[#44337A]/80 data-[selected=true]:bg-[#805AD5] data-[selected=true]:text-white'
            >
              <div>Созданы</div>
              <HiX className='hidden text-white opacity-50 group-data-[selected=true]:block' />
            </RACCheckbox>
            <RACCheckbox
              value='approved'
              className='group data flex cursor-pointer items-center gap-1 rounded-md bg-[#E2E8F0] px-3 py-1 text-base font-medium text-[#1A202C]/80 data-[selected=true]:bg-[#718096] data-[selected=true]:text-white'
            >
              <div>Подтверждены</div>
              <HiX className='hidden text-white opacity-50 group-data-[selected=true]:block' />
            </RACCheckbox>
            <RACCheckbox
              value='declined'
              className='group data flex cursor-pointer items-center gap-1 rounded-md bg-[#FEEBCB] px-3 py-1 text-base font-medium text-[#7B341E]/80 data-[selected=true]:bg-[#DD6B20] data-[selected=true]:text-white'
            >
              <div>Отменены</div>
              <HiX className='hidden text-white opacity-50 group-data-[selected=true]:block' />
            </RACCheckbox>
            <RACCheckbox
              value='paid'
              className='group data flex cursor-pointer items-center gap-1 rounded-md bg-[#E9D8FD] px-3 py-1 text-base font-medium text-[#44337A]/80 data-[selected=true]:bg-[#805AD5] data-[selected=true]:text-white'
            >
              <div>Оплачены</div>
              <HiX className='hidden text-white opacity-50 group-data-[selected=true]:block' />
            </RACCheckbox>
          </CheckboxGroup>
        </div>
        <div className='max-w-sm'>
          {infoQuery.data.canSearch && <TextField label='Поиск...' value={searchParams.search} onChange={setSearch} />}
        </div>
        <div className='flex items-center gap-1'>
          {infoQuery.data.canDelete && (
            <Button
              type='button'
              onPress={() => deleteMutation.mutate({ ids: table.getSelectedRowModel().rows.map((v) => v.original.id) })}
              isDisabled={table.getSelectedRowModel().rows.length === 0 || deleteMutation.isPending}
              size='sm'
              intent='ghost'
              className='flex items-center justify-center gap-1'
            >
              <HiTrash />
              Удалить
            </Button>
          )}
          <Button
            type='button'
            onPress={() => downloadOffers(table.getSelectedRowModel().rows.map((v) => v.original.id))}
            isDisabled={table.getSelectedRowModel().rows.length === 0 || downloadOffersMutation.isPending}
            size='sm'
            intent='ghost'
            className='flex items-center justify-center gap-1'
          >
            <HiPrinter />
            Напечатать договор
          </Button>
        </div>
        <div className='w-min min-w-2xl'>
          <DataTable table={table} />
        </div>
        <ToursCalendar filters={[]} />
      </div>
    </div>
  )
}

function ToursCalendar(props: { filters: string[] }) {
  const { locale } = useLocale()
  const [visibleDuration, setVisibleDuration] = useState<'month' | 'week'>('month')
  const state = useCalendarState({
    createCalendar,
    isDisabled: true,
    visibleDuration: {
      month: { months: 1 },
      week: { weeks: 1 },
    }[visibleDuration],
    locale,
  })
  const calendarQuery = useQuery(
    Queries.tours.calendar({
      date_gte: DateTime.fromJSDate(state.visibleRange.start.toDate(state.timeZone)),
      date_lte: DateTime.fromJSDate(state.visibleRange.end.toDate(state.timeZone)),
      filters: props.filters,
    }),
  )

  const { calendarProps, prevButtonProps, nextButtonProps, title } = useCalendar(
    {
      'aria-label': 'Event date',
    },
    state as never,
  )

  const focusToday = () => {
    state.setFocusedDate(today(state.timeZone))
  }

  return (
    <div className='flex flex-col items-stretch gap-16'>
      <div {...calendarProps} className='flex flex-col items-stretch gap-3'>
        <div className='flex items-center gap-4'>
          <div className='text-xl font-medium text-nowrap'>Календарь туров</div>
        </div>
        <div className='w-fit min-w-2xl'>
          <div className='mb-2 flex items-center'>
            <div className='flex flex-1 justify-start'>
              <button
                onClick={focusToday}
                type='button'
                className='border-gray-5 rounded-full border px-4 py-2 not-disabled:cursor-pointer'
              >
                Сегодня:{' '}
                {today(state.timeZone).toDate(state.timeZone).toLocaleDateString(undefined, {
                  dateStyle: 'full',
                })}
              </button>
            </div>
            <div className='flex items-center gap-2'>
              <AriaButton
                {...prevButtonProps}
                type='button'
                className='border-gray-5 rounded-full border px-2 py-2 not-disabled:cursor-pointer'
              >
                <BiChevronLeft className='size-5' />
              </AriaButton>
              <div className='min-w-[15ch] text-center'>{title}</div>
              <AriaButton
                {...nextButtonProps}
                type='button'
                className='border-gray-5 rounded-full border px-2 py-2 not-disabled:cursor-pointer'
              >
                <BiChevronRight className='size-5' />
              </AriaButton>
            </div>
            <div className='flex flex-1 items-stretch justify-end *:not-first:border-l-0 *:first:rounded-l-full *:last:rounded-r-full'>
              <button
                type='button'
                onClick={() => setVisibleDuration('week')}
                className={cn('border-gray-5 border px-4 py-2 not-disabled:cursor-pointer', visibleDuration === 'week' && 'bg-gray-6')}
              >
                Неделя
              </button>
              <button
                type='button'
                onClick={() => setVisibleDuration('month')}
                className={cn('border-gray-5 border px-4 py-2 not-disabled:cursor-pointer', visibleDuration === 'month' && 'bg-gray-6')}
              >
                Месяц
              </button>
            </div>
          </div>
          <div className={cn('transition-opacity', calendarQuery.isLoading && 'opacity-50')}>
            <EventsCalendarGrid
              state={state}
              weekdayStyle='short'
              events={
                calendarQuery.data?.map((v) => ({
                  date: parseDate(v.date),
                  items: v.items,
                })) ?? []
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
