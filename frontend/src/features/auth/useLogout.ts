import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useLogoutMutation } from './authApi'
import { baseApi } from '../../app/baseApi'

export function useLogout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [logout] = useLogoutMutation()

  return async function handleLogout() {
    await logout()
    // Loaded on demand so Firebase stays out of the main bundle
    const [{ signOut }, { firebaseAuth }] = await Promise.all([import('firebase/auth'), import('../../lib/firebase')])
    await signOut(firebaseAuth)
    dispatch(baseApi.util.resetApiState())
    navigate('/', { replace: true })
  }
}
