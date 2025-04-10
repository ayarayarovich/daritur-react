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

export const getEmployee = async (payload: { id: number }) => {
  const response = await Axios.privateClient.get(`/react-admin/staffs/${payload.id}`)
  const schema = z.object({
    id: z.number(),
    email: z.string(),
    middleName: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    role: z.string(),
    officeId: z.number().optional().default(0),
  })
  const data = schema.parse(response.data)
  return data
}

export const getOffice = async (payload: { id: number }) => {
  const response = await Axios.privateClient.get(`/react-admin/offices/${payload.id}`)
  const schema = z.object({
    id: z.number(),
    name: z.string(),
    phone: z.string(),
    cityId: z.number(),
    cityName: z.string(),
    email: z.string(),
    description: z.string(),
    inn: z.string(),
    staffs: z
      .object({
        id: z.number(),
        fullName: z.string(),
      })
      .array()
      .nullish()
      .transform((v) => v ?? []),
  })
  const data = schema.parse(response.data)
  return data
}

export const deleteEmployees = async (payload: { ids: number[] }) => {
  await Promise.all(payload.ids.map((id) => Axios.privateClient.delete(`/react-admin/staffs/${id}`)))
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

export const getStaffsInfo = async () => {
  const response = await Axios.privateClient.get('/react-admin/staffs/info')
  const schema = z.object({
    canCreate: z.boolean(),
    canDelete: z.boolean(),
    canEdit: z.boolean(),
    canSearch: z.boolean(),
  })
  const data = schema.parse(response.data)
  return data
}

export const getOfficesInfo = async () => {
  const response = await Axios.privateClient.get('/react-admin/offices/info')
  const schema = z.object({
    canCreate: z.boolean(),
    canDelete: z.boolean(),
    canEdit: z.boolean(),
    canSearch: z.boolean(),
  })
  const data = schema.parse(response.data)
  return data
}

export const createEmployee = async (payload: {
  email: string
  password: string
  middleName: string
  firstName: string
  lastName: string
  phone: string
  officeId?: number
}) => {
  const response = await Axios.privateClient.post('/react-admin/staffs', payload)
  return response.data
}

export const updateEmployee = async (payload: {
  id: number
  email: string
  middleName: string
  firstName: string
  lastName: string
  phone: string
  officeId?: number
  password?: string
}) => {
  const response = await Axios.privateClient.put(`/react-admin/staffs/${payload.id}`, payload)
  return response.data
}

export const createOffice = async (payload: {
  email: string
  name: string
  description: string
  phone: string
  inn: string
  cityId?: number
}) => {
  const response = await Axios.privateClient.post('/react-admin/offices', payload)
  return response.data
}

export const updateOffice = async (payload: {
  id: number
  email: string
  name: string
  description: string
  phone: string
  inn: string
  cityId?: number
}) => {
  const response = await Axios.privateClient.put(`/react-admin/offices/${payload.id}`, payload)
  return response.data
}
