import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface ModalState {
  name: string
  props: Record<string, unknown>
}

const modalSlice = createSlice({
  name: 'modal',
  initialState: null as ModalState | null,
  reducers: {
    openModal: (_, action: PayloadAction<{ name: string; props?: Record<string, unknown> }>) => ({
      name: action.payload.name,
      props: action.payload.props ?? {},
    }),
    closeModal: () => null,
  },
})

export const { openModal, closeModal } = modalSlice.actions
export default modalSlice.reducer
