import { DateTime } from 'luxon'
import { z } from 'zod'

import { Axios } from '@/shared'

const UserDataScheme = z
  .object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
  })
  .nullable()

type TUserData = z.infer<typeof UserDataScheme>

export const resetUserData = () => {
  localStorage.setItem('user_data', 'null')
}
export const saveUserData = (data: TUserData) => {
  localStorage.setItem('user_data', JSON.stringify(data))
}
export const getUserData = () => {
  let notVerifiedUserData = null
  try {
    notVerifiedUserData = JSON.parse(localStorage.getItem('user_data') || 'null')
  } catch {
    resetUserData()
    return null
  }
  const data = UserDataScheme.safeParse(notVerifiedUserData)
  if (data.success) {
    return data.data
  }
  resetUserData()
  return null
}

export const login = async (vars: { username: string; password: string }) => {
  const response = await Axios.publicClient.postForm('/auth/login', {
    username: vars.username,
    password: vars.password,
  })
  const scheme = z.object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
  })
  const data = scheme.parse(response.data)
  saveUserData({ accessToken: data.accessToken, refreshToken: data.refreshToken })
}

export const refreshToken = async (payload: { refreshToken: string }) => {
  const response = await Axios.publicClient.post('/auth/refresh', {
    refresh_token: payload.refreshToken,
  })
  const scheme = z.object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
  })
  const data = scheme.parse(response.data)
  saveUserData({ accessToken: data.accessToken, refreshToken: data.refreshToken })
  return data
}

export const resetPassword = async (payload: { email: string }) => {
  const response = await Axios.publicClient.post('/reset', payload)
  const schema = z.object({
    token: z.string(),
    expiredAt: z.string().transform((v) => DateTime.fromISO(v)),
  })
  const data = schema.parse(response.data)
  return data
}

export const logout = () => {
  resetUserData()
  window.location.reload()
}

export const getMe = async () => {
  const response = await Axios.privateClient.get('/users/me')
  const scheme = z.object({
    user: z.object({
      id: z.number(),
      name: z.string(),
      birthday: z.string().transform((v) => DateTime.fromFormat(v, 'YYYY-dd-MM')),
      gender: z.string(),
      phone: z.string(),
      email: z.string(),
      created_at: z.string().transform((v) => DateTime.fromISO(v)),
      updated_at: z.string().transform((v) => DateTime.fromISO(v)),
    }),
  })
  const data = scheme.parse(response.data)
  return data
}
