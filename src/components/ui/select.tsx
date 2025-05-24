import { useRef } from 'react'
import { AriaSelectOptions, HiddenSelect, useSelect } from 'react-aria'
import { Button } from 'react-aria-components'
import { HiX } from 'react-icons/hi'
import { HiArrowDown } from 'react-icons/hi2'
import { useSelectState } from 'react-stately'

import MyButton from '@/components/ui/button'
import { cn, twMergifyCva } from '@/lib/utils'
import { CollectionBase } from '@react-types/shared'
import { cva, VariantProps } from 'class-variance-authority'
import { useResizeObserver } from 'usehooks-ts'

// Reuse the ListBox, Popover, and Button from your component library. See below for details.
import ListBox from './listbox'
import Popover from './popover'

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

const buttonCva = twMergifyCva(
  cva(['outline-none w-full'], {
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

type Variants = VariantProps<typeof labelCva> & VariantProps<typeof boxCva> & VariantProps<typeof buttonCva>

interface Props<T> extends AriaSelectOptions<T>, CollectionBase<T>, Omit<Variants, 'isDisabled' | 'isInvalid'> {
  optional?: boolean
}

export default function Select<T extends object>({ size = 'md', intent = 'primary', isInvalid, optional, ...props }: Props<T>) {
  // Create state based on the incoming props
  const state = useSelectState(props)

  // Get props for child elements from useSelect
  const ref = useRef(null)
  const { width } = useResizeObserver({ ref, box: 'border-box' })
  const { labelProps, triggerProps, valueProps, menuProps, descriptionProps, errorMessageProps } = useSelect(props, state, ref)

  return (
    <div
      style={
        {
          '--trigger-width': width ? `${width.toString()}px` : 'auto',
        } as Record<string, string>
      }
    >
      <div className='flex items-center gap-1'>
        <div className={boxCva({ intent, isDisabled: props.isDisabled, isInvalid })}>
          <Button
            {...triggerProps}
            ref={ref}
            className={buttonCva({ intent, size, className: 'flex cursor-pointer items-center justify-between gap-2' })}
          >
            <span {...valueProps}>{state.selectedItem ? state.selectedItem.rendered : (props.placeholder ?? 'Выберите')}</span>
            <HiArrowDown className={cn('transition-transform', state.isOpen ? 'rotate-180' : 'rotate-0')} />
          </Button>
          <label className={labelCva({ intent, size, className: 'hidden peer-placeholder-shown:block' })} {...labelProps}>
            {props.label}
          </label>
        </div>
        {!!optional && !!state.selectedItem && (
          <MyButton type='button' intent='secondary' size='xs' onPress={() => state.setSelectedKey(null)}>
            <HiX />
          </MyButton>
        )}
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
      <div className='hidden' aria-hidden='false'>
        <HiddenSelect isDisabled={props.isDisabled} state={state} triggerRef={ref} label={props.label} name={props.name} />
      </div>
      {state.isOpen && (
        <Popover state={state} triggerRef={ref} placement='bottom'>
          <div className='py-2.5' style={{ minWidth: width ? width.toString() + 'px' : 'auto' }}>
            <ListBox {...menuProps} state={state}>
              {props.children as never}
            </ListBox>
          </div>
        </Popover>
      )}
    </div>
  )
}
