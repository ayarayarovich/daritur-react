import { CalendarDate, Time } from '@internationalized/date'
import { AxiosError } from 'axios'
import { cva, VariantProps } from 'class-variance-authority'
import { ClassProp } from 'class-variance-authority/types'
import { clsx, type ClassValue } from 'clsx'
import { DateTime } from 'luxon'
import { omit } from 'radashi'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function preloadImage(src: string) {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = res
    img.onerror = rej
    img.src = src
  })
}

export function preloadImages(srcs: string[]) {
  return Promise.all(srcs.map((v) => preloadImage(v)))
}

// (props?: (ConfigVariants<...> & ClassProp) | undefined) => string

export function twMergifyCva<T extends ReturnType<typeof cva>>(c: T) {
  return (variants: VariantProps<typeof c> & ClassProp) => twMerge(c(variants))
}

export function extractErrorMessageFromAPIError(err: unknown) {
  if (err instanceof AxiosError) {
    const errs = err.response?.data.data?.errors || []
    return (
      errs
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((v: any) => v.msg)
        .filter(Boolean)
        .join('. ')
    )
  }
}

export function requiredFieldRefine() {
  return [(val: unknown) => !!val, 'Обязательное поле'] as const
}

export const imgScheme = z
  .union([z.instanceof(File, { message: 'Изображение обязательно' }), z.string().optional()])
  .refine((value) => value instanceof File || typeof value === 'string', {
    message: 'Изображение обязательно',
  })

export const timeToString = (time?: Time | null) => {
  if (!time) return '--:--'
  return `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`
}

export function distributiveOmit<T, TKeys extends keyof T>(obj: T, keys: readonly TKeys[]) {
  return omit(obj, keys) as DistributiveOmit<T, TKeys>
}

export function toCalendarDate(datetime: DateTime) {
  if (!datetime.isValid) {
    return null
  }
  return new CalendarDate(datetime.year, datetime.month, datetime.day)
}

export function toTime(datetime: DateTime) {
  if (!datetime.isValid) {
    return null
  }
  return new Time(datetime.hour, datetime.minute, datetime.second)
}
