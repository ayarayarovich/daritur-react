import { Heading } from 'react-aria-components'

import Button from '@/components/ui/button'
import { useModalInstance } from '@ayarayarovich/react-modals'

import BaseModal from './base-modal'

export interface Data {
  title: string
  message: string
}

export default function MessageModalComponent() {
  const { isOpen, close, data } = useModalInstance<Data>()

  return (
    <BaseModal isOpen={isOpen} onOpenChange={(v) => !v && close()}>
      {({ close }) => (
        <div className='flex flex-col items-stretch p-6'>
          <div className='relative mb-8'>
            <Heading slot='title' className='text-center text-xl'>
              {data.title}
            </Heading>
          </div>
          <div className='mb-8 text-center leading-tight'>{data.message}</div>
          <Button type='button' intent='secondary' onPress={close}>
            Ок
          </Button>
        </div>
      )}
    </BaseModal>
  )
}
