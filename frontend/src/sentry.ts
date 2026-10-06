import * as Sentry from '@sentry/react'

// Imported first in main.tsx so errors thrown while the rest of the app's modules load are captured.
Sentry.init({
  dsn: 'https://0f7b5b9f86e1483b319dc8c93a8ede7c@o4511127784194048.ingest.de.sentry.io/4511127814078544',
  enabled: import.meta.env.PROD,
  environment: import.meta.env.MODE,
  // No IP addresses or request data: Sentry is a sub-processor and residents' data must stay minimal (GDPR).
  sendDefaultPii: false,
})
