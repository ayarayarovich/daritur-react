import { useListBoxSection } from 'react-aria'
import { ListState, Node } from 'react-stately'

import Option from './listbox-option'

interface ListBoxSectionProps<T> {
  section: Node<T>
  state: ListState<T>
}

export default function ListBoxSection<T extends object>({ section, state }: ListBoxSectionProps<T>) {
  const { itemProps, headingProps, groupProps } = useListBoxSection({
    heading: section.rendered,
    'aria-label': section['aria-label'],
  })

  // If the section is not the first, add a separator element to provide visual separation.
  // The heading is rendered inside an <li> element, which contains
  // a <ul> with the child items.
  return (
    <>
      <li {...itemProps} className='mb-4'>
        {section.rendered && (
          <span {...headingProps} className='px-3 text-lg normal-case'>
            {section.rendered}
          </span>
        )}
        <ul
          {...groupProps}
          style={{
            padding: 0,
            listStyle: 'none',
          }}
        >
          {state.collection.getChildren &&
            [...state.collection.getChildren(section.key)].map((node) => <Option key={node.key} item={node} state={state} />)}
        </ul>
      </li>
    </>
  )
}
