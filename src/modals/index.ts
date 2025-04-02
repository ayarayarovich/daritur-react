import { createModal } from '@ayarayarovich/react-modals'

import { default as CreateOfficeModalComponent, type Data as CreateOfficeModalData } from './features/office/create-office-modal'
import { default as UpdateOfficeModalComponent, type Data as UpdateOfficeModalData } from './features/office/update-office-modal'
import { default as CreateStaffModalComponent, type Data as CreateStaffModalData } from './features/staff/create-staff-modal'
import { default as UpdateStaffModalComponent, type Data as UpdateStaffModalData } from './features/staff/update-staff-modal'
import { default as MessageModalComponent, type Data as MessageModalData } from './message-modal'
import { default as ResetPasswordModalComponent, type Data as ResetPasswordModalData } from './reset-password-modal'

export const MessageModal = createModal<MessageModalData>(MessageModalComponent)
export const ResetPasswordModal = createModal<ResetPasswordModalData>(ResetPasswordModalComponent)
export const UpdateStaffModal = createModal<UpdateStaffModalData>(UpdateStaffModalComponent)
export const CreateStaffModal = createModal<CreateStaffModalData>(CreateStaffModalComponent)
export const UpdateOfficeModal = createModal<UpdateOfficeModalData>(UpdateOfficeModalComponent)
export const CreateOfficeModal = createModal<CreateOfficeModalData>(CreateOfficeModalComponent)
