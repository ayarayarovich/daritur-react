import { z } from 'zod'

import { Axios } from '@/shared'

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  middleName: z.string(),
  phone: z.string().nullable().optional(),
  role: z.string(),
})

export const getCurrentUser = async () => {
  const response = await Axios.privateClient.get('/users/me')
  return UserSchema.parse(response.data)
}
