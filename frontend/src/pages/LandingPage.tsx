import {Navigate} from 'react-router-dom'
import {useMeQuery} from '../features/auth/authApi'
import {useModal} from '../shared/modals/useModal'

export function LandingPage() {
    const {openModal} = useModal()
    const {data: user, isLoading} = useMeQuery()

    if (isLoading) return null
    if (user) return <Navigate to="/dashboard" replace/>

    return (
        <div className="d-flex flex-column min-vh-100">

            {/* ── Navbar ── */}
            <nav
                className="navbar sticky-top border-bottom"
                style={{backgroundColor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)'}}
            >
                <div className="container-xl px-4">
                    <a
                        className="navbar-brand d-flex align-items-center gap-2 fw-bold text-decoration-none"
                        href="/"
                        style={{color: '#0d1b2a', fontSize: '1.15rem', letterSpacing: '-0.2px'}}
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1565c0" strokeWidth="2"
                             strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"/>
                            <circle cx="12" cy="12" r="4"/>
                            <path d="M2 12h3M19 12h3M12 2v3M12 19v3"/>
                        </svg>
                        LaundryBook
                    </a>
                    <button
                        className="btn btn-primary fw-semibold px-4"
                        style={{borderRadius: '8px', fontSize: '0.9rem'}}
                        onClick={() => openModal('login')}
                    >
                        Log ind
                    </button>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section
                className="d-flex align-items-center w-100"
                style={{
                    minHeight: 'calc(100vh - 57px)',
                    background: 'linear-gradient(150deg, #0a1929 0%, #0d3b7a 55%, #1565c0 100%)',
                }}
            >
                <div className="container-xl px-4 py-5 py-lg-0">
                    <div className="row justify-content-center">
                        <div className="col-12 col-lg-8 col-xl-7 text-center text-white">

                            {/* Badge */}
                            <span
                                className="badge rounded-pill mb-4 d-inline-flex align-items-center gap-2 px-3 py-2"
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    fontWeight: 500,
                                    fontSize: '0.78rem',
                                    color: 'rgba(255,255,255,0.85)',
                                }}
                            >
                <span
                    className="rounded-circle d-inline-block"
                    style={{width: 7, height: 7, backgroundColor: '#4fc3f7'}}
                />
                Vaskebooking til ejerforeninger
              </span>

                            {/* Headline */}
                            <h1
                                className="fw-bold mb-4"
                                style={{
                                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                                    lineHeight: 1.15,
                                    letterSpacing: '-0.5px',
                                }}
                            >
                                Simpel digital booking til vaskerummet
                            </h1>

                            {/* Subtitle */}
                            <p
                                className="mb-5 mx-auto"
                                style={{
                                    color: 'rgba(255,255,255,0.72)',
                                    fontSize: 'clamp(1rem, 2vw, 1.15rem)',
                                    lineHeight: 1.7,
                                    maxWidth: '520px',
                                }}
                            >
                                Undgå konflikter om vasketider. Giv beboerne et enkelt system til at booke vaskerum —
                                tilgængeligt fra mobil og computer.
                            </p>

                            {/* CTAs */}
                            <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                                <button
                                    className="btn btn-lg fw-bold px-5"
                                    style={{
                                        backgroundColor: '#fff',
                                        color: '#0d3b7a',
                                        borderRadius: '10px',
                                        fontSize: '1.05rem',
                                        boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
                                        border: 'none',
                                    }}
                                    onClick={() => openModal('login')}
                                >
                                    Log ind
                                </button>
                                <button
                                    className="btn btn-lg fw-semibold px-5"
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: 'rgba(255,255,255,0.85)',
                                        borderRadius: '10px',
                                        fontSize: '1.05rem',
                                        border: '1px solid rgba(255,255,255,0.35)',
                                    }}
                                    onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}
                                >
                                    Læs mere
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section id="features" className="w-100 py-5" style={{backgroundColor: '#f8fafb'}}>
                <div className="container-xl px-4">
                    <div className="row justify-content-center mb-5">
                        <div className="col-12 col-lg-6 text-center">
                            <h2
                                className="fw-bold mb-3"
                                style={{
                                    fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                                    letterSpacing: '-0.3px',
                                    color: '#0d1b2a'
                                }}
                            >
                                Alt hvad din forening har brug for
                            </h2>
                            <p style={{color: '#5a6a7a', fontSize: '1rem'}}>
                                Designet til de små og mellemstore ejerforeninger.
                            </p>
                        </div>
                    </div>

                    <div className="row g-4">
                        {[
                            {
                                icon: (
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1565c0"
                                         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                        <line x1="3" y1="10" x2="21" y2="10"/>
                                        <path d="M9 16l2 2 4-4"/>
                                    </svg>
                                ),
                                title: 'Nem booking',
                                body: 'Beboerne booker en vask på få sekunder — fra mobil eller computer, når det passer dem.',
                            },
                            {
                                icon: (
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1565c0"
                                         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"/>
                                        <circle cx="12" cy="12" r="4"/>
                                        <path d="M2 12h3M19 12h3M12 2v3M12 19v3"/>
                                    </svg>
                                ),
                                title: 'Altid overblik',
                                body: 'Se hvornår vaskerummet er ledigt og undgå dobbeltbookinger med vores smarte kalender.',
                            },
                            {
                                icon: (
                                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1565c0"
                                         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                ),
                                title: 'Let administration',
                                body: 'Bestyrelsen opsætter tider, rum og maskiner. Ingen teknisk viden kræves.',
                            },
                        ].map((f) => (
                            <div key={f.title} className="col-12 col-md-4">
                                <div
                                    className="h-100 p-4 rounded-3 bg-white"
                                    style={{
                                        border: '1px solid #e8ecf0',
                                        transition: 'box-shadow 0.2s, transform 0.2s',
                                    }}
                                    onMouseEnter={(e) => {
                                        const el = e.currentTarget as HTMLDivElement
                                        el.style.boxShadow = '0 8px 32px rgba(13,59,122,0.1)'
                                        el.style.transform = 'translateY(-3px)'
                                    }}
                                    onMouseLeave={(e) => {
                                        const el = e.currentTarget as HTMLDivElement
                                        el.style.boxShadow = 'none'
                                        el.style.transform = 'none'
                                    }}
                                >
                                    <div className="mb-3">{f.icon}</div>
                                    <h5 className="fw-bold mb-2" style={{color: '#0d1b2a'}}>{f.title}</h5>
                                    <p className="mb-0"
                                       style={{color: '#5a6a7a', fontSize: '0.95rem', lineHeight: 1.65}}>{f.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="w-100 py-5" style={{backgroundColor: '#0d3b7a'}}>
                <div className="container-xl px-4">
                    <div className="row justify-content-center">
                        <div className="col-12 col-lg-6 text-center text-white">
                            <h2
                                className="fw-bold mb-3"
                                style={{fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.3px'}}
                            >
                                Klar til at komme i gang?
                            </h2>
                            <p className="mb-4" style={{color: 'rgba(255,255,255,0.72)', fontSize: '1rem'}}>
                                Log ind og administrer jeres vaskerum med det samme.
                            </p>
                            <button
                                className="btn btn-lg fw-bold px-5"
                                style={{
                                    backgroundColor: '#fff',
                                    color: '#0d3b7a',
                                    borderRadius: '10px',
                                    fontSize: '1.05rem',
                                    border: 'none',
                                }}
                                onClick={() => openModal('login')}
                            >
                                Log ind
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="w-100 py-4" style={{backgroundColor: '#0a1929'}}>
                <div className="container-xl px-4">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
                        <div className="d-flex align-items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4fc3f7" strokeWidth="2"
                                 strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <circle cx="12" cy="12" r="4"/>
                                <path d="M2 12h3M19 12h3M12 2v3M12 19v3"/>
                            </svg>
                            <span className="fw-semibold" style={{color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem'}}>
                LaundryBook
              </span>
                        </div>
                        <span style={{color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem'}}>
              © {new Date().getFullYear()} LaundryBook. Alle rettigheder forbeholdes.
            </span>
                    </div>
                </div>
            </footer>

        </div>
    )
}
