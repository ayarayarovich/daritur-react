import { useRef } from 'react'
import { useListBox, type AriaListBoxProps } from 'react-aria'
import { ListState, useListState } from 'react-stately'

import Option from './listbox-option'
import ListBoxSection from './listbox-section'

interface Props<T> extends AriaListBoxProps<T> {
  state?: ListState<T>
}

export default function ListBox<T extends object>(props: Props<T>) {
  // Create state based on the incoming props

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const state = props.state ? props.state : useListState(props)

  // Get props for the listbox element
  const ref = useRef(null)
  const { listBoxProps, labelProps } = useListBox(props, state, ref)

  return (
    <>
      <div {...labelProps}>{props.label}</div>
      <ul {...listBoxProps} ref={ref} className='flex flex-col items-stretch gap-2.5 outline-none'>
        {[...state.collection].map((item) =>
          item.type === 'section' ? (
            <ListBoxSection key={item.key} section={item} state={state} />
          ) : (
            <Option key={item.key} item={item} state={state} />
          ),
        )}
      </ul>
    </>
  )
}
