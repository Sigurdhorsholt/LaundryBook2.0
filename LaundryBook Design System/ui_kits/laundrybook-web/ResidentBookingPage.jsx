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

const MAX_CONCURRENT = 2;
const LOOKAHEAD_DAYS = 14;

const DAY_SHORT = ['sø', 'ma', 'ti', 'on', 'to', 'fr', 'lø'];
const MONTH_SHORT = ['jan','feb','mar','apr','maj','jun','jul','aug','sep','okt','nov','dec'];

function addDays(iso, n) {
  const d = new Date(iso); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function getWeekMonday(iso) {
  const d = new Date(iso);
  const dow = d.getDay();
  return addDays(iso, dow === 0 ? -6 : 1 - dow);
}

function smartDayShort(iso, todayIso) {
  if (iso === todayIso) return 'i dag';
  if (iso === addDays(todayIso, 1)) return 'i morgen';
  const d = new Date(iso); return DAY_SHORT[d.getDay()];
}

function fullDateLabel(iso) {
  const d = new Date(iso);
  const wd = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'][d.getDay()];
  return `${wd} ${d.getDate()}. ${MONTH_SHORT[d.getMonth()]}`;
}

function makeSeedBookings(todayIso) {
  return {
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
  };
}

function ResidentBookingPage() {
  const todayIso    = new Date().toISOString().slice(0, 10);
  const thisWeekMon = getWeekMonday(todayIso);
  const lookaheadEnd = addDays(todayIso, LOOKAHEAD_DAYS);

  const [selected,  setSelected]  = React.useState(todayIso);
  const [weekStart, setWeekStart] = React.useState(thisWeekMon);
  // Key = `${date}_${slotId}` -> 'own' | 'other'
  const [bookings, setBookings] = React.useState(() => makeSeedBookings(todayIso));
  // pending = { type: 'book'|'cancel', slotId, date } | null
  const [pending, setPending] = React.useState(null);

  const dates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const canGoBack = weekStart > thisWeekMon;

  const ownCount = Object.entries(bookings).filter(([k, v]) => {
    const date = k.split('_')[0];
    return v === 'own' && date >= todayIso;
  }).length;
  const maxReached = ownCount >= MAX_CONCURRENT;

  const DOT = { free: C.dotFree, few: C.dotFew, full: C.dotFull };

  const availability = React.useMemo(() => {
    const out = {};
    for (const d of dates) {
      if (d < todayIso || d > lookaheadEnd) { out[d] = 'past'; continue; }
      const taken = SLOTS.filter(s => bookings[`${d}_${s.id}`]).length;
      const free = SLOTS.length - taken;
      out[d] = free === 0 ? 'full' : free <= 2 ? 'few' : 'free';
    }
    return out;
  }, [bookings, weekStart]);

  // Next own booking — earliest date+slot in slot order
  const nextOwn = React.useMemo(() => {
    for (let i = 0; i <= LOOKAHEAD_DAYS; i++) {
      const d = addDays(todayIso, i);
      const slot = SLOTS.find(s => bookings[`${d}_${s.id}`] === 'own');
      if (slot) return { date: d, slot, key: `${d}_${slot.id}` };
    }
    return null;
  }, [bookings]);

  function shiftWeek(n) {
    const next = addDays(weekStart, n);
    if (next < thisWeekMon) return;
    setWeekStart(next);
    setSelected(prev => {
      const newEnd = addDays(next, 6);
      return prev >= next && prev <= newEnd ? prev : next;
    });
  }

  function handleConfirm() {
    if (!pending) return;
    const { type, slotId, date } = pending;
    const key = `${date}_${slotId}`;
    setPending(null);
    if (type === 'book') {
      setBookings(prev => ({ ...prev, [key]: 'own' }));
    } else {
      setBookings(prev => { const copy = { ...prev }; delete copy[key]; return copy; });
    }
  }

  const othersCount = SLOTS.filter(s => bookings[`${selected}_${s.id}`] === 'other').length;
  const pendingSlot = pending ? SLOTS.find(s => s.id === pending.slotId) : null;

  return (
    <div className="container-xl px-3 px-lg-4 py-4">

      {/* Page header */}
      <div className="mb-4">
        <h1 className="fw-bold mb-1" style={{ fontSize: '1.6rem', color: C.textPrimary }}>Vaskebooking</h1>
        <p className="mb-0" style={{ fontSize: '0.85rem', color: C.textSecondary }}>Vaskerum 1 · Nørrebrogade 42 (demo)</p>
      </div>

      {/* Next booking card */}
      {nextOwn && (
        <div className="rounded-3 mb-4 p-3 d-flex align-items-center justify-content-between gap-3"
          style={{ backgroundColor: C.successBg, border: `1px solid ${C.successBorder}` }}>
          <div>
            <p className="mb-0" style={{ fontSize: '0.7rem', fontWeight: 700, color: C.successText, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Din næste booking
            </p>
            <p className="mb-0 mt-1" style={{ fontSize: '0.9rem', fontWeight: 600, color: C.textPrimary }}>
              {fullDateLabel(nextOwn.date)} · {nextOwn.slot.start} – {nextOwn.slot.end}
            </p>
          </div>
          <button className="btn btn-sm flex-shrink-0"
            style={{ borderRadius: 7, fontSize: '0.78rem', border: `1px solid ${C.dangerBorder}`, color: C.dangerText, backgroundColor: '#fff' }}
            onClick={() => setPending({ type: 'cancel', slotId: nextOwn.slot.id, date: nextOwn.date })}>
            Aflys
          </button>
        </div>
      )}

      {/* maxReached banner */}
      {maxReached && (
        <div className="rounded-3 mb-3 px-3 py-2"
          style={{ backgroundColor: C.warningBg, border: `1px solid ${C.warningBorder}`, fontSize: '0.82rem', color: C.warningText }}>
          <strong>Du har nået din bookinggrænse ({MAX_CONCURRENT}).</strong>
          {' '}Aflys en aktiv booking for at frigøre en plads.
        </div>
      )}

      {/* Date strip with week navigation */}
      <div className="d-flex align-items-center gap-1 mb-3 p-2 rounded-3"
        style={{ backgroundColor: '#f8fafb', border: `1px solid ${C.border}` }}>
        <button className="btn btn-sm p-1 flex-shrink-0"
          style={{ color: canGoBack ? C.textPrimary : '#c0ccd8', lineHeight: 1, border: 'none', background: 'none' }}
          disabled={!canGoBack}
          onClick={() => shiftWeek(-7)}>
          {Icons.ChevLeft({ size: 15 })}
        </button>

        <div className="d-flex flex-grow-1 justify-content-between" style={{ gap: 2, overflowX: 'auto' }}>
          {dates.map(d => {
            const isSel   = d === selected;
            const isDimmed = d < todayIso || d > lookaheadEnd;
            const avail   = availability[d];
            return (
              <button key={d} onClick={() => setSelected(d)}
                className="border-0 d-flex flex-column align-items-center flex-shrink-0"
                style={{
                  borderRadius: 8, padding: '4px 6px', minWidth: 36, lineHeight: 1.25,
                  gap: 1, fontWeight: isSel ? 700 : 400,
                  backgroundColor: isSel ? C.primary : 'transparent',
                  color: isSel ? '#fff' : isDimmed ? '#c0ccd8' : C.textPrimary,
                  border: 'none', fontSize: '0.72rem', cursor: 'pointer',
                }}>
                <span style={{ textTransform: 'capitalize' }}>{smartDayShort(d, todayIso)}</span>
                <span style={{ fontSize: '0.88rem', fontWeight: isSel ? 700 : 500 }}>{new Date(d).getDate()}</span>
                <span style={{
                  width: 5, height: 5, borderRadius: '50%', display: 'block', marginTop: 1,
                  backgroundColor: isSel ? 'rgba(255,255,255,0.45)' : (avail === 'past' ? 'transparent' : DOT[avail]),
                }} />
              </button>
            );
          })}
        </div>

        <button className="btn btn-sm p-1 flex-shrink-0"
          style={{ color: C.textPrimary, lineHeight: 1, border: 'none', background: 'none' }}
          onClick={() => shiftWeek(7)}>
          {Icons.ChevRight({ size: 15 })}
        </button>
      </div>

      {/* Slot grid */}
      <div className="rounded-3 overflow-hidden" style={{ border: `1px solid ${C.border}`, backgroundColor: C.bgCard }}>
        {SLOTS.map((s, i) => {
          const key        = `${selected}_${s.id}`;
          const b          = bookings[key];
          const isOwn      = b === 'own';
          const takenOther = b === 'other';
          const isPast     = selected < todayIso;
          const isLocked   = selected > lookaheadEnd;
          const isClickable = !b && !isPast && !isLocked && !maxReached;
          return (
            <SlotRow key={s.id} slot={s} last={i === SLOTS.length - 1}
              isOwn={isOwn} takenOther={takenOther} clickable={isClickable}
              dimmed={isPast || isLocked}
              onBook={() => setPending({ type: 'book',   slotId: s.id, date: selected })}
              onCancel={() => setPending({ type: 'cancel', slotId: s.id, date: selected })} />
          );
        })}
      </div>

      {othersCount > 0 && (
        <p className="text-center mt-3 mb-0" style={{ fontSize: '0.76rem', color: C.textMuted }}>
          {othersCount === 1 ? '1 anden beboer har booket denne dag' : `${othersCount} andre beboere har booket denne dag`}
        </p>
      )}

      {/* Confirmation modal */}
      {pending && pendingSlot && (
        <ConfirmModal
          type={pending.type}
          slotTime={`${pendingSlot.start} – ${pendingSlot.end}`}
          dateLabel={fullDateLabel(pending.date)}
          onConfirm={handleConfirm}
          onClose={() => setPending(null)} />
      )}
    </div>
  );
}

function SlotRow({ slot, last, isOwn, takenOther, clickable, dimmed, onBook, onCancel }) {
  const [hovered, setHovered] = React.useState(false);
  const bg = isOwn ? C.successBg
    : takenOther ? C.slotTakenBg
    : hovered && clickable ? C.primaryLighter : C.bgCard;
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={clickable ? onBook : undefined}
      className="d-flex align-items-center justify-content-between px-3 py-2"
      style={{
        backgroundColor: bg,
        borderBottom: last ? 'none' : `1px solid ${C.border}`,
        cursor: clickable ? 'pointer' : 'default',
        opacity: dimmed ? 0.4 : 1,
        transition: 'background-color 0.15s',
      }}>
      <span style={{ fontWeight: 500, fontSize: '0.9rem', color: takenOther ? C.slotTakenText : C.textPrimary }}>
        {slot.start} – {slot.end}
      </span>
      <span>
        {isOwn && (
          <span className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: C.successText,
              backgroundColor: '#e8f5e9', padding: '3px 10px', borderRadius: 20 }}>
              Min booking
            </span>
            <button className="btn btn-sm"
              onClick={(e) => { e.stopPropagation(); onCancel(); }}
              style={{ borderRadius: 20, fontSize: '0.75rem', padding: '2px 10px',
                border: '1px solid #d0d8e0', color: C.textSecondary, backgroundColor: '#fff' }}>
              Aflys
            </button>
          </span>
        )}
        {takenOther && (
          <span style={{ fontSize: '0.78rem', fontWeight: 500, color: C.slotTakenText,
            backgroundColor: '#f0f4f8', padding: '3px 10px', borderRadius: 20 }}>
            Optaget
          </span>
        )}
        {clickable && (
          <span style={{ pointerEvents: 'none', borderRadius: 20, fontSize: '0.78rem', padding: '3px 16px',
            border: `1px solid ${C.primaryBorder}`, color: C.primary, backgroundColor: '#fff',
            fontWeight: 600, display: 'inline-block' }}>
            Book
          </span>
        )}
      </span>
    </div>
  );
}

