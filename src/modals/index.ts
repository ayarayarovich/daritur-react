import { createModal } from '@ayarayarovich/react-modals'

import { default as MessageModalComponent, type Data as MessageModalData } from './message-modal'
import { default as ResetPasswordModalComponent, type Data as ResetPasswordModalData } from './reset-password-modal'

export const MessageModal = createModal<MessageModalData>(MessageModalComponent)
export const ResetPasswordModal = createModal<ResetPasswordModalData>(ResetPasswordModalComponent)
