import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { SWRConfig } from 'swr'
import { fetcher } from './lib/helpers.ts'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SWRConfig value={{ refreshInterval: 3000, fetcher }}>
      <App />
    </SWRConfig>
  </React.StrictMode>,
)
