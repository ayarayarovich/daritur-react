import { Dialog, DialogProps, Modal, ModalOverlay } from 'react-aria-components'

import { AnimatePresence, motion } from 'motion/react'

const MotionModal = motion.create(Modal)
const MotionModalOverlay = motion.create(ModalOverlay)

type Props = {
  isOpen?: boolean
  onOpenChange?: (isOpen: boolean) => unknown
  children?: DialogProps['children']
}

export default function BaseModal({ isOpen, onOpenChange, children }: Props) {
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
                  className='w-full max-w-lg flex-1'
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
