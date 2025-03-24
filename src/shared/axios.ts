import { AuthService } from '@/services'
import axios, { CreateAxiosDefaults, InternalAxiosRequestConfig, isAxiosError } from 'axios'

const common: CreateAxiosDefaults = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
}

export const publicClient = axios.create({
  ...common,
})

export const privateClient = axios.create({
  ...common,
})

privateClient.interceptors.request.use(
  (request) => {
    const accessToken = AuthService.getUserData()?.accessToken
    if (accessToken) {
      request.headers.Authorization = `Bearer ${accessToken}`
    }
    return request
  },
  (error: Error) => {
    return Promise.reject(error)
  },
)

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig<unknown> {
  _isBeingRetried?: boolean
}

const refreshExpiredTokenClosure = () => {
  let isCalled = false
  let runningPromise: ReturnType<typeof AuthService.refreshToken> | undefined = undefined
  return () => {
    if (!isCalled) {
      isCalled = true
      const refreshToken = AuthService.getUserData()?.refreshToken
      if (!refreshToken) {
        AuthService.logout()
        return Promise.reject(new Error('refresh token not found'))
      }
      runningPromise = AuthService.refreshToken({ refreshToken }).finally(() => {
        isCalled = false
      })
    }
    return runningPromise!
  }
}

const refreshExpiredToken = refreshExpiredTokenClosure()

privateClient.interceptors.response.use(
  (response) => response,
  async (error: Error) => {
    if (isAxiosError(error)) {
      const originalRequest: ExtendedAxiosRequestConfig | undefined = error.config
      if (!originalRequest) {
        return Promise.reject(new Error('error.config is undefined'))
      }
      if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._isBeingRetried) {
        originalRequest._isBeingRetried = true
        try {
          const { accessToken } = await refreshExpiredToken()
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return privateClient(originalRequest)
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError)
          AuthService.logout()
          return Promise.reject(refreshError)
        }
      }
    }
    return Promise.reject(error)
  },
)
