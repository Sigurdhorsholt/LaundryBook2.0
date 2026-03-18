import { AppRouter } from './shared/AppRouter'
import { ModalProvider } from './shared/modals/ModalProvider'

export default function App() {
  return (
    <>
      <AppRouter />
      <ModalProvider />
    </>
  )
}
