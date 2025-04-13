import { AuthService, ExcursionsService, HotelsService, StaffService } from '@/services'
import { createQueryKeys, mergeQueryKeys } from '@lukemorales/query-key-factory'

const me = createQueryKeys('me', {
  self: {
    queryKey: null,
    queryFn: AuthService.getMe,
  },
  menu: {
    queryKey: null,
    queryFn: AuthService.getMenu,
  },
})

const employees = createQueryKeys('employees', {
  list: (config: { offset: number; limit: number; officeId?: number }) => ({
    queryKey: [{ config }],
    queryFn: () => StaffService.getEmployees(config),
  }),
  detail: (config: { id: number }) => ({
    queryKey: [{ config }],
    queryFn: () => StaffService.getEmployee(config),
  }),
  info: {
    queryKey: null,
    queryFn: StaffService.getStaffsInfo,
  },
})

const offices = createQueryKeys('offices', {
  list: (config: { offset: number; limit: number; search?: string }) => ({
    queryKey: [{ config }],
    queryFn: () => StaffService.getOffices(config),
  }),
  all: {
    queryKey: null,
    queryFn: () => StaffService.getOffices({ offset: 0, limit: 999999 }),
  },
  detail: (config: { id: number }) => ({
    queryKey: [{ config }],
    queryFn: () => StaffService.getOffice(config),
  }),
  info: {
    queryKey: null,
    queryFn: StaffService.getOfficesInfo,
  },
})

const excursions = createQueryKeys('excursions', {
  list: (config: { offset: number; limit: number; search?: string }) => ({
    queryKey: [{ config }],
    queryFn: () => ExcursionsService.getExcursions(config),
  }),
  detail: (config: { id: number }) => ({
    queryKey: [{ config }],
    queryFn: () => ExcursionsService.getExcursion(config),
  }),
  info: {
    queryKey: null,
    queryFn: ExcursionsService.getExcursionsInfo,
  },
  cities: {
    queryKey: null,
    queryFn: ExcursionsService.getCities,
  },
  countries: {
    queryKey: null,
    queryFn: ExcursionsService.getCountries,
  },
})

const interests = createQueryKeys('interests', {
  list: (config: { search: string; limit: number; offset: number }) => ({
    queryKey: [config],
    queryFn: ({ signal }: { signal: AbortSignal }) => ExcursionsService.getInterests(config, signal),
  }),
  detail: (config: { id: number }) => ({
    queryKey: [{ config }],
    queryFn: () => ExcursionsService.getInterestDetails(config),
  }),
})

const hotels = createQueryKeys('hotels', {
  list: (config: { offset: number; limit: number; search?: string }) => ({
    queryKey: [{ config }],
    queryFn: () => HotelsService.getHotels(config),
  }),
  detail: (config: { id: number }) => ({
    queryKey: [{ config }],
    queryFn: () => HotelsService.getHotel(config),
  }),
  info: {
    queryKey: null,
    queryFn: HotelsService.getHotelsInfo,
  },
})

const Queries = mergeQueryKeys(me, employees, offices, excursions, hotels, interests)

export default Queries
