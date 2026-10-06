import { Suspense } from 'react'
import { AppRouter } from './shared/AppRouter'
import { Spinner } from './shared/ui'
import { ModalProvider } from './shared/modals/ModalProvider'

export default function App() {
  return (
    <>
      <Suspense fallback={<Spinner fullPage />}>
        <AppRouter />
      </Suspense>
      <ModalProvider />
    </>
  )
}
