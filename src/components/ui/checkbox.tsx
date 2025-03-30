import { useRef } from 'react'
import { AriaCheckboxProps, mergeProps, useCheckbox, useFocusRing, VisuallyHidden } from 'react-aria'
import { useToggleState } from 'react-stately'

import { cn } from '@/lib/utils'

export default function Checkbox(props: AriaCheckboxProps) {
  const state = useToggleState(props)
  const ref = useRef(null)
  const { inputProps } = useCheckbox(props, state, ref)
  const { isFocusVisible, focusProps } = useFocusRing()
  const isSelected = state.isSelected && !props.isIndeterminate
  const isSomehowSelected = state.isSelected || props.isIndeterminate

  return (
    <label className={cn('flex items-center', props.isDisabled ? 'opacity-40' : 'cursor-pointer opacity-100')}>
      <VisuallyHidden>
        <input {...mergeProps(inputProps, focusProps)} ref={ref} />
      </VisuallyHidden>
      <svg
        className={cn('rounded-sm transition-shadow', isFocusVisible && 'ring-gray-1 ring ring-offset-0')}
        width={24}
        height={24}
        aria-hidden='true'
        style={{ marginRight: 4 }}
      >
        <rect
          className={cn('stroke-gray-4 fill-none', isSomehowSelected && 'fill-teal-500')}
          rx={2}
          ry={2}
          x={isSelected ? 4 : 5}
          y={isSelected ? 4 : 5}
          width={isSelected ? 16 : 14}
          height={isSelected ? 16 : 14}
          strokeWidth={2}
        />
        {isSelected && (
          <path
            className='fill-white'
            transform='translate(7 7)'
            d={`M3.788 9A.999.999 0 0 1 3 8.615l-2.288-3a1 1 0 1 1
            1.576-1.23l1.5 1.991 3.924-4.991a1 1 0 1 1 1.576 1.23l-4.712
            6A.999.999 0 0 1 3.788 9z`}
          />
        )}
        {props.isIndeterminate && <rect className='fill-white' x={8} y={11} width={8} height={2} />}
      </svg>
      {props.children}
    </label>
  )
}
