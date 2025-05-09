import { useRef } from 'react'
import { mergeProps, useFocusRing, useOption } from 'react-aria'
import { ListState, Node } from 'react-stately'

import clsx from 'clsx'

interface OptionProps<T> {
  state: ListState<T>
  item: Node<T>
}

export default function Option<T extends object>({ item, state }: OptionProps<T>) {
  // Get props for the option element
  const ref = useRef(null)
  const { optionProps, isDisabled, isSelected } = useOption({ key: item.key }, state, ref)

  // Determine whether we should show a keyboard
  // focus ring for accessibility
  const { isFocusVisible, focusProps } = useFocusRing()

  return (
    <li
      {...mergeProps(optionProps, focusProps)}
      className='hover:bg-gray-6 focus-visible:bg-gray-6 outline-none'
      ref={ref}
      data-focus-visible={isFocusVisible}
    >
      <button
        type='button'
        className={clsx(
          'font-montserrat flex w-full cursor-pointer justify-start px-3 py-1 text-start text-sm font-medium outline-none disabled:cursor-default',
          isSelected && 'bg-gray-4',
          isDisabled && 'opacity-50',
        )}
        disabled={isDisabled}
      >
        <span>{item.rendered}</span>
      </button>
    </li>
  )
}
