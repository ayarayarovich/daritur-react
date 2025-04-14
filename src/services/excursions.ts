import { DateTime } from 'luxon'
import { z } from 'zod'

import { Axios } from '@/shared'

export const getExcursions = async (payload: { search?: string; offset: number; limit: number }) => {
  const response = await Axios.privateClient.get('/react-admin/excursions', {
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
        title: z.string(),
        description: z.string(),
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
    images: z
      .object({
        id: z.number(),
        url: z.string(),
      })
      .array()
      .optional()
      .transform((v) => v || []),
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
    endAt: payload.endAt.toFormat('HH:mm:ss.SSSZZ'),
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
    endAt: payload.endAt.toFormat('HH:mm:ss.SSSZZ'),
  })
  return response.data
}

export const getCities = async () => {
  const response = await Axios.privateClient.get('/react-admin/cities')
  const schema = z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .array()
  const data = schema.parse(response.data)
  return data
}

export const getCountries = async () => {
  const response = await Axios.privateClient.get('/react-admin/countries')
  const schema = z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .array()
  const data = schema.parse(response.data)
  return data
}

export const getInterests = async (payload: { search: string; offset: number; limit: number }, signal?: AbortSignal) => {
  const response = await Axios.privateClient.get('/react-admin/interests', {
    params: {
      q: payload.search,
      offset: payload.offset,
      limit: payload.limit,
    },
    signal,
  })
  const schema = z.object({
    count: z.number(),
    items: z
      .object({
        id: z.number(),
        title: z.string(),
        address: z.string(),
      })
      .array(),
  })
  const data = schema.parse(response.data)
  return data
}

export const getInterestDetails = async (payload: { id: number | string }) => {
  const response = await Axios.privateClient.get(`/react-admin/interests/${payload.id}`)
  const schema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    address: z.string(),
  })
  const data = schema.parse(response.data)
  return data
}

export const addExcursionImage = async (payload: { excursion_id: number; file: File }) => {
  const response = await Axios.privateClient.postForm(`/react-admin/excursions/${payload.excursion_id}/images`, {
    file: payload.file,
  })
  const schema = z.object({
    id: z.number(),
    url: z.string(),
  })
  return schema.parse(response.data)
}

export const deleteExcursionImage = async (payload: { excursion_id: number; image_id: number }) => {
  const response = await Axios.privateClient.delete(`/react-admin/excursions/${payload.excursion_id}/images/${payload.image_id}`)
  return response.data
}
