import { useRef } from 'react'
import { DismissButton, Overlay, usePopover, type AriaPopoverProps } from 'react-aria'
import type { OverlayTriggerState } from 'react-stately'

interface PopoverProps extends Omit<AriaPopoverProps, 'popoverRef'> {
  children: React.ReactNode
  state: OverlayTriggerState
}

export default function Popover({ children, state, offset = 8, ...props }: PopoverProps) {
  const popoverRef = useRef(null)
  const { popoverProps, underlayProps } = usePopover(
    {
      ...props,
      offset,
      popoverRef,
    },
    state,
  )

  return (
    <Overlay>
      <div {...underlayProps} />
      <div
        {...popoverProps}
        ref={popoverRef}
        className='rounded-lg border-transparent bg-[#FCFDFD] shadow-[0px_0px_2px_0px] shadow-[#C4C4C4] transition-colors focus:border-[#C4C4C4]/50'
      >
        <DismissButton
          onDismiss={() => {
            state.close()
          }}
        />
        {children}
        <DismissButton
          onDismiss={() => {
            state.close()
          }}
        />
      </div>
    </Overlay>
  )
}
