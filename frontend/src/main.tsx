import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { SWRConfig } from 'swr'
import { fetcher } from './lib/helpers.ts'
import CssBaseline from '@mui/material/CssBaseline';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ThemeProvider } from '@mui/material'
import { theme } from './theme.ts'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SWRConfig value={{ fetcher }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </SWRConfig>
  </React.StrictMode>
)
