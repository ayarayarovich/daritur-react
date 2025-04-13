import { ForwardedRef, forwardRef } from 'react'
import { DismissButton, Overlay, useObjectRef, usePopover, type AriaPopoverProps } from 'react-aria'
import type { OverlayTriggerState } from 'react-stately'

interface PopoverProps extends Omit<AriaPopoverProps, 'popoverRef'> {
  children: React.ReactNode
  state: OverlayTriggerState
}

const Popover = forwardRef(({ children, state, offset = 8, ...props }: PopoverProps, ref: ForwardedRef<HTMLDivElement>) => {
  const popoverRef = useObjectRef(ref)
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
})

export default Popover
