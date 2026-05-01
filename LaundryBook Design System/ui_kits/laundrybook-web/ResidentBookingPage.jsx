const SLOTS = [
  { id: 's1', start: '07:00', end: '08:30' },
  { id: 's2', start: '08:30', end: '10:00' },
  { id: 's3', start: '10:00', end: '11:30' },
  { id: 's4', start: '11:30', end: '13:00' },
  { id: 's5', start: '13:00', end: '14:30' },
  { id: 's6', start: '14:30', end: '16:00' },
  { id: 's7', start: '16:00', end: '17:30' },
  { id: 's8', start: '17:30', end: '19:00' },
];

const DAY_SHORT = ['sø', 'ma', 'ti', 'on', 'to', 'fr', 'lø'];
const MONTH_LONG = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'];

function addDays(iso, n) {
  const d = new Date(iso); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function dayLabel(iso, todayIso) {
  if (iso === todayIso) return 'I dag';
  if (iso === addDays(todayIso, 1)) return 'I morgen';
  const d = new Date(iso); return DAY_SHORT[d.getDay()];
}

function fullDateLabel(iso) {
  const d = new Date(iso);
  const wd = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'][d.getDay()];
  return `${wd} ${d.getDate()}. ${MONTH_LONG[d.getMonth()]}`;
}

function ResidentBookingPage() {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [selected, setSelected] = React.useState(todayIso);
  // Map of `${date}_${slotId}` -> 'own' | 'other'
  const [bookings, setBookings] = React.useState(() => ({
    [`${todayIso}_s4`]: 'other',
    [`${todayIso}_s7`]: 'other',
    [`${addDays(todayIso, 1)}_s3`]: 'other',
    [`${addDays(todayIso, 2)}_s1`]: 'other',
    [`${addDays(todayIso, 2)}_s2`]: 'other',
    [`${addDays(todayIso, 2)}_s5`]: 'other',
    [`${addDays(todayIso, 3)}_s1`]: 'other',
    [`${addDays(todayIso, 3)}_s2`]: 'other',
    [`${addDays(todayIso, 3)}_s3`]: 'other',
    [`${addDays(todayIso, 3)}_s4`]: 'other',
    [`${addDays(todayIso, 3)}_s5`]: 'other',
    [`${addDays(todayIso, 3)}_s6`]: 'other',
    [`${addDays(todayIso, 3)}_s7`]: 'other',
    [`${addDays(todayIso, 3)}_s8`]: 'other',
  }));
  const [justBooked, setJustBooked] = React.useState(null);

  const dates = Array.from({ length: 7 }, (_, i) => addDays(todayIso, i));

  const availability = React.useMemo(() => {
    const out = {};
    for (const d of dates) {
      const taken = SLOTS.filter(s => bookings[`${d}_${s.id}`]).length;
      const free = SLOTS.length - taken;
      out[d] = free === 0 ? 'full' : free <= 2 ? 'few' : 'free';
    }
    return out;
  }, [bookings]);

  const DOT = { free: C.dotFree, few: C.dotFew, full: C.dotFull };

  // Next own booking
  const nextOwn = React.useMemo(() => {
    const entries = Object.entries(bookings).filter(([, v]) => v === 'own');
    entries.sort((a, b) => a[0] < b[0] ? -1 : 1);
    if (!entries.length) return null;
    const [key] = entries[0];
    const [date, slotId] = key.split('_');
    const slot = SLOTS.find(s => s.id === slotId);
    return { date, slot, key };
  }, [bookings]);

  const bookSlot = (slotId) => {
    const key = `${selected}_${slotId}`;
    if (bookings[key]) return;
    setBookings({ ...bookings, [key]: 'own' });
    setJustBooked(key);
    setTimeout(() => setJustBooked(null), 500);
  };

  const cancelSlot = (key) => {
    const copy = { ...bookings }; delete copy[key]; setBookings(copy);
  };

  const othersCount = SLOTS.filter(s => bookings[`${selected}_${s.id}`] === 'other').length;

  return (
    <div className="container-xl px-3 px-lg-4 py-4">

      {/* Page header */}
      <div className="mb-4">
        <h1 className="fw-bold mb-1" style={{ fontSize: '1.6rem', color: C.textPrimary }}>Vaskebooking</h1>
        <p className="mb-0" style={{ fontSize: '0.85rem', color: C.textSecondary }}>Vaskerum 1 · Nørrebrogade 42</p>
      </div>

      {/* Upcoming booking card */}
      {nextOwn && (
        <div className="rounded-3 mb-4 p-3 d-flex align-items-center justify-content-between gap-3"
          style={{ backgroundColor: C.successBg, border: `1px solid ${C.successBorder}` }}>
          <div>
            <p className="mb-0" style={{ fontSize: '0.7rem', fontWeight: 700, color: C.successText, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Din næste booking
            </p>
            <p className="mb-0 mt-1" style={{ fontSize: '0.9rem', fontWeight: 600, color: C.textPrimary }}>
              {fullDateLabel(nextOwn.date)} · {nextOwn.slot.start} – {nextOwn.slot.end} · Vaskerum 1
            </p>
          </div>
          <button className="btn btn-sm flex-shrink-0"
            style={{ borderRadius: 7, fontSize: '0.78rem', border: `1px solid ${C.dangerBorder}`, color: C.dangerText, backgroundColor: '#fff' }}
            onClick={() => cancelSlot(nextOwn.key)}>
            Aflys
          </button>
        </div>
      )}

      {/* Date strip */}
      <div className="d-flex gap-2 mb-3">
        {dates.map(d => {
          const isSel = d === selected;
          const avail = availability[d];
          return (
            <button key={d} onClick={() => setSelected(d)}
              className="border-0 d-flex flex-column align-items-center py-2 px-1 flex-grow-1"
              style={{
                borderRadius: 8, gap: 2, minWidth: 0,
                backgroundColor: isSel ? C.primary : C.bgCard,
                color: isSel ? '#fff' : C.textPrimary,
                border: isSel ? 'none' : `1px solid ${C.border}`,
                cursor: 'pointer',
              }}>
              <span style={{ fontSize: '0.72rem', color: isSel ? 'rgba(255,255,255,0.75)' : C.textSecondary }}>
                {dayLabel(d, todayIso)}
              </span>
              <span style={{ fontSize: '1rem', fontWeight: 700 }}>{new Date(d).getDate()}</span>
              <span style={{ width: 5, height: 5, borderRadius: '50%', marginTop: 2,
                backgroundColor: isSel ? 'rgba(255,255,255,0.6)' : DOT[avail] }} />
            </button>
          );
        })}
      </div>

      {/* Slot grid */}
      <div className="rounded-3 overflow-hidden" style={{ border: `1px solid ${C.border}`, backgroundColor: C.bgCard }}>
        {SLOTS.map((s, i) => {
          const key = `${selected}_${s.id}`;
          const b = bookings[key];
          const isOwn = b === 'own';
          const takenOther = b === 'other';
          const isClickable = !b;
          return (
            <SlotRow key={s.id} slot={s} last={i === SLOTS.length - 1}
              isOwn={isOwn} takenOther={takenOther} clickable={isClickable}
              justBooked={justBooked === key}
              onBook={() => bookSlot(s.id)}
              onCancel={() => cancelSlot(key)} />
          );
        })}
      </div>

      {othersCount > 0 && (
        <p className="text-center mt-3 mb-0" style={{ fontSize: '0.76rem', color: C.textMuted }}>
          {othersCount === 1 ? '1 anden beboer har booket denne dag' : `${othersCount} andre beboere har booket denne dag`}
        </p>
      )}
    </div>
  );
}

function SlotRow({ slot, last, isOwn, takenOther, clickable, justBooked, onBook, onCancel }) {
  const [hovered, setHovered] = React.useState(false);
  const bg = isOwn ? C.successBg
    : takenOther ? C.slotTakenBg
    : hovered ? C.primaryLighter : C.bgCard;
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={clickable ? onBook : undefined}
      className="d-flex align-items-center px-3 py-2"
      style={{
        backgroundColor: bg,
        borderBottom: last ? 'none' : `1px solid ${C.border}`,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'background-color 0.15s',
        animation: justBooked ? 'slot-booked 500ms ease-out' : undefined,
      }}>
      <span style={{ fontWeight: 600, width: 130, fontSize: '0.9rem',
        color: takenOther ? C.slotTakenText : C.textPrimary }}>
        {slot.start} – {slot.end}
      </span>
      <span style={{ flex: 1, fontSize: '0.82rem',
        color: isOwn ? C.successText : takenOther ? C.slotTakenText : C.textSecondary,
        fontWeight: isOwn ? 600 : 400 }}>
        {isOwn ? 'Din booking' : takenOther ? 'Optaget' : 'Ledigt'}
      </span>
      {isOwn && (
        <button className="btn btn-sm"
          onClick={(e) => { e.stopPropagation(); onCancel(); }}
          style={{ borderRadius: 6, fontSize: '0.75rem', padding: '3px 12px',
            border: `1px solid ${C.dangerBorder}`, color: C.dangerText, backgroundColor: '#fff', fontWeight: 500 }}>
          Aflys
        </button>
      )}
      {clickable && (
        <span className="btn btn-sm" tabIndex={-1}
          style={{ pointerEvents: 'none', borderRadius: 6, fontSize: '0.75rem', padding: '3px 14px',
            border: `1px solid ${C.primaryBorder}`, color: C.primary, backgroundColor: '#fff', fontWeight: 600 }}>
          Book
        </span>
      )}
    </div>
  );
}

Object.assign(window, { ResidentBookingPage });
