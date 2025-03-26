import { ForwardedRef, forwardRef } from 'react'
import { AriaButtonProps, useButton, useObjectRef } from 'react-aria'

import { twMergifyCva } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'

const buttonCva = twMergifyCva(
  cva('text-center rounded-lg transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-default', {
    variants: {
      intent: {
        primary: 'text-white bg-teal-500 font-medium',
        secondary: 'text-white bg-gray-1 font-medium',
        link: 'text-blue-1',
      },
      size: {
        md: 'py-2 px-4 text-xl',
        linkMd: 'py-0 px-4 text-base',
      },
    },
  }),
)

type Variants = VariantProps<typeof buttonCva>

const Button = forwardRef(
  ({ intent = 'primary', size = 'md', children, ...props }: AriaButtonProps & Variants, ref: ForwardedRef<HTMLButtonElement>) => {
    const objRef = useObjectRef(ref)
    const { buttonProps } = useButton(props, objRef)

    return (
      <button className={buttonCva({ intent, size })} {...buttonProps} ref={objRef}>
        {children}
      </button>
    )
  },
)

export default Button
