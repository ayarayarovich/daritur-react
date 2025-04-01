import { AxiosError } from 'axios'
import { cva, VariantProps } from 'class-variance-authority'
import { ClassProp } from 'class-variance-authority/types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
