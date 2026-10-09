import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

// Remembered per device; useActiveProperty falls back to the first membership if it's not one of yours
export const ACTIVE_PROPERTY_KEY = 'activePropertyId'

function readStored(): string | null {
  try {
    return localStorage.getItem(ACTIVE_PROPERTY_KEY)
  } catch {
    return null
  }
}

const activePropertySlice = createSlice({
  name: 'activeProperty',
  initialState: { propertyId: readStored() } as { propertyId: string | null },
  reducers: {
    setActiveProperty(state, action: PayloadAction<string>) {
      state.propertyId = action.payload
    },
  },
})

export const { setActiveProperty } = activePropertySlice.actions
export default activePropertySlice.reducer
