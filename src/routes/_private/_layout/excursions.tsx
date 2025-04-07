import { useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi2'

import { DataTable } from '@/components/data-table'
import Button from '@/components/ui/button'
import Checkbox from '@/components/ui/checkbox'
import { extractErrorMessageFromAPIError } from '@/lib/utils'
import { ExcursionsService } from '@/services'
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { z } from 'zod'

import { Query } from '@/shared'
import Queries from '@/shared/queries'

export const Route = createFileRoute('/_private/_layout/excursions')({
  component: RouteComponent,
  loader: async () => {
    await Promise.all([Query.client.prefetchQuery(Queries.employees.info)])
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
  // const setSearch = useCallback(
  //   (search: string) => {
  //     navigate({
  //       to: '.',
  //       search: {
  //         ...searchParams,
  //         employeesSearch: search,
  //       },
  //       replace: true,
  //     })
  //   },
  //   [searchParams, navigate],
  // )

  const infoQuery = useSuspenseQuery(Queries.excursions.info)
  const listQuery = useQuery({
    ...Queries.excursions.list({
      offset: searchParams.pageIndex * searchParams.pageSize,
      limit: searchParams.pageSize,
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
    columnHelper.accessor('title', {
      header: 'Название',
      size: 9999,
    }),
    columnHelper.accessor('address', {
      header: 'Адрес',
      size: 9999,
    }),
    columnHelper.accessor('interestsPoints', {
      header: 'Точки интереса',
      size: 9999,
    }),
  ]
  if (infoQuery.data.canEdit) {
    columns.push(
      columnHelper.display({
        id: 'edit',
        cell: () => (
          <Button type='button' size='xs' intent='ghost'>
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
    mutationFn: ExcursionsService.deleteExcursion,
    onSuccess: async () => {
      await Query.client.invalidateQueries({
        queryKey: Queries.excursions._def,
      })
      table.toggleAllRowsSelected(false)
      toast.success('Экскурсии удалены!')
    },
    onError: (err) => {
      toast.error(extractErrorMessageFromAPIError(err) || 'Что-то пошло не так')
    },
  })

  return (
    <div className='flex flex-col items-stretch gap-16 px-5 py-22'>
      <div className='flex flex-col items-stretch gap-3'>
        <div className='flex items-center gap-4'>
          <div className='text-nowrap'>Экскурсии ({listQuery.data?.count ?? 0})</div>
          {infoQuery.data.canCreate && (
            <Button
              type='button'
              onPress={() => navigate({ to: '/excursions/new' })}
              size='sm'
              intent='warning'
              className='flex items-center justify-center gap-1'
            >
              <HiPlus />
              Добавить экскурсию
            </Button>
          )}
        </div>
        <div>
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
        </div>
        <div className='w-min min-w-2xl'>
          <DataTable table={table} />
        </div>
      </div>
    </div>
  )
}
