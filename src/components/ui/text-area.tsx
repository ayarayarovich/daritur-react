import { ForwardedRef, forwardRef } from 'react'
import { useObjectRef, useTextField, type AriaTextFieldProps } from 'react-aria'

import { twMergifyCva } from '@/lib/utils'
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

const inputCva = twMergifyCva(
  cva(['w-full placeholder:opacity-0 outline-none'], {
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

type Variants = VariantProps<typeof labelCva> & VariantProps<typeof boxCva> & VariantProps<typeof inputCva>

const TextField = forwardRef(
  (
    { intent = 'primary', size = 'md', ...props }: AriaTextFieldProps<HTMLTextAreaElement> & Variants,
    ref: ForwardedRef<HTMLTextAreaElement>,
  ) => {
    const { label } = props
    const objRef = useObjectRef(ref)
    const { labelProps, inputProps, descriptionProps, errorMessageProps, isInvalid } = useTextField(
      {
        ...props,
        inputElementType: 'textarea',
      },
      objRef,
    )

    return (
      <div>
        <div className={boxCva({ intent, isDisabled: props.isDisabled, isInvalid })}>
          <textarea
            className={inputCva({ intent, size, className: 'peer' })}
            rows={5}
            {...inputProps}
            placeholder={props.label?.toString()}
            ref={ref}
          />
          <label className={labelCva({ intent, size, className: 'hidden peer-placeholder-shown:block' })} {...labelProps}>
            {label}
          </label>
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

export default TextField
