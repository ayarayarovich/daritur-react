import type { ReactNode } from 'react'
import { FormProvider, useForm, type UseFormProps } from 'react-hook-form'

interface StepProps {
  defaultValues: UseFormProps['defaultValues']
  resolver: UseFormProps['resolver']
  children: ReactNode
  onSubmit: (values: object) => void
}

export default function Step({ defaultValues, resolver, children, onSubmit }: StepProps) {
  const form = useForm({ defaultValues, resolver })
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='relative h-full'>
      <FormProvider {...form}>{children}</FormProvider>
    </form>
  )
}
