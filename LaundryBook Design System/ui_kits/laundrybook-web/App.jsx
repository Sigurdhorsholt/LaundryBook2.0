function App() {
  const [route, setRoute] = React.useState(() => localStorage.getItem('lb.route') || '/');
  const [authed, setAuthed] = React.useState(() => localStorage.getItem('lb.authed') === '1');
  const [email, setEmail] = React.useState(() => localStorage.getItem('lb.email') || '');
  const [showLogin, setShowLogin] = React.useState(false);

  // Tweaks
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "heroVariant": "warmsage"
  }/*EDITMODE-END*/;
  const [tweaks, setTweaks] = React.useState(TWEAK_DEFAULTS);
  const [tweaksOn, setTweaksOn] = React.useState(false);

  React.useEffect(() => { localStorage.setItem('lb.route', route); }, [route]);
  React.useEffect(() => { localStorage.setItem('lb.authed', authed ? '1' : '0'); }, [authed]);
  React.useEffect(() => { localStorage.setItem('lb.email', email); }, [email]);

  React.useEffect(() => {
    const handler = (e) => {
      const d = e.data || {};
      if (d.type === '__activate_edit_mode') setTweaksOn(true);
      if (d.type === '__deactivate_edit_mode') setTweaksOn(false);
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const go = (r) => { setRoute(r); window.scrollTo(0, 0); };
  const openLogin = () => setShowLogin(true);
  const onLoginSuccess = (em) => { setEmail(em); setAuthed(true); setShowLogin(false); setRoute('/admin'); };
  const onLogout = () => { setAuthed(false); setEmail(''); setRoute('/'); };

  // Public pages: available with or without auth
  const publicRoutes = ['/', '/about', '/features', '/demo', '/pricing', '/faq'];
  const isPublic = publicRoutes.includes(route);

  let content;
  if (isPublic) {
    if (route === '/') content = <LandingPage onLogin={openLogin} go={go} heroVariant={tweaks.heroVariant} />;
    else if (route === '/about') content = <AboutPage onLogin={openLogin} go={go} />;
    else if (route === '/features') content = <FeaturesPage onLogin={openLogin} go={go} />;
    else if (route === '/demo') content = <DemoPage onLogin={openLogin} go={go} />;
    else if (route === '/pricing') content = <PricingPage onLogin={openLogin} go={go} />;
    else if (route === '/faq') content = <FaqPage onLogin={openLogin} go={go} />;
  } else if (authed) {
    const isAdmin = route.startsWith('/admin');
    content = (
      <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: isAdmin ? C.bgPage : C.bgCard }}>
        <Navbar isAdmin={isAdmin} route={route} go={go} onLogout={onLogout} />
        <div className="d-flex flex-grow-1" style={{ minHeight: 0 }}>
          {isAdmin && <Sidebar route={route} go={go} />}
          <main className="flex-grow-1" style={{ minWidth: 0, overflowX: 'hidden' }}>
            {route === '/laundry' && <ResidentBookingPage />}
            {route === '/admin' && <AdminDashboardPage email={email} />}
            {route === '/admin/properties' && <AdminDashboardPage email={email} />}
            {route === '/admin/users' && <AdminDashboardPage email={email} />}
            {route === '/my-page' && (
              <div className="p-5" style={{ color: C.textSecondary }}>
                <h1 style={{ color: C.textPrimary, fontSize: '1.6rem' }}>Min side</h1>
                <p>Stub.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  } else {
    // not authed, hit authed route → bounce to landing
    content = <LandingPage onLogin={openLogin} go={go} heroVariant={tweaks.heroVariant} />;
  }

  return (
    <>
      {content}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onSuccess={onLoginSuccess} />}
      {tweaksOn && <TweaksPanel tweaks={tweaks} setTweaks={setTweaks} />}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<App />);
