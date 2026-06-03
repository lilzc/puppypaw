import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, ChevronDown, RefreshCw, Calendar } from 'lucide-react';

/* ── Design tokens ───────────────────────────────────────────── */
const ORANGE   = '#FF6B35';
const T1       = '#1A1A1A';
const T2       = '#4A4A4A';
const T3       = '#9B9B9B';
const BG_INPUT = '#F8F8F8';
const DIVIDER  = '#F0F0F0';

/* ── Mini calendar ───────────────────────────────────────────── */
const MONTH_ZH = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
const DOW_ZH   = ['日','一','二','三','四','五','六'];

function MiniCalendar({ month, selected, onSelect, onMonthChange }: {
  month: Date; selected: Date | null;
  onSelect: (d: Date) => void;
  onMonthChange: (d: Date) => void;
}) {
  const yr  = month.getFullYear();
  const mo  = month.getMonth();
  const dim = new Date(yr, mo + 1, 0).getDate();
  const fd  = new Date(yr, mo, 1).getDay();
  const today = new Date(); today.setHours(0,0,0,0);

  const cells: (number | null)[] = [
    ...Array(fd).fill(null),
    ...Array.from({ length: dim }, (_, i) => i + 1),
  ];

  return (
    <div style={{ padding: '12px 4px 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={() => onMonthChange(new Date(yr, mo - 1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 8, color: T2 }}>
          <ChevronLeft style={{ width: 18, height: 18 }} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 15, color: T1 }}>{MONTH_ZH[mo]} {yr}</span>
        <button onClick={() => onMonthChange(new Date(yr, mo + 1))}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 8, color: T2 }}>
          <ChevronRight style={{ width: 18, height: 18 }} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', textAlign: 'center', marginBottom: 6 }}>
        {DOW_ZH.map(d => (
          <div key={d} style={{ fontSize: 11, color: T3, fontWeight: 500, padding: '2px 0' }}>{d}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const d = new Date(yr, mo, day); d.setHours(0,0,0,0);
          const isPast = d < today;
          const isSel  = selected?.toDateString() === d.toDateString();
          const isToday = d.toDateString() === today.toDateString();
          return (
            <button key={day} onClick={() => !isPast && onSelect(d)} disabled={isPast}
              style={{
                border: 'none', cursor: isPast ? 'not-allowed' : 'pointer',
                borderRadius: '50%', fontSize: 14, padding: '7px 2px',
                fontWeight: isSel || isToday ? 700 : 400,
                background: isSel ? ORANGE : 'transparent',
                color: isSel ? 'white' : isPast ? '#D8D8D8' : isToday ? ORANGE : T1,
                transition: 'all 0.12s',
              }}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step indicator ──────────────────────────────────────────── */
function Steps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {[1, 2, 3].map(n => (
        <div key={n} style={{
          height: 3, borderRadius: 3,
          width: n === current ? 24 : 16,
          background: n <= current ? ORANGE : '#E0E0E0',
          transition: 'all 0.2s',
        }} />
      ))}
    </div>
  );
}

/* ── Row wrapper ─────────────────────────────────────────────── */
function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: T2, marginBottom: 8, letterSpacing: 0.2 }}>{label}</p>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function BookingPage() {
  const nav = useNavigate();
  const [svcType,      setSvcType]      = useState<'once' | 'weekly'>('once');
  const [showCal,      setShowCal]      = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calMonth,     setCalMonth]     = useState(new Date());

  const fmtDate = (d: Date) =>
    d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });

  const canNext = selectedDate !== null;

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Nav bar ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${DIVIDER}` }}>
        <button onClick={() => nav('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: T2, fontSize: 15, fontWeight: 500, padding: 0 }}>
          <ChevronLeft style={{ width: 19, height: 19 }} /> 返回
        </button>
        <Steps current={1} />
        <button onClick={() => nav('/walkers')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, fontSize: 14, fontWeight: 500, padding: 0 }}>
          跳过
        </button>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div style={{ padding: '28px 20px 100px', maxWidth: 480, margin: '0 auto' }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: T1, marginBottom: 6, letterSpacing: -0.5 }}>找遛狗师</h1>
        <p style={{ color: T3, fontSize: 15, marginBottom: 32, lineHeight: 1.5 }}>选择服务类型和遛狗时间，我们为您匹配最合适的遛狗师</p>

        {/* Service type */}
        <FormRow label="服务类型">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {([
              { id: 'once'   as const, icon: <Calendar style={{ width: 22, height: 22 }} />, label: '单次服务', sub: '临时预约，灵活安排' },
              { id: 'weekly' as const, icon: <RefreshCw style={{ width: 22, height: 22 }} />, label: '每周固定', sub: '固定时间，优惠10%' },
            ] as const).map(opt => {
              const active = svcType === opt.id;
              return (
                <button key={opt.id} onClick={() => setSvcType(opt.id)}
                  style={{
                    padding: '16px 14px', borderRadius: 12, textAlign: 'left', cursor: 'pointer',
                    background: active ? '#FFF3EE' : BG_INPUT,
                    border: `2px solid ${active ? ORANGE : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}>
                  <div style={{ color: active ? ORANGE : T3, marginBottom: 8 }}>{opt.icon}</div>
                  <p style={{ fontWeight: 700, color: T1, fontSize: 15, marginBottom: 4 }}>{opt.label}</p>
                  <p style={{ color: T3, fontSize: 12, lineHeight: 1.45 }}>{opt.sub}</p>
                </button>
              );
            })}
          </div>
        </FormRow>

        {/* Date */}
        <FormRow label={svcType === 'weekly' ? '开始日期' : '服务日期'}>
          <button onClick={() => setShowCal(!showCal)}
            style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: BG_INPUT, border: `2px solid ${showCal ? ORANGE : 'transparent'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 0.15s' }}>
            <span style={{ color: selectedDate ? T1 : T3, fontSize: 15, fontWeight: selectedDate ? 500 : 400 }}>
              {selectedDate ? fmtDate(selectedDate) : '选择日期'}
            </span>
            <ChevronDown style={{ width: 18, height: 18, color: T3, transform: showCal ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {showCal && (
            <div style={{ background: BG_INPUT, borderRadius: 12, padding: '0 16px 12px', marginTop: 4 }}>
              <MiniCalendar month={calMonth} selected={selectedDate}
                onSelect={d => { setSelectedDate(d); setShowCal(false); }}
                onMonthChange={setCalMonth} />
            </div>
          )}
        </FormRow>

        {/* Location */}
        <FormRow label="遛狗地点">
          <button style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: BG_INPUT, border: '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPin style={{ width: 18, height: 18, color: ORANGE, flexShrink: 0 }} />
            <span style={{ color: T1, fontSize: 15, flex: 1, textAlign: 'left' }}>上海市徐汇区天钥桥路</span>
            <ChevronRight style={{ width: 18, height: 18, color: T3 }} />
          </button>
          <p style={{ fontSize: 12, color: T3, marginTop: 6, paddingLeft: 4 }}>点击修改位置</p>
        </FormRow>

        {/* Time of day (weekly only) */}
        {svcType === 'weekly' && (
          <FormRow label="每周遛狗时间">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['早晨 7-9点', '上午 9-12点', '下午 12-5点', '傍晚 5-8点'].map(t => (
                <button key={t}
                  style={{ padding: '8px 14px', borderRadius: 20, background: BG_INPUT, border: '1.5px solid #E0E0E0', fontSize: 13, color: T2, cursor: 'pointer', fontWeight: 500 }}>
                  {t}
                </button>
              ))}
            </div>
          </FormRow>
        )}
      </div>

      {/* ── Bottom CTA ──────────────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 20px 24px', background: 'white', borderTop: `1px solid ${DIVIDER}` }}>
        <button onClick={() => nav('/pet-info')} disabled={!canNext}
          style={{ width: '100%', padding: '16px', borderRadius: 12, background: canNext ? ORANGE : '#E0E0E0', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: canNext ? 'pointer' : 'not-allowed', transition: 'background 0.15s', boxShadow: canNext ? `0 4px 16px rgba(255,107,53,0.35)` : 'none' }}>
          下一步
        </button>
        {!canNext && <p style={{ textAlign: 'center', color: T3, fontSize: 12, marginTop: 8 }}>请先选择服务日期</p>}
      </div>
    </div>
  );
}
