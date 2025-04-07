import { z } from 'zod'

import { Axios } from '@/shared'

const MenuItemSchema = z.object({
  path: z.string(),
  iconUrl: z.string(),
  title: z.string(),
})

export const getMenu = async () => {
  const response = await Axios.privateClient.get('/react-admin/menu')
  return z.array(MenuItemSchema).parse(response.data)
}