function ConfirmModal({ type, slotTime, dateLabel, onConfirm, onClose }) {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)', zIndex: 1050 }}
        onClick={onClose} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        backgroundColor: '#fff', borderRadius: 12, padding: 24,
        width: 300, maxWidth: 'calc(100vw - 32px)',
        zIndex: 1051, boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
      }}>
        <h6 style={{ fontWeight: 700, color: C.textPrimary, marginBottom: 6, fontSize: '1rem' }}>
          {type === 'book' ? 'Bekræft booking' : 'Bekræft aflysning'}
        </h6>
        <p style={{ fontSize: '0.88rem', color: C.textSecondary, marginBottom: 6, lineHeight: 1.5 }}>
          {type === 'book'
            ? <><strong>{slotTime}</strong> den {dateLabel}</>
            : <>Aflys <strong>{slotTime}</strong> den {dateLabel}?</>
          }
        </p>
        <p style={{ fontSize: '0.76rem', color: C.textMuted, marginBottom: 20 }}>
          Dette er en demo — ingen rigtige bookinger oprettes.
        </p>
        <div className="d-flex gap-2 justify-content-end">
          <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 7, fontSize: '0.82rem' }}
            onClick={onClose}>Annuller</button>
          <button className={`btn btn-sm ${type === 'book' ? 'btn-primary' : 'btn-danger'}`}
            style={{ borderRadius: 7, fontSize: '0.82rem' }}
            onClick={onConfirm}>
            {type === 'book' ? 'Book' : 'Aflys'}
          </button>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { ResidentBookingPage });
