import { z } from 'zod'

import { Axios } from '@/shared'

const ResetTokenSchema = z.object({
  token: z.string(),
  expiredAt: z.string(),
})

export const requestPasswordReset = async (payload: { email: string }) => {
  const response = await Axios.publicClient.post('/reset', payload)
  return ResetTokenSchema.parse(response.data)
}

export const verifyResetCode = async (payload: { token: string; code: string }) => {
  const response = await Axios.publicClient.post('/reset/verify', payload)
  return ResetTokenSchema.parse(response.data)
}

export const setNewPassword = async (payload: { token: string; password: string }) => {
  await Axios.publicClient.post('/reset/new-password', payload)
}

export const updatePassword = async (payload: { password: string; newPassword: string }) => {
  await Axios.privateClient.post('/reset/update-password', payload)
}
