import { Dialog, DialogProps, Modal, ModalOverlay } from 'react-aria-components'

import { twMergifyCva } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'
import { AnimatePresence, motion } from 'motion/react'

const MotionModal = motion.create(Modal)
const MotionModalOverlay = motion.create(ModalOverlay)

const modalCva = twMergifyCva(
  cva(['w-full max-w-lg flex-1'], {
    variants: {
      size: {
        lg: ['max-w-lg'],
        xl2: ['max-w-2xl'],
      },
    },
  }),
)

type Variants = VariantProps<typeof modalCva>

type Props = {
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => unknown
  children?: DialogProps['children']
}

export default function BaseModal({ isOpen, onOpenChange, children, size = 'lg' }: Props & Variants) {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <MotionModalOverlay
            onOpenChange={onOpenChange}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
              transition: {
                duration: 0.5,
                ease: 'easeInOut',
              },
            }}
            isOpen={isOpen}
            isDismissable
            className='bg-gray-1/40 fixed inset-x-0 top-0 z-50 h-dvh overflow-hidden'
          >
            <div className='h-dvh w-full overflow-y-auto'>
              <div className='flex min-h-full items-center justify-center p-4'>
                <MotionModal
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  className={modalCva({ size })}
                >
                  <Dialog className='ring-gray-4 w-full rounded-xl bg-white ring-offset-0 transition-shadow outline-none focus:ring-2'>
                    {children}
                  </Dialog>
                </MotionModal>
              </div>
            </div>
          </MotionModalOverlay>
        )}
      </AnimatePresence>
    </>
  )
}
