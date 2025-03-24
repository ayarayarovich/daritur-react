import { PropsWithChildren } from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { ZodError } from 'zod'

export const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 60 * 1000, // 15 minutes
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        if (error instanceof ZodError) {
          console.error('ОШИБКА ВАЛИДАЦИИ', error.errors)
          return false
        }
        if (error instanceof AxiosError) {
          if ([401, 403, 404].find((v) => v === error.status)) {
            return false
          }
        }
        return failureCount < 2
      },
    },
    mutations: {
      retry: (_, error) => {
        if (error instanceof ZodError) {
          console.error('ОШИБКА ВАЛИДАЦИИ', error.errors)
        }
        return false
      },
      onSuccess() {
        console.log('%c Мутация успешна! ', 'background: #222; color: #bada55')
      },
      onError(err) {
        console.log(`%c Мутация не прошла: ${err.name} `, 'background: #222; color: #ff1744')
      },
    },
  },
})

export const Provider = (props: PropsWithChildren) => {
  return <QueryClientProvider client={client} {...props} />
}
