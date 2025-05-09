import { twMergifyCva } from '@/lib/utils'
import { cva } from 'class-variance-authority'

export const boxCva = twMergifyCva(
  cva(['rounded-lg relative border-2 overflow-hidden'], {
    variants: {
      intent: {
        primary: [
          'text-gray-1 bg-white shadow-[0px_0px_2px_0px] transition-colors shadow-[#C4C4C4] border-transparent focus-within:border-[#C4C4C4]/50',
        ],
      },
      isDisabled: {
        false: null,
        true: ['opacity-50'],
      },
      isInvalid: {
        false: null,
        true: ['border-red-400 focus-within:border-red-400'],
      },
      size: {
        md: ['px-4 py-2.5'],
        sm: ['px-4 py-1 text-sm'],
      },
    },
    defaultVariants: {
      intent: 'primary',
      size: 'sm',
    },
  }),
)
