import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store'
import App from './App.tsx'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import * as Sentry from "@sentry/react";

Sentry.init({
    dsn: "https://0f7b5b9f86e1483b319dc8c93a8ede7c@o4511127784194048.ingest.de.sentry.io/4511127814078544",
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
