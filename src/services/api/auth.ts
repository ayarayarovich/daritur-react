import { z } from 'zod'

import { Axios } from '@/shared'

const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

const AccessTokenSchema = z.object({
  accessToken: z.string(),
})

export const login = async (payload: { username: string; password: string }) => {
  const formData = new URLSearchParams()
  formData.append('username', payload.username)
  formData.append('password', payload.password)
  const response = await Axios.publicClient.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return AuthTokensSchema.parse(response.data)
}

export const refreshToken = async (payload: { refreshToken: string }) => {
  const response = await Axios.publicClient.post('/auth/refresh', payload)
  return AccessTokenSchema.parse(response.data)
}

export const logout = async () => {
  await Axios.privateClient.post('/auth/logout')
}

export const register = async (payload: {
  email: string
  password: string
  middleName: string
  firstName: string
  lastName: string
  phone: string
  officeId?: number | null
}) => {
  await Axios.publicClient.post('/auth/register', payload)
}
