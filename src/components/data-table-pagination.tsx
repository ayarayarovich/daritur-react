import { HiChevronDoubleLeft, HiChevronDoubleRight, HiChevronLeft, HiChevronRight } from 'react-icons/hi2'
import { Item } from 'react-stately'

import Button from '@/components/ui/button'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table } from '@tanstack/react-table'

import Select from './ui/select'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className='flex flex-col gap-4'>
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
      <div className='flex items-center gap-2'>
        <p className='text-sm'>Отображать по</p>
        <Select
          size='sm'
          aria-label='Rows per page'
          onSelectionChange={(v) => table.setPageSize(Number(v))}
          selectedKey={table.getState().pagination.pageSize.toString()}
          items={[10, 20, 30, 40, 50].map((item) => ({ id: item.toString(), name: item.toString() }))}
        >
          {(item) => (
            <Item key={item.id} textValue={item.name}>
              {item.name}
            </Item>
          )}
        </Select>
      </div>
    </div>
  )
}
