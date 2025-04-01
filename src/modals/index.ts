import { createModal } from '@ayarayarovich/react-modals'

import { default as CreateStaffModalComponent, type Data as CreateStaffModalData } from './create-staff-modal'
import { default as MessageModalComponent, type Data as MessageModalData } from './message-modal'
import { default as ResetPasswordModalComponent, type Data as ResetPasswordModalData } from './reset-password-modal'
import { default as UpdateStaffModalComponent, type Data as UpdateStaffModalData } from './update-staff-modal'

export const MessageModal = createModal<MessageModalData>(MessageModalComponent)
export const ResetPasswordModal = createModal<ResetPasswordModalData>(ResetPasswordModalComponent)
export const UpdateStaffModal = createModal<UpdateStaffModalData>(UpdateStaffModalComponent)
export const CreateStaffModal = createModal<CreateStaffModalData>(CreateStaffModalComponent)
