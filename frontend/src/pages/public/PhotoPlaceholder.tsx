import type { CSSProperties } from 'react'

type SceneName = 'livingroom' | 'laundry' | 'building' | 'hallway' | 'kitchen'

const scenes: Record<SceneName, JSX.Element> = {
  livingroom: (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="livSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5ede0" /><stop offset="100%" stopColor="#ead9c2" />
        </linearGradient>
        <linearGradient id="livFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c6a882" /><stop offset="100%" stopColor="#a88a64" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="#e8dfd0" />
      <rect x="60" y="40" width="140" height="130" fill="url(#livSky)" />
      <rect x="60" y="40" width="140" height="130" fill="none" stroke="#b09676" strokeWidth="5" />
      <line x1="130" y1="40" x2="130" y2="170" stroke="#b09676" strokeWidth="3" />
      <line x1="60" y1="105" x2="200" y2="105" stroke="#b09676" strokeWidth="3" />
      <rect x="215" y="130" width="35" height="45" fill="#8c6d47" />
      <path d="M232 130 Q232 100 218 92 Q245 98 232 130 Q232 105 250 100 Q240 128 232 130 Q232 115 255 120 Q245 130 232 130" fill="#3d7a5c" />
      <rect y="220" width="400" height="80" fill="url(#livFloor)" />
      <rect x="250" y="175" width="120" height="55" rx="8" fill="#5a6a7a" />
      <rect x="255" y="180" width="35" height="28" rx="4" fill="#7a8999" />
      <rect x="295" y="180" width="35" height="28" rx="4" fill="#7a8999" />
      <rect x="335" y="180" width="30" height="28" rx="4" fill="#7a8999" />
      <rect x="260" y="172" width="26" height="22" rx="4" fill="#c88a6a" transform="rotate(-8 273 183)" />
      <ellipse cx="200" cy="260" rx="140" ry="22" fill="#c8a080" opacity="0.6" />
      <rect x="30" y="150" width="4" height="70" fill="#6a5a45" />
      <polygon points="22,140 42,140 38,160 26,160" fill="#d9b88a" />
    </svg>
  ),
  laundry: (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="300" fill="#dfe7ea" />
      <g opacity="0.35">
        {Array.from({ length: 8 }).map((_, r) =>
          Array.from({ length: 12 }).map((_, c) => (
            <rect key={`${r}-${c}`} x={c * 34 + 1} y={r * 30 + 1} width="32" height="28" fill="none" stroke="#b8c5ca" strokeWidth="1" />
          ))
        )}
      </g>
      <rect y="230" width="400" height="70" fill="#8e9ba2" />
      <rect x="60" y="120" width="100" height="130" fill="#fafbfc" stroke="#c0c8cd" strokeWidth="2" />
      <circle cx="110" cy="190" r="32" fill="#1a2e24" />
      <circle cx="110" cy="190" r="26" fill="#2c4a3a" />
      <circle cx="110" cy="190" r="20" fill="#4fc3f7" opacity="0.3" />
      <rect x="72" y="130" width="76" height="8" rx="2" fill="#e0e6ea" />
      <circle cx="145" cy="134" r="3" fill="#3d7a5c" />
      <rect x="170" y="120" width="100" height="130" fill="#fafbfc" stroke="#c0c8cd" strokeWidth="2" />
      <circle cx="220" cy="190" r="32" fill="#1a2e24" />
      <circle cx="220" cy="190" r="26" fill="#2c4a3a" />
      <rect x="182" y="130" width="76" height="8" rx="2" fill="#e0e6ea" />
      <circle cx="255" cy="134" r="3" fill="#c62828" />
      <ellipse cx="320" cy="245" rx="40" ry="10" fill="#8e9ba2" opacity="0.5" />
      <path d="M290 215 L350 215 L340 245 L300 245 Z" fill="#c8a875" stroke="#9a7f54" strokeWidth="1.5" />
      <g stroke="#9a7f54" strokeWidth="1" opacity="0.6">
        <line x1="295" y1="222" x2="345" y2="222" />
        <line x1="297" y1="230" x2="343" y2="230" />
        <line x1="299" y1="238" x2="341" y2="238" />
      </g>
      <rect x="298" y="208" width="44" height="12" rx="2" fill="#e8f5ee" />
      <rect x="302" y="204" width="36" height="8" rx="2" fill="#c8a080" />
    </svg>
  ),
  building: (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="bSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eaddc9" /><stop offset="100%" stopColor="#d8c6a8" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#bSky)" />
      <rect y="265" width="400" height="35" fill="#9a9890" />
      <rect x="0" y="60" width="140" height="205" fill="#b8765a" />
      <rect x="0" y="60" width="140" height="6" fill="#8c5540" />
      {Array.from({ length: 4 }).map((_, r) => (
        <g key={r}>
          <rect x={20} y={85 + r * 40} width="30" height="28" fill="#f0e4d0" />
          <rect x={20} y={85 + r * 40} width="30" height="28" fill="none" stroke="#6a4030" strokeWidth="1.5" />
          <rect x={65} y={85 + r * 40} width="30" height="28" fill="#f0e4d0" />
          <rect x={65} y={85 + r * 40} width="30" height="28" fill="none" stroke="#6a4030" strokeWidth="1.5" />
          <rect x={105} y={85 + r * 40} width="25" height="28" fill="#f0e4d0" />
          <rect x={105} y={85 + r * 40} width="25" height="28" fill="none" stroke="#6a4030" strokeWidth="1.5" />
        </g>
      ))}
      <rect x="140" y="30" width="130" height="235" fill="#e8d28a" />
      <rect x="140" y="30" width="130" height="8" fill="#b89c50" />
      {Array.from({ length: 5 }).map((_, r) => (
        <g key={r}>
          <rect x={160} y={55 + r * 38} width="28" height="26" fill="#3d5668" />
          <rect x={160} y={55 + r * 38} width="28" height="26" fill="none" stroke="#8a7540" strokeWidth="1.5" />
          <rect x={200} y={55 + r * 38} width="28" height="26" fill="#3d5668" />
          <rect x={200} y={55 + r * 38} width="28" height="26" fill="none" stroke="#8a7540" strokeWidth="1.5" />
          <rect x={240} y={55 + r * 38} width="22" height="26" fill="#3d5668" />
          <rect x={240} y={55 + r * 38} width="22" height="26" fill="none" stroke="#8a7540" strokeWidth="1.5" />
        </g>
      ))}
      <rect x="195" y="230" width="28" height="35" fill="#6a4d30" />
      <circle cx="217" cy="248" r="1.5" fill="#d4af37" />
      <rect x="270" y="80" width="130" height="185" fill="#6a8a75" />
      <rect x="270" y="80" width="130" height="6" fill="#3d5a4a" />
      {Array.from({ length: 4 }).map((_, r) => (
        <g key={r}>
          <rect x={290} y={105 + r * 40} width="28" height="26" fill="#f5ede0" />
          <rect x={330} y={105 + r * 40} width="28" height="26" fill="#f5ede0" />
          <rect x={368} y={105 + r * 40} width="22" height="26" fill="#f5ede0" />
        </g>
      ))}
      <g transform="translate(330 240)">
        <circle cx="0" cy="15" r="10" fill="none" stroke="#2a2a2a" strokeWidth="2" />
        <circle cx="30" cy="15" r="10" fill="none" stroke="#2a2a2a" strokeWidth="2" />
        <path d="M0 15 L15 -2 L30 15 M15 -2 L22 15" fill="none" stroke="#2a2a2a" strokeWidth="2" />
      </g>
    </svg>
  ),
  hallway: (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="300" fill="#e8dccb" />
      <polygon points="0,0 200,60 200,240 0,300" fill="#d9c7ab" />
      <polygon points="400,0 200,60 200,240 400,300" fill="#c8b394" />
      <polygon points="0,0 400,0 200,60" fill="#e8dccb" />
      <polygon points="0,300 400,300 200,240" fill="#a8896a" />
      <rect x="40" y="120" width="40" height="90" fill="#6a4a32" />
      <rect x="45" y="125" width="30" height="30" fill="#8a6a4a" />
      <rect x="45" y="160" width="30" height="45" fill="#8a6a4a" />
      <circle cx="72" cy="170" r="2" fill="#d4af37" />
      <rect x="330" y="115" width="40" height="95" fill="#6a4a32" />
      <rect x="335" y="120" width="30" height="32" fill="#8a6a4a" />
      <rect x="335" y="157" width="30" height="48" fill="#8a6a4a" />
      <circle cx="340" cy="167" r="2" fill="#d4af37" />
      <polygon points="120,270 280,270 260,240 140,240" fill="#a85850" opacity="0.8" />
      <polygon points="140,260 260,260 252,250 148,250" fill="#c87060" opacity="0.6" />
      <line x1="200" y1="60" x2="200" y2="110" stroke="#6a5a45" strokeWidth="2" />
      <circle cx="200" cy="115" r="10" fill="#f5d98a" />
    </svg>
  ),
  kitchen: (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
      <rect width="400" height="300" fill="#eadfc8" />
      <rect x="0" y="30" width="400" height="80" fill="#3d5a4a" />
      <line x1="100" y1="30" x2="100" y2="110" stroke="#2a3e32" strokeWidth="2" />
      <line x1="200" y1="30" x2="200" y2="110" stroke="#2a3e32" strokeWidth="2" />
      <line x1="300" y1="30" x2="300" y2="110" stroke="#2a3e32" strokeWidth="2" />
      <rect x="0" y="175" width="400" height="15" fill="#c8c0b0" />
      <rect x="0" y="190" width="400" height="80" fill="#b8a080" />
      <line x1="100" y1="190" x2="100" y2="270" stroke="#8a7050" strokeWidth="2" />
      <line x1="200" y1="190" x2="200" y2="270" stroke="#8a7050" strokeWidth="2" />
      <line x1="300" y1="190" x2="300" y2="270" stroke="#8a7050" strokeWidth="2" />
      <rect x="0" y="110" width="400" height="65" fill="#f5ede0" />
      <rect y="270" width="400" height="30" fill="#9a8870" />
      <g transform="translate(60 135)">
        <path d="M0 30 Q0 10 15 10 L30 10 Q45 10 45 30 L45 40 L0 40 Z" fill="#1a2e24" />
        <circle cx="22" cy="25" r="2" fill="#4fc3f7" />
        <rect x="-5" y="15" width="8" height="12" fill="#1a2e24" rx="2" />
      </g>
      <g transform="translate(280 125)">
        <rect x="0" y="30" width="25" height="20" fill="#c88a6a" />
        <path d="M12 30 Q12 5 5 0 Q25 3 12 30 Q12 10 28 8 Q20 28 12 30" fill="#3d7a5c" />
      </g>
      <circle cx="180" cy="165" r="8" fill="#fff" stroke="#c0b8a8" strokeWidth="1" />
      <circle cx="200" cy="165" r="8" fill="#c88a6a" />
    </svg>
  ),
}

export function PhotoPlaceholder({
  scene = 'livingroom',
  aspect = '4/3',
  className = '',
  style = {},
}: {
  scene?: SceneName
  aspect?: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={className} style={{ aspectRatio: aspect, overflow: 'hidden', borderRadius: 'inherit', ...style }}>
      {scenes[scene] ?? scenes.livingroom}
    </div>
  )
}
