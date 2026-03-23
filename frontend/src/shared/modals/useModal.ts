import { useAppDispatch } from '../../app/hooks'
import { openModal, closeModal } from './modalSlice'

export function useModal() {
  const dispatch = useAppDispatch()

  return {
    openModal: (name: string, props?: Record<string, unknown>) =>
      dispatch(openModal({ name, props })),
    closeModal: () => dispatch(closeModal()),
  }
}
