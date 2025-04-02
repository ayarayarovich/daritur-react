import { useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi2'

import { DataTable } from '@/components/data-table'
import Button from '@/components/ui/button'
import Checkbox from '@/components/ui/checkbox'
import TextField from '@/components/ui/text-field'
import { extractErrorMessageFromAPIError } from '@/lib/utils'
import { CreateOfficeModal, CreateStaffModal, UpdateOfficeModal, UpdateStaffModal } from '@/modals'
import { StaffService } from '@/services'
import { useMutation, useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createColumnHelper, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useDebounce } from '@uidotdev/usehooks'
import { z } from 'zod'

import { Query } from '@/shared'
import Queries from '@/shared/queries'

export const Route = createFileRoute('/_private/_layout/staffs')({
  component: RouteComponent,
  loader: async () => {
    await Promise.all([Query.client.prefetchQuery(Queries.employees.info), Query.client.prefetchQuery(Queries.offices.info)])
  },
  validateSearch: z.object({
    employeesPageIndex: z
      .number()
      .optional()
      .default(0)
      .transform((page) => Math.max(0, page)),
    employeesPageSize: z
      .number()
      .optional()
      .default(10)
      .transform((size) => Math.max(0, Math.min(size, 50))),
    employeesSearch: z.string().optional().default(''),
    officesPageIndex: z
      .number()
      .optional()
      .default(0)
      .transform((page) => Math.max(0, page)),
    officesPageSize: z
      .number()
      .optional()
      .default(10)
      .transform((size) => Math.max(0, Math.min(size, 50))),
    officesSearch: z.string().optional().default(''),
  }),
})

function RouteComponent() {
  return (
    <div className='flex flex-col items-stretch gap-16 px-5 py-22'>
      <Offices />
      <Employees />
    </div>
  )
}

function Offices() {
  const searchParams = Route.useSearch()

  const createOfficeModal = CreateOfficeModal.use()
  const updateOfficeModal = UpdateOfficeModal.use()

  const navigate = Route.useNavigate()
  const setPaggination = useCallback(
    (p: { pageIndex: number; pageSize: number }) => {
      navigate({
        to: '.',
        search: {
          ...searchParams,
          officesPageIndex: p.pageIndex,
          officesPageSize: p.pageSize,
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
          officesSearch: search,
        },
        replace: true,
      })
    },
    [searchParams, navigate],
  )

  const debouncedSearch = useDebounce(searchParams.officesSearch, 500)

  const infoQuery = useSuspenseQuery(Queries.offices.info)
  const listQuery = useQuery({
    ...Queries.offices.list({
      offset: searchParams.officesPageIndex * searchParams.officesPageSize,
      limit: searchParams.officesPageSize,
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
    columnHelper.accessor('name', {
      header: 'Название',
      size: 9999,
    }),
    columnHelper.accessor('cityName', {
      header: 'Город',
      size: 9999,
    }),
    columnHelper.accessor('phone', {
      header: 'Телефон',
      size: 9999,
    }),
  ]
  if (infoQuery.data.canEdit) {
    columns.push(
      columnHelper.display({
        id: 'edit',
        cell: ({ row }) => (
          <Button type='button' size='xs' intent='ghost' onPress={() => updateOfficeModal.open({ officeId: row.original.id })}>
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
        pageIndex: searchParams.officesPageIndex,
        pageSize: searchParams.officesPageSize,
      },
    },
    onPaginationChange: (v) => {
      if (typeof v === 'function') {
        const newState = v({
          pageIndex: searchParams.officesPageIndex,
          pageSize: searchParams.officesPageSize,
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
    mutationFn: StaffService.deleteOffices,
    onSuccess: async () => {
      await Query.client.invalidateQueries({
        queryKey: Queries.offices._def,
      })
      table.toggleAllRowsSelected(false)
      toast.success('Офисы удалены!')
    },
    onError: (err) => {
      toast.error(extractErrorMessageFromAPIError(err) || 'Что-то пошло не так')
    },
  })

  return (
    <div className='flex flex-col items-stretch gap-3'>
      <div className='flex items-center gap-4'>
        <div>Офисы ({listQuery.data?.count ?? 0})</div>
        {infoQuery.data.canCreate && (
          <Button
            type='button'
            size='sm'
            onPress={() => createOfficeModal.open()}
            intent='warning'
            className='flex items-center justify-center gap-1'
          >
            <HiPlus />
            Добавить офис
          </Button>
        )}
      </div>
      <div className='max-w-sm'>
        {infoQuery.data.canSearch && <TextField label='Поиск...' value={searchParams.officesSearch} onChange={setSearch} />}
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
  )
}

function Employees() {
  const searchParams = Route.useSearch()

  const createStaffModal = CreateStaffModal.use()
  const updateStaffModal = UpdateStaffModal.use()

  const navigate = Route.useNavigate()
  const setPaggination = useCallback(
    (p: { pageIndex: number; pageSize: number }) => {
      navigate({
        to: '.',
        search: {
          ...searchParams,
          employeesPageIndex: p.pageIndex,
          employeesPageSize: p.pageSize,
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

  const infoQuery = useSuspenseQuery(Queries.employees.info)
  const listQuery = useQuery({
    ...Queries.employees.list({
      offset: searchParams.employeesPageIndex * searchParams.employeesPageSize,
      limit: searchParams.employeesPageSize,
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
    columnHelper.display({
      id: 'fio',
      header: 'ФИО',
      cell: ({ cell }) => [cell.row.original.firstName, cell.row.original.lastName, cell.row.original.middleName].filter(Boolean).join(' '),
      size: 9999,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      size: 9999,
    }),
    columnHelper.accessor('role', {
      header: 'Должность',
      size: 9999,
    }),
  ]
  if (infoQuery.data.canEdit) {
    columns.push(
      columnHelper.display({
        id: 'edit',
        cell: ({ row }) => (
          <Button type='button' size='xs' intent='ghost' onPress={() => updateStaffModal.open({ staffId: row.original.id })}>
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
        pageIndex: searchParams.employeesPageIndex,
        pageSize: searchParams.employeesPageSize,
      },
    },
    onPaginationChange: (v) => {
      if (typeof v === 'function') {
        const newState = v({
          pageIndex: searchParams.employeesPageIndex,
          pageSize: searchParams.employeesPageSize,
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
    mutationFn: StaffService.deleteEmployees,
    onSuccess: async () => {
      await Query.client.invalidateQueries({
        queryKey: Queries.employees._def,
      })
      table.toggleAllRowsSelected(false)
      toast.success('Сотрудники удалены!')
    },
    onError: (err) => {
      toast.error(extractErrorMessageFromAPIError(err) || 'Что-то пошло не так')
    },
  })

  return (
    <div className='flex flex-col items-stretch gap-3'>
      <div className='flex items-center gap-4'>
        <div>Сотрудники ({listQuery.data?.count ?? 0})</div>
        {infoQuery.data.canCreate && (
          <Button
            type='button'
            onPress={() => createStaffModal.open()}
            size='sm'
            intent='warning'
            className='flex items-center justify-center gap-1'
          >
            <HiPlus />
            Добавить сотрудника
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
  )
}
