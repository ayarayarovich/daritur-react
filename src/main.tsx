import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { Query, Router } from '@/shared'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Query.Provider>
      <Router.Provider />
    </Query.Provider>
  </StrictMode>,
)
