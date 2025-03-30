import { HiChevronDoubleLeft, HiChevronDoubleRight, HiChevronLeft, HiChevronRight } from 'react-icons/hi2'

import Button from '@/components/ui/button'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table } from '@tanstack/react-table'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className='flex items-center space-x-6 lg:space-x-8'>
      {/* <div className='flex items-center space-x-2'>
          <p className='text-sm font-medium'>Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}
      <div className='flex items-center space-x-2'>
        <Button intent='ghost' size='sm' onPress={() => table.setPageIndex(0)} isDisabled={!table.getCanPreviousPage()}>
          <span className='sr-only'>Go to first page</span>
          <HiChevronDoubleLeft className='text-sm' />
        </Button>
        <Button intent='ghost' size='sm' onPress={() => table.previousPage()} isDisabled={!table.getCanPreviousPage()}>
          <span className='sr-only'>Go to previous page</span>
          <HiChevronLeft className='text-sm' />
        </Button>
        {[...new Array(Math.max(table.getPageCount(), 1))].map((_, idx) => (
          <Button
            size='sm'
            intent={table.getState().pagination.pageIndex === idx ? 'secondary' : 'ghost'}
            key={idx}
            type='button'
            onPress={() => table.setPageIndex(idx)}
          >
            {idx + 1}
          </Button>
        ))}
        <Button intent='ghost' size='sm' onPress={() => table.nextPage()} isDisabled={!table.getCanNextPage()}>
          <span className='sr-only'>Go to next page</span>
          <HiChevronRight />
        </Button>
        <Button intent='ghost' size='sm' onPress={() => table.setPageIndex(table.getPageCount() - 1)} isDisabled={!table.getCanNextPage()}>
          <span className='sr-only'>Go to last page</span>
          <HiChevronDoubleRight className='text-sm' />
        </Button>
      </div>
    </div>
  )
}
