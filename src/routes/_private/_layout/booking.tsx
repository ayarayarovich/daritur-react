import { useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { HiPencil, HiPlus, HiPrinter, HiTrash } from 'react-icons/hi2'

import { DataTable } from '@/components/data-table'
import Button from '@/components/ui/button'
import Checkbox from '@/components/ui/checkbox'
import TextField from '@/components/ui/text-field'
import { extractErrorMessageFromAPIError } from '@/lib/utils'
import { BookingService } from '@/services'
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

  const infoQuery = useSuspenseQuery(Queries.booking.info)
  const listQuery = useQuery({
    ...Queries.booking.list({
      offset: searchParams.pageIndex * searchParams.pageSize,
      limit: searchParams.pageSize,
      search: debouncedSearch,
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
      </div>
    </div>
  )
}
