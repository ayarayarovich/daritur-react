import { ForwardedRef, forwardRef } from 'react'
import { useObjectRef, useTextField, type AriaTextFieldProps } from 'react-aria'

import { twMergifyCva } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'

const boxCva = twMergifyCva(
  cva(['rounded-lg relative border-2'], {
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
      },
    },
  }),
)

const inputCva = twMergifyCva(
  cva(['placeholder:hidden w-full placeholder:opacity-0 placeholder:invisible placeholder:scale-0 outline-none'], {
    variants: {
      intent: {
        primary: ['text-gray-1'],
      },
      size: {
        md: ['px-4 py-2.5'],
      },
    },
  }),
)

type Variants = VariantProps<typeof labelCva> & VariantProps<typeof boxCva> & VariantProps<typeof inputCva>

const TextField = forwardRef(
  ({ intent = 'primary', size = 'md', ...props }: AriaTextFieldProps & Variants, ref: ForwardedRef<HTMLInputElement>) => {
    const { label } = props
    const objRef = useObjectRef(ref)
    const { labelProps, inputProps, descriptionProps, errorMessageProps, isInvalid, validationErrors } = useTextField(props, objRef)

    return (
      <div className={boxCva({ intent, isDisabled: props.isDisabled, isInvalid })}>
        <input className={inputCva({ size, className: 'peer' })} {...inputProps} placeholder='' ref={ref} />
        <label className={labelCva({ intent, size, className: 'hidden peer-placeholder-shown:block' })} {...labelProps}>
          {label}
        </label>
        {props.description && (
          <div {...descriptionProps} style={{ fontSize: 12 }}>
            {props.description}
          </div>
        )}
        {isInvalid && (
          <div {...errorMessageProps} style={{ color: 'red', fontSize: 12 }}>
            {validationErrors.join(' ')}
          </div>
        )}
      </div>
    )
  },
)

export default TextField
