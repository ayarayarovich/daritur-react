import { z } from 'zod'

import { Axios } from '@/shared'

export const CitySchema = z.object({ id: z.number(), name: z.string() })

export const getCities = async () => {
  const response = await Axios.privateClient.get('/react-admin/cities')
  return z.array(CitySchema).parse(response.data)
}
