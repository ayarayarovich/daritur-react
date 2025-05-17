import { DateTime } from 'luxon'
import { z } from 'zod'

import { Axios } from '@/shared'

export const getHotels = async (payload: { offset: number; limit: number; search?: string }) => {
  const response = await Axios.privateClient.get('/react-admin/hotels', {
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
        address: z.string(),
        image: z.string(),
      })
      .array(),
  })

  return schema.parse(response.data)
}

export const getHotel = async (payload: { id: number }) => {
  const response = await Axios.privateClient.get(`/react-admin/hotels/${payload.id}`)
  const schema = z.object({
    id: z.number(),
    name: z.string(),
    cityId: z.number(),
    countryId: z.number(),
    address: z.string(),
    description: z.string(),
    checkinAt: z.string().transform((v) => DateTime.fromISO(v)),
    checkoutAt: z.string().transform((v) => DateTime.fromISO(v)),
    foodTypes: z.string().array(),
    roomTypes: z
      .object({
        id: z.number(),
        placeType: z.string(),
        comment: z.string(),
        price: z.number(),
        count: z.number(),
        category: z.string(),
        images: z
          .object({
            id: z.number(),
            url: z.string(),
          })
          .array(),
      })
      .array(),
    images: z
      .object({
        id: z.number(),
        url: z.string(),
      })
      .array(),
  })
  return schema.parse(response.data)
}

export const getHotelsInfo = async () => {
  const response = await Axios.privateClient.get('/react-admin/hotels/info')
  const schema = z.object({
    canCreate: z.boolean(),
    canDelete: z.boolean(),
    canEdit: z.boolean(),
    canSearch: z.boolean(),
  })
  const data = schema.parse(response.data)
  return data
}

export const createHotel = async (payload: {
  name: string
  cityId: number
  countryId: number
  address: string
  description: string
  checkinAt: DateTime
  checkoutAt: DateTime
  roomTypes: {
    placeType: string
    comment: string
    price: number
    count: number
    category: string
  }[]
  foodTypes: string[]
}) => {
  const response = await Axios.privateClient.post('/react-admin/hotels', {
    ...payload,
    checkinAt: payload.checkinAt.toISOTime(),
    checkoutAt: payload.checkoutAt.toISOTime(),
  })
  const schema = z.object({
    id: z.number(),
    roomTypes: z
      .object({
        id: z.number(),
        placeType: z.string(),
        comment: z.string(),
        price: z.number(),
        count: z.number(),
        category: z.string(),
        images: z
          .object({
            id: z.number(),
            url: z.string(),
          })
          .array(),
      })
      .array(),
  })
  return schema.parse(response.data)
}

export const updateHotel = async (payload: {
  id: number
  name: string
  cityId: number
  countryId: number
  address: string
  description: string
  checkinAt: DateTime
  checkoutAt: DateTime
  roomTypes: {
    id: number
    placeType: string
    comment: string
    price: number
    count: number
    category: string
  }[]
  foodTypes: string[]
}) => {
  const response = await Axios.privateClient.put(`/react-admin/hotels/${payload.id}`, {
    ...payload,
    checkinAt: payload.checkinAt.toISOTime(),
    checkoutAt: payload.checkoutAt.toISOTime(),
  })
  const schema = z.object({
    id: z.number(),
  })
  return schema.parse(response.data)
}

export const addHotelImage = async (payload: { hotel_id: number; file: File }) => {
  const response = await Axios.privateClient.postForm(`/react-admin/hotels/${payload.hotel_id}/images`, {
    file: payload.file,
  })
  const schema = z.object({
    id: z.number(),
    url: z.string(),
  })
  return schema.parse(response.data)
}

export const deleteHotelImage = async (payload: { hotel_id: number; image_id: number }) => {
  const response = await Axios.privateClient.delete(`/react-admin/hotels/${payload.hotel_id}/images/${payload.image_id}`)
  return response.data
}

export const addRoomTypeImage = async (payload: { room_type_id: number; file: File }) => {
  const response = await Axios.privateClient.postForm(`/react-admin/hotels/room-types/${payload.room_type_id}/images`, {
    file: payload.file,
  })
  const schema = z.object({
    id: z.number(),
    url: z.string(),
  })
  return schema.parse(response.data)
}

export const deleteRoomTypeImage = async (payload: { room_type_id: number; image_id: number }) => {
  const response = await Axios.privateClient.delete(`/react-admin/hotels/room-types/${payload.room_type_id}/images/${payload.image_id}`)
  return response.data
}

export const deleteHotels = async (payload: { ids: number[] }) => {
  await Promise.all(payload.ids.map((id) => Axios.privateClient.delete(`/react-admin/hotels/${id}`)))
}
