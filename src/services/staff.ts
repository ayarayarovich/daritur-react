import { z } from 'zod'

import { Axios } from '@/shared'

export const getEmployees = async (payload: { offset: number; limit: number; officeId?: number }) => {
  const response = await Axios.privateClient.get('/react-admin/staffs', {
    params: {
      offset: payload.offset,
      limit: payload.limit,
      office_id: payload.officeId,
    },
  })
  const schema = z.object({
    count: z.number(),
    items: z
      .object({
        id: z.number(),
        email: z.string(),
        middleName: z.string(),
        firstName: z.string(),
        lastName: z.string(),
        phone: z.string(),
        role: z.string(),
      })
      .array(),
  })
  const data = schema.parse(response.data)
  return data
}

export const deleteEmployees = async (payload: { ids: number[] }) => {
  for (const id of payload.ids) {
    await Axios.privateClient.delete(`/react-admin/staffs/${id}`)
  }
}

export const getOffices = async (payload: { offset: number; limit: number; search?: string }) => {
  const response = await Axios.privateClient.get('/react-admin/offices', {
    params: {
      offset: payload.offset,
      limit: payload.limit,
      q: payload.search,
    },
  })
  const schema = z.object({
    count: z.number(),
    items: z
      .object({
        id: z.number(),
        name: z.string(),
        phone: z.string(),
        cityId: z.number(),
        cityName: z.string(),
      })
      .array(),
  })
  const data = schema.parse(response.data)
  return data
}

export const deleteOffices = async (payload: { ids: number[] }) => {
  for (const id of payload.ids) {
    await Axios.privateClient.delete(`/react-admin/offices/${id}`)
  }
}
