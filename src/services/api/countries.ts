import { z } from 'zod'

import { Axios } from '@/shared'

export const CountrySchema = z.object({ id: z.number(), name: z.string() })

export const getCountries = async () => {
  const response = await Axios.privateClient.get('/react-admin/countries')
  return z.array(CountrySchema).parse(response.data)
}
