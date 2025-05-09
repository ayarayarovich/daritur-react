import { CalendarDate, parseDate } from '@internationalized/date'
import { z } from 'zod'

import { Axios } from '@/shared'

export const createCustomer = async (payload: {
  firstName: string
  lastName: string
  middleName: string
  birthday: CalendarDate
  phone: string
  email: string
  passportSerial: string
  passportGivenAt: CalendarDate
  passportGivenBy: string
  passportActualUntil: CalendarDate
  passportAddress: string
  comment: string
}) => {
  console.log(payload)
  const response = await Axios.privateClient.post('/react-admin/booking/customers', {
    ...payload,
    birthday: payload.birthday.toString(),
    passportGivenAt: payload.passportGivenAt.toString(),
    passportActualUntil: payload.passportActualUntil.toString(),
  })

  const schema = z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    middleName: z.string(),
    birthday: z.string().transform(parseDate),
    phone: z.string(),
    email: z.string(),
    comment: z.string(),
  })

  return schema.parse(response.data)
}

export const updateCustomer = async (payload: {
  id: number
  firstName: string
  lastName: string
  middleName: string
  birthday: CalendarDate
  phone: string
  email: string
  passportSerial: string
  passportGivenAt: CalendarDate
  passportGivenBy: string
  passportActualUntil: CalendarDate
  passportAddress: string
  comment: string
}) => {
  console.log(payload)
  const response = await Axios.privateClient.put('/react-admin/booking/customers/' + payload.id, {
    ...payload,
    birthday: payload.birthday.toString(),
    passportGivenAt: payload.passportGivenAt.toString(),
    passportActualUntil: payload.passportActualUntil.toString(),
  })

  const schema = z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    middleName: z.string(),
    birthday: z.string().transform(parseDate),
    phone: z.string(),
    email: z.string(),
    comment: z.string(),
  })

  return schema.parse(response.data)
}

export const getCustomer = async (payload: { id: number }) => {
  const response = await Axios.privateClient.get('/react-admin/booking/customers/' + payload.id)

  const schema = z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    middleName: z.string(),
    birthday: z.string().transform(parseDate),
    phone: z.string(),
    email: z.string(),
    comment: z.string(),
    passportSerial: z.string(),
    passportGivenAt: z.string().transform(parseDate),
    passportGivenBy: z
      .string()
      .nullable()
      .transform((v) => v ?? ''),
    passportAddress: z.string(),
    passportActualUntil: z.string().transform(parseDate),
  })

  return schema.parse(response.data)
}

export const listCustomers = async (payload: { limit: number; offset: number; search?: string }, signal?: AbortSignal) => {
  const response = await Axios.privateClient.get('/react-admin/booking/customers', {
    params: {
      limit: payload.limit,
      offset: payload.offset,
      q: payload.search,
    },
    signal,
  })

  const schema = z.object({
    count: z.number(),
    items: z
      .object({
        id: z.number(),
        firstName: z.string(),
        lastName: z.string(),
        middleName: z.string(),
        birthday: z.string().transform(parseDate),
        phone: z.string(),
        email: z.string(),
        comment: z.string(),
      })
      .array(),
  })

  return schema.parse(response.data)
}
