import { useRef } from 'react'
import { AriaComboBoxOptions, useComboBox, useFilter } from 'react-aria'
import { Button } from 'react-aria-components'
import { HiArrowDown } from 'react-icons/hi2'
import { useComboBoxState } from 'react-stately'

import { cn, twMergifyCva } from '@/lib/utils'
import { CollectionBase, CollectionChildren } from '@react-types/shared'
import { cva, VariantProps } from 'class-variance-authority'
import { useResizeObserver } from 'usehooks-ts'

// Reuse the ListBox, Popover, and Button from your component library. See below for details.
import ListBox from './listbox'
import Popover from './popover'

const boxCva = twMergifyCva(
  cva(['rounded-lg relative border-2 overflow-hidden flex items-center'], {
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

const inputCva = twMergifyCva(
  cva(['w-full placeholder:opacity-0 grow outline-none'], {
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

const wrapperCva = twMergifyCva(
  cva([], {
    variants: {
      grow: {
        true: ['grow'],
        false: null,
      },
    },
  }),
)

type Variants = VariantProps<typeof wrapperCva> &
  VariantProps<typeof labelCva> &
  VariantProps<typeof boxCva> &
  VariantProps<typeof buttonCva> &
  VariantProps<typeof inputCva>

interface Props<T extends object>
  extends Omit<AriaComboBoxOptions<T>, 'inputRef' | 'buttonRef' | 'listBoxRef' | 'popoverRef'>,
    CollectionBase<T>,
    Omit<Variants, 'isDisabled' | 'isInvalid'> {}

export default function ComboBox<T extends object>({ size = 'md', intent = 'primary', grow = false, isInvalid, ...props }: Props<T>) {
  const { contains } = useFilter({ sensitivity: 'base' })
  const state = useComboBoxState({ ...props, defaultFilter: contains })

  const boxRef = useRef(null)
  const buttonRef = useRef(null)
  const inputRef = useRef(null)
  const listBoxRef = useRef(null)
  const popoverRef = useRef(null)

  const { width } = useResizeObserver({ ref: boxRef, box: 'border-box' })
  const { buttonProps, inputProps, listBoxProps, labelProps, descriptionProps, errorMessageProps } = useComboBox<T>(
    {
      ...props,
      inputRef,
      buttonRef,
      listBoxRef,
      popoverRef,
    },
    state,
  )

  return (
    <div
      className={wrapperCva({ grow })}
      style={
        {
          '--trigger-width': width ? `${width.toString()}px` : 'auto',
        } as Record<string, string>
      }
    >
      <div className={boxCva({ intent, isDisabled: props.isDisabled, isInvalid })} ref={boxRef}>
        <input
          className={inputCva({ intent, size, className: 'peer' })}
          {...inputProps}
          placeholder={props.label?.toString()}
          ref={inputRef}
        />
        <label className={labelCva({ intent, size, className: 'hidden peer-placeholder-shown:block' })} {...labelProps}>
          {props.label}
        </label>
        <div>
          <Button
            {...buttonProps}
            ref={buttonRef}
            type='button'
            className={buttonCva({ intent, size, className: 'flex cursor-pointer items-center justify-between gap-2' })}
          >
            <HiArrowDown className={cn('transition-transform', state.isOpen ? 'rotate-180' : 'rotate-0')} />
          </Button>
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
      {state.isOpen && (
        <Popover state={state} ref={popoverRef} triggerRef={boxRef} placement='bottom'>
          <div
            className='py-2.5'
            style={{ maxWidth: width ? width.toString() + 'px' : 'auto', minWidth: width ? width.toString() + 'px' : 'auto' }}
          >
            <ListBox {...listBoxProps} state={state} ref={listBoxRef}>
              {props.children as CollectionChildren<object>}
            </ListBox>
          </div>
        </Popover>
      )}
    </div>
  )
}
