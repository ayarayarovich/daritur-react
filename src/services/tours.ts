import { DateTime } from 'luxon'
import { objectify } from 'radashi'
import { z } from 'zod'

import { Axios } from '@/shared'

export const getToursInfo = async () => {
  const response = await Axios.privateClient.get('/react-admin/tours/info')
  const schema = z.object({
    canCreate: z.boolean(),
    canDelete: z.boolean(),
    canEdit: z.boolean(),
    canSearch: z.boolean(),
  })
  const data = schema.parse(response.data)
  return data
}

export const getToursList = async (
  payload: {
    search?: string
    offset: number
    limit: number
    filters?: string[]
  },
  signal?: AbortSignal,
) => {
  const response = await Axios.privateClient.get('/react-admin/tours', {
    params: {
      offset: payload.offset,
      limit: payload.limit,
      q: payload.search,
      ...objectify(
        payload.filters ?? [],
        (v) => v,
        () => true,
      ),
    },
    signal,
  })
  const schema = z.object({
    count: z.number(),
    items: z
      .object({
        id: z.number(),
        name: z.string(),
        nearDate: z.string().transform((v) => DateTime.fromISO(v)),
        operator: z.object({
          operatorId: z.number(),
          name: z.string(),
        }),
        countryAndCity: z.string(),
        price: z.number(),
        isRegular: z.boolean(),
        status: z.string(),
      })
      .array(),
  })
  const data = schema.parse(response.data)
  return data
}

export const addTourImage = async (payload: { tour_id: number; file: File }) => {
  const response = await Axios.privateClient.postForm(`/react-admin/tours/${payload.tour_id}/images`, {
    file: payload.file,
  })
  const schema = z.object({
    id: z.number(),
    url: z.string(),
  })
  return schema.parse(response.data)
}

export const deleteTourImage = async (payload: { tour_id: number; image_id: number }) => {
  const response = await Axios.privateClient.delete(`/react-admin/tours/${payload.tour_id}/images/${payload.image_id}`)
  return response.data
}

export const deleteTours = async (payload: { ids: number[] }) => {
  await Promise.all(payload.ids.map((id) => Axios.privateClient.delete(`/react-admin/tours/${id}`)))
}

export const createTour = async (payload: {
  countryId: number
  name: string
  description: string
  type: string
  busType: string
  firstStartDateAt: DateTime
  firstStartTimeAt: DateTime
  durationDays: number
  startPoints: {
    cityId: number
    timeAt: DateTime
  }[]
  route: {
    cityId: number
    dateAt: DateTime
    nights: number
    hotels: {
      hotelId: number
      foodType: string
    }[]
  }[]
  isPublished: boolean
  regularMode: string
  regularFinishAt?: DateTime
  priceTransferAdult: number
  priceTransferChild: number
  priceParticipateAdult: number
  priceParticipateChild: number
  discount: number
  approveType: string
}) => {
  const response = await Axios.privateClient.post('/react-admin/tours', {
    ...payload,
    firstStartDateAt: payload.firstStartDateAt.toISO(),
    firstStartTimeAt: payload.firstStartTimeAt.toISOTime(),
    startPoints: payload.startPoints.map((v) => ({
      ...v,
      timeAt: v.timeAt.toISOTime(),
    })),
    route: payload.route.map((r) => ({
      ...r,
      dateAt: r.dateAt.toSQLDate(),
    })),
    regularFinishAt: payload.regularFinishAt?.toISO(),
  })
  return response.data
}

export const updateTour = async (payload: {
  tourId: number
  countryId: number
  name: string
  description: string
  type: string
  busType: string
  firstStartDateAt: DateTime
  firstStartTimeAt: DateTime
  durationDays: number
  startPoints: {
    cityId: number
    timeAt: DateTime
  }[]
  route: {
    cityId: number
    dateAt: DateTime
    nights: number
    hotels: {
      hotelId: number
      foodType: string
    }[]
  }[]
  isPublished: boolean
  regularMode: string
  regularFinishAt?: DateTime
  priceTransferAdult: number
  priceTransferChild: number
  priceParticipateAdult: number
  priceParticipateChild: number
  discount: number
  approveType: string
}) => {
  const response = await Axios.privateClient.put('/react-admin/tours/' + payload.tourId, {
    ...payload,
    firstStartDateAt: payload.firstStartDateAt.toISO(),
    firstStartTimeAt: payload.firstStartTimeAt.toISOTime(),
    startPoints: payload.startPoints.map((v) => ({
      ...v,
      timeAt: v.timeAt.toISOTime(),
    })),
    route: payload.route.map((r) => ({
      ...r,
      dateAt: r.dateAt.toSQLDate(),
    })),
    regularFinishAt: payload.regularFinishAt?.toISO(),
  })
  return response.data
}

