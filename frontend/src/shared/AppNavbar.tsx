import {NavLink, useNavigate, useLocation} from 'react-router-dom'
import {useEffect} from 'react'
import {useDispatch} from 'react-redux'
import {signOut} from 'firebase/auth'
import {firebaseAuth} from '../lib/firebase'
import {useMeQuery, useLogoutMutation} from '../features/auth/authApi'
import {isAdmin as checkIsAdmin} from './roleUtils'
import {colors} from './theme'
import {baseApi} from '../app/baseApi'
import {BrandLogo} from './BrandLogo'
import {IconMenu} from './icons'

const NAV_OFFCANVAS_ID = 'navMenuOffcanvas'

interface NavbarProps {
    isAdmin?: boolean
}

function useNavMenuAutoClose() {
    const location = useLocation()
    useEffect(() => {
        const el = document.getElementById(NAV_OFFCANVAS_ID)
        if (!el) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const instance = (window as any).bootstrap?.Offcanvas?.getInstance(el)
        instance?.hide()
    }, [location.pathname])
}

export function AppNavbar({isAdmin = false}: NavbarProps) {
    const navigate = useNavigate()
    const {data: user} = useMeQuery()
    const [logout] = useLogoutMutation()
    const dispatch = useDispatch()
    useNavMenuAutoClose()

    const showAdminLink = !isAdmin && user && checkIsAdmin(user)

    async function handleLogout() {
        await logout()
        await signOut(firebaseAuth)
        dispatch(baseApi.util.resetApiState())
        navigate('/', {replace: true})
    }

    return (
        <>
            <nav
                className="sticky-top border-bottom flex-shrink-0"
                style={{backgroundColor: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', zIndex: 1040}}
            >
                <div className="container-fluid px-3 px-lg-4 d-flex align-items-center" style={{height: 56}}>

                    {/* Admin: sidebar offcanvas toggle (mobile only) */}
                    {isAdmin && (
                        <button
                            className="btn d-lg-none p-2 me-2"
                            style={{color: colors.textSecondary}}
                            type="button"
                            data-bs-toggle="offcanvas"
                            data-bs-target="#adminSidebar"
                            aria-controls="adminSidebar"
                            aria-label="Åbn sidepanel"
                        >
                            <IconMenu size={20}/>
                        </button>
                    )}

                    {/* Brand */}
                    <NavLink
                        to={isAdmin ? '/admin' : '/laundry'}
                        className="navbar-brand d-flex align-items-center gap-2 fw-bold text-decoration-none"
                        style={{color: colors.textPrimary, fontSize: '1.05rem', letterSpacing: '-0.2px'}}
                    >
                        <BrandLogo size={18}/>
                        LaundryBook
                        {isAdmin && (
                            <span
                                className="badge ms-1"
                                style={{
                                    backgroundColor: colors.primaryLight,
                                    color: colors.primary,
                                    fontSize: '0.7rem',
                                    fontWeight: 600
                                }}
                            >
                Admin
              </span>
                        )}
                    </NavLink>

                    {/* Desktop: nav links */}
                    <div className="d-none d-lg-flex align-items-center gap-1 ms-auto">
                        {showAdminLink && (
                            <NavLink
                                to="/admin"
                                className="btn btn-sm"
                                style={({isActive}) => ({
                                    borderRadius: '7px', fontSize: '0.85rem',
                                    color: isActive ? colors.primary : colors.textSecondary,
                                    backgroundColor: isActive ? colors.primaryLight : undefined,
                                    fontWeight: isActive ? 600 : undefined,
                                })}
                            >
                                Admin
                            </NavLink>
                        )}
                        <NavLink
                            to="/laundry"
                            className="btn btn-sm"
                            style={({isActive}) => ({
                                borderRadius: '7px', fontSize: '0.85rem',
                                color: isActive ? colors.primary : colors.textSecondary,
                                backgroundColor: isActive ? colors.primaryLight : undefined,
                                fontWeight: isActive ? 600 : undefined,
                            })}
                        >
                            Vaskebooking
                        </NavLink>
                        <a
                            href="/my-page"
                            className="btn btn-sm"
                            style={{borderRadius: '7px', fontSize: '0.85rem', color: colors.textSecondary}}
                        >
                            Min side
                        </a>
                        <a
                            href="#"
                            className="btn btn-sm"
                            style={{borderRadius: '7px', fontSize: '0.85rem', color: colors.textSecondary}}
                        >
                            Om LaundryBook
                        </a>
                        <button
                            className="btn btn-sm btn-outline-secondary ms-1"
                            style={{borderRadius: '7px', fontSize: '0.85rem'}}
                            onClick={handleLogout}
                        >
                            Log ud
                        </button>
                    </div>

                    {/* Mobile: nav menu toggle */}
                    <button
                        className="btn d-lg-none ms-auto p-2"
                        style={{color: colors.textSecondary}}
                        type="button"
                        data-bs-toggle="offcanvas"
                        data-bs-target={`#${NAV_OFFCANVAS_ID}`}
                        aria-controls={NAV_OFFCANVAS_ID}
                        aria-label="Åbn navigation"
                    >
                        <IconMenu size={22}/>
                    </button>

                </div>
            </nav>

            {/* ── Full-screen slide-in nav menu (mobile) ── */}
            <div
                className="offcanvas offcanvas-end"
                id={NAV_OFFCANVAS_ID}
                tabIndex={-1}
                aria-labelledby="navMenuOffcanvasLabel"
                style={{width: 'min(320px, 85vw)'}}
            >
                <div className="offcanvas-header border-bottom px-4 py-3">
                    <div className="d-flex align-items-center gap-2">
                        <BrandLogo size={18}/>
                        <span id="navMenuOffcanvasLabel" className="fw-bold"
                              style={{color: colors.textPrimary, fontSize: '1.05rem'}}>
              LaundryBook
            </span>
                    </div>
                    <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="offcanvas"
                        aria-label="Luk"
                    />
                </div>

                <div className="offcanvas-body px-4 py-3 d-flex flex-column">
                    {showAdminLink && (
                        <NavLink
                            to="/admin"
                            className="text-decoration-none py-3 border-bottom fw-medium"
                            style={({isActive}) => ({
                                fontSize: '1.1rem',
                                color: isActive ? colors.primary : colors.textPrimary,
                                fontWeight: isActive ? 700 : undefined,
                            })}
                        >
                            Admin
                        </NavLink>
                    )}
                    <NavLink
                        to="/laundry"
                        className="text-decoration-none py-3 border-bottom fw-medium"
                        style={({isActive}) => ({
                            fontSize: '1.1rem',
                            color: isActive ? colors.primary : colors.textPrimary,
                            fontWeight: isActive ? 700 : undefined,
                        })}
                    >
                        Vaskebooking
                    </NavLink>
                    <a
                        href="/my-page"
                        className="text-decoration-none py-3 border-bottom fw-medium"
                        style={{fontSize: '1.1rem', color: colors.textPrimary}}
                    >
                        Min side
                    </a>
                    <a
                        href="#"
                        className="text-decoration-none py-3 border-bottom fw-medium"
                        style={{fontSize: '1.1rem', color: colors.textPrimary}}
                    >
                        Om LaundryBook
                    </a>
                    <button
                        className="btn btn-outline-secondary mt-4"
                        style={{borderRadius: '8px', fontSize: '0.95rem', alignSelf: 'flex-start', minWidth: 120}}
                        onClick={handleLogout}
                    >
                        Log ud
                    </button>
                </div>
            </div>
        </>
    )
}
