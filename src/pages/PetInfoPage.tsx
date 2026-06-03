import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search } from 'lucide-react';

/* ── Design tokens ───────────────────────────────────────────── */
const ORANGE   = '#FF6B35';
const T1       = '#1A1A1A';
const T2       = '#4A4A4A';
const T3       = '#9B9B9B';
const BG_INPUT = '#F8F8F8';
const DIVIDER  = '#F0F0F0';

/* ── Step indicator ──────────────────────────────────────────── */
function Steps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {[1, 2, 3].map(n => (
        <div key={n} style={{ height: 3, borderRadius: 3, width: n === current ? 24 : 16, background: n <= current ? ORANGE : '#E0E0E0', transition: 'all 0.2s' }} />
      ))}
    </div>
  );
}

/* ── Capsule selector ────────────────────────────────────────── */
function CapsuleGroup<T extends string>({ options, value, onChange }: {
  options: { id: T; label: string; sub?: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = value === opt.id;
        return (
          <button key={opt.id} onClick={() => onChange(opt.id)}
            style={{
              padding: opt.sub ? '10px 18px' : '10px 20px',
              borderRadius: 100, border: `2px solid ${active ? ORANGE : '#E0E0E0'}`,
              background: active ? '#FFF3EE' : 'white',
              cursor: 'pointer', transition: 'all 0.15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: active ? ORANGE : T2 }}>{opt.label}</span>
            {opt.sub && <span style={{ fontSize: 11, color: active ? ORANGE : T3, marginTop: 1 }}>{opt.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ── Section wrapper ─────────────────────────────────────────── */
function Section({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 16, fontWeight: 700, color: T1, marginBottom: sub ? 4 : 10 }}>{title}</p>
      {sub && <p style={{ fontSize: 13, color: T3, marginBottom: 12 }}>{sub}</p>}
      {children}
    </div>
  );
}

type Weight = 'small' | 'medium' | 'large';
type Age    = 'puppy' | 'adult' | 'senior';

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function PetInfoPage() {
  const nav = useNavigate();
  const [weight, setWeight] = useState<Weight | null>(null);
  const [age,    setAge]    = useState<Age | null>(null);
  const [notes,  setNotes]  = useState('');
  const [focN,   setFocN]   = useState(false);

  const canSearch = weight !== null && age !== null;

  const WEIGHT_OPTS: { id: Weight; label: string; sub: string }[] = [
    { id: 'small',  label: '0–15 斤',  sub: '小型犬' },
    { id: 'medium', label: '15–40 斤', sub: '中型犬' },
    { id: 'large',  label: '40 斤以上', sub: '大型犬' },
  ];

  const AGE_OPTS: { id: Age; label: string; sub: string }[] = [
    { id: 'puppy',  label: '幼犬',  sub: '0–2 岁' },
    { id: 'adult',  label: '成年犬', sub: '2–8 岁' },
    { id: 'senior', label: '老年犬', sub: '8 岁以上' },
  ];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Nav ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${DIVIDER}` }}>
        <button onClick={() => nav('/booking')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: T2, fontSize: 15, fontWeight: 500, padding: 0 }}>
          <ChevronLeft style={{ width: 19, height: 19 }} /> 返回
        </button>
        <Steps current={2} />
        <button onClick={() => nav('/walkers')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: T3, fontSize: 14, fontWeight: 500, padding: 0 }}>
          跳过
        </button>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div style={{ padding: '28px 20px 100px', maxWidth: 480, margin: '0 auto' }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: T1, marginBottom: 6, letterSpacing: -0.5 }}>宠物信息</h1>
        <p style={{ color: T3, fontSize: 15, marginBottom: 32, lineHeight: 1.5 }}>告诉我们您的狗狗情况，帮助我们匹配最合适的遛狗师</p>

        {/* Weight */}
        <Section title="体重范围" sub="遛狗师会根据犬只体型调整服务方案">
          <CapsuleGroup options={WEIGHT_OPTS} value={weight} onChange={setWeight} />
        </Section>

        {/* Divider */}
        <div style={{ height: 1, background: DIVIDER, marginBottom: 28 }} />

        {/* Age */}
        <Section title="年龄段" sub="不同年龄段的狗狗需要不同的运动强度">
          <CapsuleGroup options={AGE_OPTS} value={age} onChange={setAge} />
        </Section>

        {/* Divider */}
        <div style={{ height: 1, background: DIVIDER, marginBottom: 28 }} />

        {/* Special notes */}
        <Section title="特殊注意事项" sub="选填 · 遛狗师会提前了解您的需求">
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="例如：需要戴口套、不能跑太快、有药物需要喂食…"
            rows={3}
            onFocus={() => setFocN(true)} onBlur={() => setFocN(false)}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '14px 16px',
              borderRadius: 12, border: `2px solid ${focN ? ORANGE : 'transparent'}`,
              background: BG_INPUT, fontSize: 14, color: T1, lineHeight: 1.6,
              resize: 'none', outline: 'none', fontFamily: 'inherit',
              transition: 'border-color 0.15s',
            }} />
        </Section>

        {/* Info box */}
        <div style={{ background: '#FFF3EE', borderRadius: 12, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>🔒</span>
          <div>
            <p style={{ fontWeight: 600, color: T1, fontSize: 14, marginBottom: 3 }}>安全有保障</p>
            <p style={{ color: T2, fontSize: 13, lineHeight: 1.6 }}>所有遛狗师均通过实名认证与背景调查，宠物意外险全程覆盖。</p>
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ──────────────────────────────────── */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 20px 24px', background: 'white', borderTop: `1px solid ${DIVIDER}` }}>
        <button onClick={() => nav('/walkers')} disabled={!canSearch}
          style={{ width: '100%', padding: '16px', borderRadius: 12, background: canSearch ? ORANGE : '#E0E0E0', color: 'white', fontWeight: 700, fontSize: 16, border: 'none', cursor: canSearch ? 'pointer' : 'not-allowed', transition: 'background 0.15s', boxShadow: canSearch ? '0 4px 16px rgba(255,107,53,0.35)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Search style={{ width: 18, height: 18 }} />
          搜索遛狗师
        </button>
        {!canSearch && <p style={{ textAlign: 'center', color: T3, fontSize: 12, marginTop: 8 }}>请选择体重和年龄段</p>}
      </div>
    </div>
  );
}
