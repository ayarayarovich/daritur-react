import { AuthService, StaffService } from '@/services'
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
  detail: (config: { id: number }) => ({
    queryKey: [{ config }],
    queryFn: () => StaffService.getOffice(config),
  }),
  info: {
    queryKey: null,
    queryFn: StaffService.getOfficesInfo,
  },
})

const Queries = mergeQueryKeys(me, employees, offices)

export default Queries
