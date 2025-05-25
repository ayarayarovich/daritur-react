import { Utils } from '@/lib'
import { DateTime } from 'luxon'
import qs from 'qs'
import { z } from 'zod'

import { Axios } from '@/shared'

export const getBookingsInfo = async () => {
  const response = await Axios.privateClient.get('/react-admin/booking/bookings/info')
  const schema = z.object({
    canCreate: z.boolean(),
    canDelete: z.boolean(),
    canEdit: z.boolean(),
    canSearch: z.boolean(),
  })
  const data = schema.parse(response.data)
  return data
}

export const listBookings = async (payload: { limit: number; offset: number; search?: string; filters?: string[] }) => {
  const response = await Axios.privateClient.get('/react-admin/booking/bookings', {
    params: {
      limit: payload.limit,
      offset: payload.offset,
      q: payload.search,
      statuses: payload.filters ?? [],
    },
    paramsSerializer: (v) => qs.stringify(v, { arrayFormat: 'repeat' }),
  })
  const scheme = z.object({
    count: z.number(),
    items: z
      .object({
        id: z.number(),
        number: z.string(),
        createdAt: z.string().transform((v) => DateTime.fromISO(v)),
        status: z.string(),
        tour: z.object({
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
        }),
      })
      .array(),
  })
  return scheme.parse(response.data)
}

export const prepareDate = async (payload: { tour_id: number }) => {
  const response = await Axios.privateClient.get('/react-admin/booking/bookings/prepare/' + payload.tour_id)
  const busSchema = z.object({
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
  const scheme = z.object({
    tour: z.object({
      countryId: z.number(),
      name: z.string(),
      description: z.string(),
      type: z.string(),
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
      id: z.number(),
      operator: z.object({
        operatorId: z.number(),
        name: z.string(),
      }),
      busSchema: busSchema,
      busSchemaFrom: busSchema,
      images: z
        .object({
          id: z.number(),
          url: z.string(),
        })
        .array(),
    }),
  })
  return scheme.parse(response.data)
}

export const createBooking = async (payload: {
  tourId: number
  startPointId: number
  cityId: number
  hotelPointId: number | null
  customers: {
    customerId: number
    seatNumber: number | null
  }[]
}) => {
  const response = await Axios.privateClient.post('/react-admin/booking/bookings', payload)
  const scheme = z.object({
    id: z.number(),
  })
  return scheme.parse(response.data)
}

export const updateBooking = async (payload: {
  bookingId: number
  tourId: number
  cityId: number
  startPointId: number
  hotelPointId: number | null
  customers: {
    customerId: number
    seatNumber: number | null
  }[]
}) => {
  const response = await Axios.privateClient.put('/react-admin/booking/bookings/' + payload.bookingId, payload)
  const scheme = z.object({
    id: z.number(),
  })
  return scheme.parse(response.data)
}

export const deleteBooking = async (payload: { id: number }) => {
  const response = await Axios.privateClient.delete('/react-admin/booking/bookings/' + payload.id)
  return response.data
}

export const downloadOffer = async (payload: { id: number }) => {
  const response = await Axios.privateClient.get('/react-admin/booking/bookings/' + payload.id + '/download-offer')
  const scheme = z.instanceof(File)
  const file = scheme.parse(response.data)
  Utils.downloadFile(file)
  return file
}

export const deleteBookings = async (payload: { ids: number[] }) => {
  await Promise.all(payload.ids.map((id) => deleteBooking({ id })))
}

export const downloadOffers = async (payload: { ids: number[] }) => {
  await Promise.all(payload.ids.map((id) => downloadOffer({ id })))
}

export const getBooking = async (payload: { id: number }) => {
  const response = await Axios.privateClient.get('/react-admin/booking/bookings/' + payload.id)
  const scheme = z.object({
    id: z.number(),
    city: z.object({
      id: z.number(),
      name: z.string(),
    }),
    number: z.string(),
    status: z.string(),
    tour: z.object({
      id: z.number(),
      name: z.string(),
      route: z
        .object({
          id: z.number(),
          city: z.object({
            id: z.number(),
            name: z.string(),
          }),
          hotels: z
            .object({
              id: z.number(),
              hotel: z.object({
                id: z.number(),
                name: z.string(),
              }),
            })
            .array(),
        })
        .array(),
    }),
    hotelPoint: z
      .object({
        id: z.number(),
        hotel: z.object({
          id: z.number(),
          name: z.string(),
        }),
        foodType: z.string(),
      })
      .nullable(),
    priceFinal: z.number(),
    startPoint: z.object({
      id: z.number(),
      city: z.object({
        id: z.number(),
        name: z.string(),
      }),
      timeAt: z.string().transform((v) => DateTime.fromISO(v)),
    }),
    customers: z
      .object({
        customer: z.object({
          id: z.number(),
          firstName: z.string(),
          lastName: z.string(),
          middleName: z.string(),
        }),
        seatNumber: z.number().nullable(),
        seatNumberFrom: z.number().nullable(),
      })
      .array(),
  })
  return scheme.parse(response.data)
}
