import { DateTime } from 'luxon'
import { z } from 'zod'

import { Axios } from '@/shared'

export const getExcursions = async (payload: { offset: number; limit: number; officeId?: number }) => {
  const response = await Axios.privateClient.get('/react-admin/excursions', {
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
        title: z.string(),
        address: z.string(),
        interestsPoints: z.string(),
      })
      .array(),
  })
  const data = schema.parse(response.data)
  return data
}

export const getExcursion = async (payload: { id: number }) => {
  const response = await Axios.privateClient.get(`/react-admin/excursions/${payload.id}`)
  const schema = z.object({
    title: z.string(),
    description: z.string(),
    countryId: z.number(),
    cityId: z.number(),
    startAt: z.string().transform((v) => DateTime.fromISO(v)),
    endAt: z.string().transform((v) => DateTime.fromISO(v)),
    durationHours: z.number(),
    priceDefault: z.number(),
    priceChild: z.number(),
    interestsPoints: z
      .object({
        title: z.string(),
        description: z.string(),
        address: z.string(),
        countryId: z.number(),
        cityId: z.number(),
        id: z.number(),
        sort: z.number(),
      })
      .array()
      .nullish()
      .transform((v) => v ?? []),
    id: z.number(),
    createdAt: z.string().transform((v) => DateTime.fromISO(v)),
    updatedAt: z.string().transform((v) => DateTime.fromISO(v)),
  })
  const data = schema.parse(response.data)
  return data
}

export const deleteExcursion = async (payload: { ids: number[] }) => {
  await Promise.all(payload.ids.map((id) => Axios.privateClient.delete(`/react-admin/excursions/${id}`)))
}

export const getExcursionsInfo = async () => {
  const response = await Axios.privateClient.get('/react-admin/excursions/info')
  const schema = z.object({
    canCreate: z.boolean(),
    canDelete: z.boolean(),
    canEdit: z.boolean(),
    canSearch: z.boolean(),
  })
  const data = schema.parse(response.data)
  return data
}

export const createExcursion = async (payload: {
  title: string
  description: string
  countryId: number
  cityId: number
  startAt: DateTime
  endAt: DateTime
  durationHours: number
  priceDefault: number
  priceChild: number
  interestsPoints: number[]
}) => {
  const response = await Axios.privateClient.post('/react-admin/excursions', {
    ...payload,
    startAt: payload.startAt.toFormat('HH:mm:ss.SSSZZ'),
    endAt: payload.startAt.toFormat('HH:mm:ss.SSSZZ'),
  })
  return response.data
}

export const updateExcursion = async (payload: {
  id: number
  title: string
  description: string
  countryId: number
  cityId: number
  startAt: DateTime
  endAt: DateTime
  durationHours: number
  priceDefault: number
  priceChild: number
  interestsPoints: number[]
}) => {
  const response = await Axios.privateClient.put(`/react-admin/excursions/${payload.id}`, {
    ...payload,
    startAt: payload.startAt.toFormat('HH:mm:ss.SSSZZ'),
    endAt: payload.startAt.toFormat('HH:mm:ss.SSSZZ'),
  })
  return response.data
}
