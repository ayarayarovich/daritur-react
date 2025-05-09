import { useMemo, useRef } from 'react'
import { AriaCalendarCellProps, AriaCalendarGridProps, useCalendarCell, useCalendarGrid, useLocale } from 'react-aria'
import { CalendarState } from 'react-stately'

import { cn } from '@/lib/utils'
import { DateValue, endOfWeek, startOfWeek } from '@internationalized/date'
import { group, mapValues } from 'radashi'

interface Props extends AriaCalendarGridProps {
  state: CalendarState
  events: {
    date: DateValue
    items: {
      title: string
    }[]
  }[]
}

export default function EventsCalendarGrid({ state, events, ...props }: Props) {
  const { locale } = useLocale()
  const { gridProps, headerProps, weekDays } = useCalendarGrid(props, state as never)
  const weeksInMonth = useMemo(() => {
    const start = startOfWeek(state.visibleRange.start as unknown as DateValue, locale)
    const end = endOfWeek(state.visibleRange.end as unknown as DateValue, locale)

    const weeks: DateValue[][] = []
    let current = start

    while (current.compare(end) <= 0) {
      const week: DateValue[] = []
      for (let i = 0; i < 7; i++) {
        week.push(current)
        current = current.add({ days: 1 })
      }
      weeks.push(week)
    }

    return weeks.length
  }, [locale, state.visibleRange.end, state.visibleRange.start])

  const groupedEvents = useMemo(() => {
    const grouped = group(events, (v) => v.date.toString())
    return mapValues(grouped, (v) => v?.flatMap((t) => t.items))
  }, [events])

  return (
    <div className='border-gray-5 rounded-xl border p-2'>
      <table {...gridProps} className='table-fixed border-collapse overflow-hidden rounded-md border-hidden'>
        <thead {...headerProps}>
          <tr>
            {weekDays.map((day, index) => (
              <th className='border-gray-5 border py-3 uppercase' key={index}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
            <tr key={weekIndex} className='align-top'>
              {state
                .getDatesInWeek(weekIndex)
                .map((date, i) =>
                  date ? <EventsCalendarCell groupedEvents={groupedEvents} key={i} state={state} date={date as never} /> : <td key={i} />,
                )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface EventsCalendarCellProps extends AriaCalendarCellProps {
  state: CalendarState
  groupedEvents: Record<
    string,
    | {
        title: string
      }[]
    | undefined
  >
}

function EventsCalendarCell({ state, date, groupedEvents }: EventsCalendarCellProps) {
  const ref = useRef(null)
  const { cellProps, buttonProps, isOutsideVisibleRange, formattedDate } = useCalendarCell({ date }, state as never, ref)

  return (
    <td {...cellProps} className={cn('border-gray-5 relative border', isOutsideVisibleRange && 'bg-gray-6')}>
      <div {...buttonProps} ref={ref} className={cn('flex h-full min-h-32 w-40 flex-col items-stretch gap-1 p-2')}>
        {groupedEvents[date.toString()]?.map((v, idx) => (
          <div
            className={cn(
              'rounded-md border-2 px-2 py-1 text-xs',
              idx % 1 === 0 && 'border-[#805AD5] bg-[#805AD5]/5',
              idx % 2 === 0 && 'border-[#27AE60] bg-[#27AE60]/5',
              idx % 3 === 0 && 'border-[#DD6B20] bg-[#DD6B20]/5',
              idx % 4 === 0 && 'border-[#4FD1C5] bg-[#4FD1C5]/5',
              idx % 5 === 0 && 'border-[#3182CE] bg-[#3182CE]/5',
            )}
            key={v.title + idx}
          >
            {v.title}
          </div>
        ))}
        <div className='mt-1 h-[1em]'></div>
        <div className='text-gray-3 absolute right-2 bottom-2 self-end leading-none'>{formattedDate}</div>
      </div>
    </td>
  )
}
