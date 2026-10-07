import { FirebaseError } from 'firebase/app'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import type { TFunction } from 'i18next'
import { firebaseAuth } from '../../lib/firebase'
import { extractErrorMessage } from '../../shared/utils/errorUtils'

// If an earlier attempt already created the Firebase account (and then failed on our backend),
// signing in with the same password lets the user simply retry instead of being stuck.
export async function createOrSignInFirebaseUser(email: string, password: string): Promise<string> {
  try {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)
    return await credential.user.getIdToken()
  } catch (err) {
    if (!(err instanceof FirebaseError) || err.code !== 'auth/email-already-in-use') throw err
    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email, password)
      return await credential.user.getIdToken()
    } catch (signInErr) {
      // Wrong password for an existing account: "account already exists" is the useful message
      if (signInErr instanceof FirebaseError && signInErr.code === 'auth/invalid-credential') throw err
      throw signInErr
    }
  }
}

export function authErrorMessage(err: unknown, t: TFunction, fallback: string): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/email-already-in-use': return t('auth.errors.emailInUse')
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found': return t('auth.errors.invalidCredential')
      case 'auth/weak-password': return t('auth.errors.weakPassword')
      case 'auth/invalid-email': return t('auth.errors.invalidEmail')
      case 'auth/too-many-requests': return t('auth.errors.tooManyRequests')
      case 'auth/network-request-failed': return t('auth.errors.network')
      default: return fallback
    }
  }
  return extractErrorMessage(err, fallback)
}
