import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ModalProvider } from '@ayarayarovich/react-modals'

import { Query, Router } from '@/shared'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Query.Provider>
      <ModalProvider>
        <Router.Provider />
      </ModalProvider>
    </Query.Provider>
  </StrictMode>,
)
