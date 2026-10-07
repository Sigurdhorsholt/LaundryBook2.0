// Per device: which version of the house rules this browser has shown, so the booking page can say
// "Nye regler" once after the admin changes them
const seenKey = (propertyId: string) => `lb-house-rules-seen:${propertyId}`

export function markHouseRulesSeen(propertyId: string, updatedAt: string) {
  try {
    localStorage.setItem(seenKey(propertyId), updatedAt)
  } catch {
    // storage unavailable (private mode): the badge just keeps showing
  }
}

export function houseRulesUnseen(propertyId: string, updatedAt: string): boolean {
  try {
    return localStorage.getItem(seenKey(propertyId)) !== updatedAt
  } catch {
    return false
  }
}