export const getTourBuses = async () => {
  const response = await Axios.privateClient.get('/react-admin/tours/buses')
  const schema = z
    .object({
      busType: z.string(),
      name: z.string(),
      schema: z.object({
        floors: z
          .object({
            places: z.number(),
            lines: z
              .object({
                items: z
                  .union([
                    z.object({
                      placeType: z.literal('seat'),
                      number: z.number(),
                      isBlocked: z.boolean().nullable(),
                    }),
                    z.object({
                      placeType: z.literal('driver'),
                    }),
                    z.object({
                      placeType: z.literal('toilet'),
                    }),
                    z.object({
                      placeType: z.literal('guide'),
                    }),
                    z.object({
                      placeType: z.literal('empty'),
                    }),
                    z.object({
                      placeType: z.literal('entrance'),
                    }),
                  ])
                  .array(),
              })
              .array(),
          })
          .array(),
      }),
    })
    .array()
  const data = schema.parse(response.data)
  return data
}

export const getTour = async (payload: { id: number }) => {
  const response = await Axios.privateClient.get('/react-admin/tours/' + payload.id)
  const schema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    type: z.string(),
    countryId: z.number(),
    busType: z.string(),
    firstStartDateAt: z.string().transform((v) => DateTime.fromISO(v)),
    firstStartTimeAt: z.string().transform((v) => DateTime.fromISO(v)),
    durationDays: z.number(),
    startPoints: z
      .object({
        id: z.number(),
        city: z.object({
          id: z.number(),
          name: z.string(),
        }),
        timeAt: z.string().transform((v) => DateTime.fromISO(v)),
      })
      .array(),
    route: z
      .object({
        id: z.number(),
        city: z.object({
          id: z.number(),
          name: z.string(),
        }),
        dateAt: z.string().transform((v) => DateTime.fromISO(v)),
        nights: z.number(),
        hotels: z
          .object({
            id: z.number(),
            hotel: z.object({
              id: z.number(),
              name: z.string(),
            }),
            foodType: z.string(),
          })
          .array(),
      })
      .array(),
    isPublished: z.boolean(),
    regularMode: z.string(),
    regularFinishAt: z
      .string()
      .nullable()
      .transform((v) => (v ? DateTime.fromISO(v) : null)),
    priceTransferAdult: z.number(),
    priceTransferChild: z.number(),
    priceParticipateAdult: z.number(),
    priceParticipateChild: z.number(),
    discount: z.number(),
    approveType: z.string(),
    operator: z.object({
      operatorId: z.number(),
      name: z.string(),
    }),
    images: z
      .object({
        id: z.number(),
        url: z.string(),
      })
      .array(),
    busSchema: z.object({
      busType: z.string(),
      name: z.string(),
    }),
  })
  return schema.parse(response.data)
}

export const getToursCalendar = async (payload: { search?: string; date_gte: DateTime; date_lte: DateTime; filters?: string[] }) => {
  const response = await Axios.privateClient.get('/react-admin/tours/calendar', {
    params: {
      date_gte: payload.date_gte.toSQLDate(),
      date_lte: payload.date_lte.toSQLDate(),
      q: payload.search,
      ...objectify(
        payload.filters ?? [],
        (v) => v,
        () => true,
      ),
    },
  })

  const scheme = z
    .object({
      date: z.string(),
      items: z
        .object({
          tourId: z.number(),
          title: z.string(),
          time: z.string(),
        })
        .array(),
    })
    .array()

  return scheme.parse(response.data)
}
