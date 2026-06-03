import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, ChevronDown, Zap, Calendar } from 'lucide-react';

const ORANGE   = '#FF6B35';
const T1       = '#1A1A1A';
const T2       = '#4A4A4A';
const T3       = '#9B9B9B';
const BG_INPUT = '#F8F8F8';
const DIVIDER  = '#F0F0F0';

const MONTH_ZH = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
const DOW_ZH   = ['日','一','二','三','四','五','六'];

function MiniCalendar({ month, selected, onSelect, onMonthChange }: {
  month: Date; selected: Date | null;
  onSelect: (d: Date) => void;
  onMonthChange: (d: Date) => void;
}) {
  const yr = month.getFullYear(), mo = month.getMonth();
  const dim = new Date(yr, mo + 1, 0).getDate();
  const fd  = new Date(yr, mo, 1).getDay();
  const today = new Date(); today.setHours(0,0,0,0);
  const cells: (number | null)[] = [...Array(fd).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  return (
    <div style={{ padding: '12px 4px 4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button onClick={() => onMonthChange(new Date(yr, mo - 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 8, color: T2 }}><ChevronLeft style={{ width: 18, height: 18 }} /></button>
        <span style={{ fontWeight: 700, fontSize: 15, color: T1 }}>{MONTH_ZH[mo]} {yr}</span>
        <button onClick={() => onMonthChange(new Date(yr, mo + 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', borderRadius: 8, color: T2 }}><ChevronRight style={{ width: 18, height: 18 }} /></button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', textAlign: 'center', marginBottom: 6 }}>
        {DOW_ZH.map(d => <div key={d} style={{ fontSize: 11, color: T3, fontWeight: 500, padding: '2px 0' }}>{d}</div>)}
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
              style={{ border: 'none', cursor: isPast ? 'not-allowed' : 'pointer', borderRadius: '50%', fontSize: 14, padding: '7px 2px', fontWeight: isSel || isToday ? 700 : 400, background: isSel ? ORANGE : 'transparent', color: isSel ? 'white' : isPast ? '#D8D8D8' : isToday ? ORANGE : T1, transition: 'all 0.12s' }}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Steps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {[1, 2, 3].map(n => (
        <div key={n} style={{ height: 3, borderRadius: 3, width: n === current ? 24 : 16, background: n <= current ? ORANGE : '#E0E0E0', transition: 'all 0.2s' }} />
      ))}
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: T2, marginBottom: 8, letterSpacing: 0.2 }}>{label}</p>
      {children}
    </div>
  );
}

type SvcKind = 'walk' | 'boarding' | 'grooming' | 'feeding';
type Urgency = 'instant' | 'scheduled';

const SVC_TYPES: { id: SvcKind; emoji: string; label: string; sub: string; basePrice: string }[] = [
  { id: 'walk',     emoji: '🐾', label: '遛狗',     sub: '专业遛狗师上门',     basePrice: '¥38起/次' },
  { id: 'boarding', emoji: '🏠', label: '寄养',     sub: '温馨家庭环境寄住',   basePrice: '¥120起/天' },
  { id: 'grooming', emoji: '🛁', label: '洗护',     sub: '洗澡·剪毛·美容',    basePrice: '¥80起/次' },
  { id: 'feeding',  emoji: '🍖', label: '上门喂食', sub: '主人外出时上门照料', basePrice: '¥30起/次' },
];

const SVC_OPTIONS: Record<SvcKind, { id: string; label: string }[]> = {
  walk:     [{ id: '30', label: '30 分钟' }, { id: '60', label: '60 分钟' }, { id: '90', label: '90 分钟' }],
  boarding: [{ id: '1', label: '1 天' }, { id: '3', label: '2-3 天' }, { id: '7', label: '一周+' }],
  grooming: [{ id: 'home', label: '上门洗护' }, { id: 'store', label: '到店洗护' }],
  feeding:  [{ id: '1x', label: '每天 1 次' }, { id: '2x', label: '每天 2 次' }, { id: '3x', label: '每天 3 次' }],
};

const SVC_OPTION_LABELS: Record<SvcKind, string> = {
  walk: '服务时长', boarding: '寄养天数', grooming: '服务方式', feeding: '喂食频次',
};

export default function BookingPage() {
  const nav = useNavigate();
  const [svcKind,      setSvcKind]      = useState<SvcKind>('walk');
  const [svcOption,    setSvcOption]    = useState<string>('60');
  const [urgency,      setUrgency]      = useState<Urgency>('scheduled');
  const [showCal,      setShowCal]      = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calMonth,     setCalMonth]     = useState(new Date());

  const fmtDate = (d: Date) => d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
  const canNext = urgency === 'instant' || selectedDate !== null;

  /* Reset option when service type changes */
  const handleSvcKind = (k: SvcKind) => {
    setSvcKind(k);
    setSvcOption(SVC_OPTIONS[k][0].id);
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${DIVIDER}` }}>
        <button onClick={() => nav('/')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: T2, fontSize: 15, fontWeight: 500, padding: 0 }}>
          <ChevronLeft style={{ width: 19, height: 19 }} /> 返回
        </button>
        <Steps current={1} />
        <button onClick={() => nav('/walkers')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, fontSize: 14, fontWeight: 500, padding: 0 }}>跳过</button>
      </div>

      <div style={{ padding: '28px 20px 120px', maxWidth: 480, margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: T1, marginBottom: 4, letterSpacing: -0.5 }}>预约服务</h1>
        <p style={{ color: T3, fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>选择服务类型和时间，为您匹配最合适的服务师</p>

        {/* ── Service type 2×2 ── */}
        <FormRow label="服务类型">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {SVC_TYPES.map(svc => {
              const active = svcKind === svc.id;
              return (
                <button key={svc.id} onClick={() => handleSvcKind(svc.id)}
                  style={{ padding: '16px 14px', borderRadius: 14, textAlign: 'left', cursor: 'pointer', background: active ? '#FFF3EE' : BG_INPUT, border: `2px solid ${active ? ORANGE : 'transparent'}`, transition: 'all 0.15s' }}>
                  <div style={{ fontSize: 26, marginBottom: 8, lineHeight: 1 }}>{svc.emoji}</div>
                  <p style={{ fontWeight: 700, color: T1, fontSize: 14, marginBottom: 2 }}>{svc.label}</p>
                  <p style={{ color: T3, fontSize: 11, lineHeight: 1.4, marginBottom: 6 }}>{svc.sub}</p>
                  <p style={{ fontWeight: 700, color: active ? ORANGE : T3, fontSize: 12 }}>{svc.basePrice}</p>
                </button>
              );
            })}
          </div>
        </FormRow>

        {/* ── Service option chips ── */}
        <FormRow label={SVC_OPTION_LABELS[svcKind]}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SVC_OPTIONS[svcKind].map(opt => {
              const active = svcOption === opt.id;
              return (
                <button key={opt.id} onClick={() => setSvcOption(opt.id)}
                  style={{ padding: '9px 18px', borderRadius: 22, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `2px solid ${active ? ORANGE : '#E8E5E0'}`, background: active ? '#FFF3EE' : 'white', color: active ? ORANGE : T2, transition: 'all 0.12s' }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </FormRow>

        {/* ── Urgency ── */}
        <FormRow label="服务时间">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {([
              { id: 'instant'   as Urgency, icon: <Zap style={{ width: 18, height: 18 }} />, label: '立即需要', sub: '30分钟内上门服务' },
              { id: 'scheduled' as Urgency, icon: <Calendar style={{ width: 18, height: 18 }} />, label: '预约时间', sub: '选择具体日期时间' },
            ]).map(opt => {
              const active = urgency === opt.id;
              return (
                <button key={opt.id} onClick={() => setUrgency(opt.id)}
                  style={{ padding: '14px 12px', borderRadius: 12, textAlign: 'left', cursor: 'pointer', background: active ? '#FFF3EE' : BG_INPUT, border: `2px solid ${active ? ORANGE : 'transparent'}`, transition: 'all 0.15s' }}>
                  <div style={{ color: active ? ORANGE : T3, marginBottom: 6 }}>{opt.icon}</div>
                  <p style={{ fontWeight: 700, color: T1, fontSize: 14, marginBottom: 3 }}>{opt.label}</p>
                  <p style={{ color: T3, fontSize: 11, lineHeight: 1.4 }}>{opt.sub}</p>
                </button>
              );
            })}
          </div>
        </FormRow>

        {/* ── Instant hint ── */}
        {urgency === 'instant' && (
          <div style={{ padding: '12px 16px', borderRadius: 12, background: '#FFF4EF', border: '1px solid rgba(255,107,44,0.25)', marginTop: -10, marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Zap style={{ width: 16, height: 16, color: ORANGE, flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: ORANGE, fontWeight: 600, lineHeight: 1.5 }}>预计 <strong>15-30 分钟</strong>内为您匹配到附近遛狗师，请保持手机畅通</p>
          </div>
        )}

        {/* ── Date picker (scheduled only) ── */}
        {urgency === 'scheduled' && (
          <FormRow label="服务日期">
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
        )}

        {/* ── Location ── */}
        <FormRow label="服务地点">
          <button style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: BG_INPUT, border: '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPin style={{ width: 18, height: 18, color: ORANGE, flexShrink: 0 }} />
            <span style={{ color: T1, fontSize: 15, flex: 1, textAlign: 'left' }}>上海市徐汇区天钥桥路</span>
            <ChevronRight style={{ width: 18, height: 18, color: T3 }} />
          </button>
          <p style={{ fontSize: 12, color: T3, marginTop: 6, paddingLeft: 4 }}>点击修改位置</p>
        </FormRow>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 20px 28px', background: 'white', borderTop: `1px solid ${DIVIDER}` }}>
        <button onClick={() => nav('/pet-info')} disabled={!canNext}
          style={{ width: '100%', padding: '16px', borderRadius: 12, background: canNext ? ORANGE : '#E0E0E0', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: canNext ? 'pointer' : 'not-allowed', transition: 'background 0.15s', boxShadow: canNext ? `0 4px 16px rgba(255,107,53,0.35)` : 'none' }}>
          {urgency === 'instant' ? '立即发单，匹配服务师 →' : '下一步'}
        </button>
        {urgency === 'scheduled' && !canNext && (
          <p style={{ textAlign: 'center', color: T3, fontSize: 12, marginTop: 8 }}>请先选择服务日期</p>
        )}
      </div>
    </div>
  );
}
