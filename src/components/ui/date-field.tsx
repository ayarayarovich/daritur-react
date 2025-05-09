import { ForwardedRef, forwardRef, useRef } from 'react'
import { AriaDateFieldProps, DateValue, useDateField, useDateSegment, useObjectRef } from 'react-aria'
import { DateSegmentProps } from 'react-aria-components'
import { DateFieldState, useDateFieldState } from 'react-stately'

import { twMergifyCva } from '@/lib/utils'
import { createCalendar } from '@internationalized/date'
import { cva, VariantProps } from 'class-variance-authority'

const boxCva = twMergifyCva(
  cva(['rounded-lg relative border-2 overflow-hidden'], {
    variants: {
      intent: {
        primary: ['shadow-[0px_0px_2px_0px] transition-colors shadow-[#C4C4C4] border-transparent focus-within:border-[#C4C4C4]/50'],
      },
      isDisabled: {
        false: null,
        true: ['opacity-50'],
      },
      isInvalid: {
        false: null,
        true: ['border-red-400 focus-within:border-red-400'],
      },
    },
  }),
)

const labelCva = twMergifyCva(
  cva(['absolute top-1/2 -translate-y-1/2 inset-x-0 w-full pointer-events-none'], {
    variants: {
      intent: {
        primary: ['text-gray-4'],
      },
      size: {
        md: ['text-lg', 'px-4'],
        sm: ['px-4 text-sm'],
      },
    },
  }),
)

const fieldCva = twMergifyCva(
  cva(['w-full outline-none flex justify-center gap-0.5'], {
    variants: {
      intent: {
        primary: ['text-gray-1 bg-white'],
      },
      size: {
        md: ['px-4 py-2.5'],
        sm: ['px-4 py-1 text-sm'],
      },
    },
  }),
)

type Variants = VariantProps<typeof labelCva> & VariantProps<typeof boxCva> & VariantProps<typeof fieldCva>

const DateField = forwardRef(
  ({ intent = 'primary', size = 'md', ...props }: AriaDateFieldProps<DateValue> & Variants, ref: ForwardedRef<HTMLInputElement>) => {
    const { label } = props
    const objRef = useObjectRef(ref)
    const state = useDateFieldState({
      ...props,
      locale: 'ru-RU',
      createCalendar,
    } as never)
    const { labelProps, fieldProps, descriptionProps, errorMessageProps, isInvalid } = useDateField(props, state as never, objRef)

    return (
      <div>
        <div className={boxCva({ intent, isDisabled: props.isDisabled, isInvalid })}>
          <label className={labelCva({ intent, size, className: 'hidden peer-placeholder-shown:block' })} {...labelProps}>
            {label}
          </label>
          <div className={fieldCva({ intent, size })} {...fieldProps} ref={objRef}>
            {state.segments.map((segment, i) => (
              <DateSegment key={i} segment={segment} state={state} />
            ))}
          </div>
        </div>
        {props.description && (
          <div {...descriptionProps} style={{ fontSize: 12 }}>
            {props.description}
          </div>
        )}
        {isInvalid && (
          <div {...errorMessageProps} style={{ color: 'red', fontSize: 12 }}>
            {props.errorMessage instanceof Function ? undefined : props.errorMessage}
          </div>
        )}
      </div>
    )
  },
)

const DateSegment = ({ segment, state }: DateSegmentProps & { state: DateFieldState }) => {
  const ref = useRef(null)
  const { segmentProps } = useDateSegment(segment, state as never, ref)

  return (
    <div {...segmentProps} ref={ref} className={`segment ${segment.isPlaceholder ? 'placeholder' : ''}`}>
      {segment.text}
    </div>
  )
}

export default DateField
