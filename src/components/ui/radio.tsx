import { createContext, PropsWithChildren, useContext, useRef } from 'react'
import { AriaRadioGroupProps, AriaRadioProps, useFocusRing, useRadio, useRadioGroup, VisuallyHidden } from 'react-aria'
import { RadioGroupState, useRadioGroupState } from 'react-stately'

import { cn } from '@/lib/utils'

const RadioContext = createContext<RadioGroupState | null>(null)

export function RadioGroup(props: PropsWithChildren<AriaRadioGroupProps>) {
  const { children, label, description, errorMessage } = props
  const state = useRadioGroupState(props)
  const { radioGroupProps, labelProps, descriptionProps, errorMessageProps } = useRadioGroup(props, state)

  return (
    <div {...radioGroupProps}>
      <span {...labelProps}>{label}</span>
      <RadioContext.Provider value={state}>{children}</RadioContext.Provider>
      {description && (
        <div {...descriptionProps} style={{ fontSize: 12 }}>
          {description}
        </div>
      )}
      {errorMessage && state.isInvalid && (
        <div {...errorMessageProps} style={{ color: 'red', fontSize: 12 }}>
          {errorMessage instanceof Function ? undefined : errorMessage}
        </div>
      )}
    </div>
  )
}

export function Radio(props: AriaRadioProps) {
  const { children } = props
  const state = useContext(RadioContext)
  if (state == null) {
    throw new Error('Radio has to be child of RadioGroup')
  }
  const ref = useRef(null)
  const { inputProps, isSelected, isDisabled } = useRadio(props, state, ref)
  const { isFocusVisible, focusProps } = useFocusRing()
  const strokeWidth = isSelected ? 4 : 2

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        opacity: isDisabled ? 0.4 : 1,
      }}
    >
      <VisuallyHidden>
        <input {...inputProps} {...focusProps} ref={ref} />
      </VisuallyHidden>
      <svg width={24} height={24} aria-hidden='true' style={{ marginRight: 4 }}>
        <circle
          className={cn(isSelected ? 'stroke-teal-500' : 'stroke-gray-4')}
          cx={12}
          cy={12}
          r={8 - strokeWidth / 2}
          fill='none'
          strokeWidth={strokeWidth}
        />
        {isFocusVisible && <circle className='stroke-teal-500' cx={12} cy={12} r={11} fill='none' strokeWidth={2} />}
      </svg>
      {children}
    </label>
  )
}
