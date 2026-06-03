import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, MapPin, Shield, ChevronRight, ChevronLeft, ArrowRight, Lock, Home, Users } from 'lucide-react';
import type { Walker } from '../types';

/* ── Data ──────────────────────────────────────────────────── */
const MOCK_WALKERS: Walker[] = [
  { id: '1', name: '张大伟', avatar: '🧑', rating: 4.9, reviewCount: 127, distance: 0.3, price: 45, verified: true,
    bio: '养犬8年，持有宠物护理资格证，熟悉各类犬种，性格温柔耐心，全程实时汇报。', tags: ['大型犬', '多犬同行', '急单接受'], completedWalks: 312 },
  { id: '2', name: '陈小燕', avatar: '👩', rating: 4.8, reviewCount: 89,  distance: 0.7, price: 40, verified: true,
    bio: '专业训犬师出身，擅长处理敏感犬只，细心负责，服务满意率 100%。', tags: ['小型犬', '老年犬', '药物喂食'], completedWalks: 198 },
  { id: '3', name: '李浩然', avatar: '🧔', rating: 4.7, reviewCount: 203, distance: 1.2, price: 38, verified: true,
    bio: '热爱动物，已完成 400+ 次服务，好评率持续 100%，每次都附路线报告。', tags: ['中型犬', '上门接送', '实时汇报'], completedWalks: 445 },
  { id: '4', name: '王婷婷', avatar: '👱‍♀️', rating: 4.6, reviewCount: 56,  distance: 1.8, price: 35, verified: false,
    bio: '大学生宠物爱好者，时间灵活，周末全天可接单，价格实惠。', tags: ['小型犬', '周末专场', '学生价'], completedWalks: 89 },
];

const FILTER_CHIPS = [
  { id: 'all', label: '全部' }, { id: 'nearby', label: '📍 附近 <1km' },
  { id: 'top', label: '⭐ 高评分' }, { id: 'verified', label: '✓ 已认证' },
];
const TIME_SLOTS = ['08:00', '10:00', '14:00', '17:00', '19:00'];
const PAY_METHODS = [
  { id: 'wechat', name: '微信支付',  sub: '余额 / 零钱',    bg: '#07C160', letter: '微' },
  { id: 'alipay', name: '支付宝',   sub: '余额 / 花呗',    bg: '#1677FF', letter: '支' },
  { id: 'card',   name: '银行卡',   sub: '储蓄卡 / 信用卡', bg: null,      letter: '💳' },
] as const;
type PayMethod = typeof PAY_METHODS[number]['id'];

const PAGE: React.CSSProperties = { background: '#F9F8F6', minHeight: '100vh', color: '#1C1917', paddingBottom: '4rem' };
const gc: React.CSSProperties = { background: '#FFFFFF', border: '1px solid #E8E5E0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };

/* ── Back button helper ─────────────────────────────────────── */
function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 mb-6 text-sm transition-colors"
      style={{ color: '#78716C', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      onMouseEnter={e => { e.currentTarget.style.color = '#1C1917'; }}
      onMouseLeave={e => { e.currentTarget.style.color = '#78716C'; }}>
      <ChevronLeft style={{ width: 16, height: 16 }} /> 返回
    </button>
  );
}

/* ── Main ───────────────────────────────────────────────────── */
export default function OwnerPage() {
  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState('all');
  const [selected,     setSelected]     = useState<Walker | null>(null);
  const [booked,       setBooked]       = useState(false);
  const [date,         setDate]         = useState('');
  const [time,         setTime]         = useState('');
  // Payment state
  const [payStep,      setPayStep]      = useState<null | 'confirm' | 'method' | 'processing'>(null);
  const [addInsurance, setAddInsurance] = useState(false);
  const [payMethod,    setPayMethod]    = useState<PayMethod | null>(null);
  const [handoff,      setHandoff]      = useState<'home' | 'meetup' | null>(null);
  const [meetupAddr,   setMeetupAddr]   = useState('');

  const total = (selected?.price ?? 0) + (addInsurance ? 3 : 0);

  /* Auto-advance from processing → booked */
  useEffect(() => {
    if (payStep !== 'processing') return;
    const t = setTimeout(() => { setBooked(true); setPayStep(null); }, 2200);
    return () => clearTimeout(t);
  }, [payStep]);

  /* Filter */
  let filtered = MOCK_WALKERS.filter(w => !search || w.name.includes(search) || w.tags.some(t => t.includes(search)));
  if (filter === 'nearby')   filtered = filtered.filter(w => w.distance < 1);
  if (filter === 'top')      filtered = filtered.filter(w => w.rating >= 4.8);
  if (filter === 'verified') filtered = filtered.filter(w => w.verified);

  const resetAll = () => { setSelected(null); setBooked(false); setDate(''); setTime(''); setPayStep(null); setAddInsurance(false); setPayMethod(null); setHandoff(null); setMeetupAddr(''); };

  /* ── SUCCESS ──────────────────────────────────────────────── */
  if (booked && selected) {
    return (
      <div style={{ ...PAGE, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(255,107,44,0.16) 0%, transparent 70%)' }} />
        {['🎉','🐾','✨','🌟','🎊'].map((e, i) => (
          <span key={i} className={`absolute select-none pointer-events-none text-4xl opacity-20 anim-float-${['a','b','c','a','b'][i]}`}
            style={{ top: `${[12,22,62,72,42][i]}%`, left: `${[8,78,6,73,43][i]}%`, animationDelay: `${i*0.55}s` }}>{e}</span>
        ))}
        <div className="relative z-10 w-full max-w-sm text-center">
          <div className="text-8xl mb-6 anim-float-c">🎉</div>
          <div className="rounded-3xl p-8 anim-fade-sc" style={{ ...gc, boxShadow: '0 32px 80px rgba(0,0,0,0.55)' }}>
            <h2 className="font-black text-gray-900 text-2xl mb-1">支付成功！</h2>
            <p className="text-sm mb-5" style={{ color: '#78716C' }}>
              已向 <span className="font-bold" style={{ color: '#FF9245' }}>{selected.name}</span> 发送遛狗请求
            </p>
            {/* Escrow notice */}
            <div className="rounded-2xl px-4 py-3 mb-4 flex items-center gap-3" style={{ background: 'rgba(255,107,44,0.08)', border: '1px solid rgba(255,107,44,0.18)' }}>
              <Lock style={{ width: 18, height: 18, color: '#FF9245', flexShrink: 0 }} />
              <div className="text-left">
                <p style={{ color: '#FF9245', fontWeight: 700, fontSize: 14 }}>¥{total} 费用托管中</p>
                <p style={{ color: '#78716C', fontSize: 11, marginTop: 2 }}>服务确认后自动打入遛狗师账户</p>
              </div>
            </div>
            {addInsurance && (
              <div className="rounded-2xl px-4 py-3 mb-4 flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>🛡</span>
                <div className="text-left">
                  <p style={{ color: '#4ade80', fontWeight: 700, fontSize: 13 }}>宠物意外险已激活</p>
                  <p style={{ color: '#78716C', fontSize: 11, marginTop: 2 }}>保额 ¥5万 · 本次服务全程有效</p>
                </div>
              </div>
            )}
            <div className="rounded-2xl p-4 mb-5 text-left space-y-2" style={{ background: '#F9F8F6', border: '1px solid #E8E5E0' }}>
              {[
                { k: '遛狗师', v: selected.name },
                { k: '服务时间', v: `${date}  ${time}` },
                { k: '交接方式', v: handoff === 'home' ? '🏠 上门接狗' : handoff === 'meetup' ? `📍 ${meetupAddr || '约定地点见面'}` : '—' },
                { k: '支付方式', v: payMethod === 'wechat' ? '微信支付' : payMethod === 'alipay' ? '支付宝' : '银行卡' },
              ].map(row => (
                <div key={row.k} className="flex justify-between text-sm">
                  <span style={{ color: '#78716C' }}>{row.k}</span>
                  <span className="text-gray-900 font-medium">{row.v}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ color: '#78716C' }}>实付金额</span>
                <span className="font-black text-xl" style={{ background: 'linear-gradient(135deg,#FF6B2C,#FFD166)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>¥{total}</span>
              </div>
            </div>
            <Link to="/tracking" className="btn-glow w-full text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 mb-3">
              查看实时 GPS 追踪 <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <button onClick={resetAll} className="text-sm transition-colors" style={{ color: '#9B9B9B', background: 'none', border: 'none', cursor: 'pointer' }} onMouseEnter={e=>{e.currentTarget.style.color='#4A4A4A'}} onMouseLeave={e=>{e.currentTarget.style.color='#9B9B9B'}}>
              返回遛狗师列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── PAY PROCESSING ───────────────────────────────────────── */
  if (payStep === 'processing') {
    return (
      <div style={{ ...PAGE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-center max-w-xs w-full px-6 anim-fade-sc">
          <div className="text-6xl mb-6">💳</div>
          <h2 className="font-black text-gray-900 text-xl mb-2">支付处理中…</h2>
          <p className="text-sm mb-8" style={{ color: '#78716C' }}>安全加密 · Puppy Paw 托管系统</p>
          {/* Progress bar */}
          <div className="h-2 rounded-full mb-3" style={{ background: '#E8E5E0' }}>
            <div className="h-full rounded-full pay-bar" style={{ background: 'linear-gradient(90deg,#FF6B2C,#FF9245,#FFD166)' }} />
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {payMethod === 'wechat' ? '微信支付' : payMethod === 'alipay' ? '支付宝' : '银行卡'} · ¥{total}
          </p>
        </div>
      </div>
    );
  }

  /* ── PAY METHOD ───────────────────────────────────────────── */
  if (selected && payStep === 'method') {
    return (
      <div style={PAGE}>
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
          <BackBtn onClick={() => setPayStep('confirm')} />
          <h1 className="font-black text-gray-900 text-2xl mb-1">选择支付方式</h1>
          <p className="text-sm mb-8" style={{ color: '#78716C' }}>
            请选择本次下单的支付渠道
          </p>
          {/* Amount */}
          <div className="text-center mb-8">
            <p className="text-sm mb-1" style={{ color: '#78716C' }}>实付金额</p>
            <span className="font-black" style={{ fontSize: 52, background: 'linear-gradient(135deg,#FF6B2C,#FFD166)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
              ¥{total}
            </span>
          </div>
          {/* Method cards */}
          <div className="space-y-3 mb-6">
            {PAY_METHODS.map(m => (
              <button key={m.id} onClick={() => { setPayMethod(m.id); setPayStep('processing'); }}
                className="w-full rounded-2xl p-5 text-left transition-all"
                style={{ ...gc, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,107,44,0.35)'; e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'none'; }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0"
                    style={{ background: m.bg ?? 'rgba(255,255,255,0.1)', color: m.bg ? 'white' : undefined, fontSize: m.bg ? 18 : 26 }}>
                    {m.letter}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{m.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#78716C' }}>{m.sub}</p>
                  </div>
                  <ChevronRight className="ml-auto flex-shrink-0" style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.2)' }} />
                </div>
              </button>
            ))}
          </div>
          <p className="text-center text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            🔒 支付完成后费用进入 Puppy Paw 托管账户，服务结束确认后打款
          </p>
        </div>
      </div>
    );
  }

  /* ── PAY CONFIRM ──────────────────────────────────────────── */
  if (selected && payStep === 'confirm') {
    return (
      <div style={PAGE}>
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-10">
          <BackBtn onClick={() => setPayStep(null)} />
          <h1 className="font-black text-gray-900 text-2xl mb-1">确认订单</h1>
          <p className="text-sm mb-6" style={{ color: '#78716C' }}>请核对以下信息</p>

          {/* Order summary */}
          <div className="rounded-3xl p-6 mb-4" style={{ ...gc }}>
            <div className="flex items-center gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', boxShadow: '0 6px 18px rgba(255,107,44,0.35)' }}>
                {selected.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-black text-gray-900 text-lg">{selected.name}</span>
                  {selected.verified && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(34,197,94,0.14)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.22)' }}>✓ 认证</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: '#78716C' }}>
                  <Star style={{ width: 11, height: 11, fill: '#FBBF24', color: '#FBBF24' }} />
                  <span style={{ color: '#FBBF24', fontWeight: 700 }}>{selected.rating}</span>
                  <span>· {date}</span>
                  <span>·</span>
                  <span>{time}</span>
                </div>
              </div>
            </div>
            {/* Handoff info row */}
            {handoff && (
              <div className="flex items-center gap-3 mb-4 px-1 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontSize: 18 }}>{handoff === 'home' ? '🏠' : '📍'}</span>
                <div>
                  <p style={{ color: '#78716C', fontSize: 12 }}>交接方式</p>
                  <p style={{ color: '#1C1917', fontWeight: 700, fontSize: 13, marginTop: 2 }}>
                    {handoff === 'home' ? '上门接狗' : `约定地点：${meetupAddr || '待填写集合点'}`}
                  </p>
                </div>
              </div>
            )}
            {/* Line items */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span style={{ color: '#78716C' }}>遛狗服务 × 1（约1小时）</span>
                <span className="text-gray-900 font-semibold">¥{selected.price}</span>
              </div>
              {addInsurance && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#78716C' }}>🛡 宠物意外险 × 1</span>
                  <span style={{ color: '#4ade80', fontWeight: 600 }}>¥3</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <span style={{ color: '#78716C', fontWeight: 600 }}>合计</span>
                <span className="font-black text-2xl" style={{ background: 'linear-gradient(135deg,#FF6B2C,#FFD166)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>¥{total}</span>
              </div>
            </div>
          </div>

          {/* Insurance toggle */}
          <div className="rounded-3xl p-5 mb-4" style={{ ...gc, ...(addInsurance ? { borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.05)' } : {}) }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span style={{ fontSize: 20 }}>🛡</span>
                  <span className="font-bold text-gray-900 text-sm">宠物意外险</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,107,44,0.15)', color: '#FF9245' }}>推荐</span>
                </div>
                <p className="text-xs mb-3" style={{ color: '#78716C', lineHeight: 1.6 }}>
                  意外医疗赔付最高 ¥50,000 · 死亡赔付 ¥10,000
                </p>
                {addInsurance && (
                  <div className="space-y-1.5 text-xs" style={{ color: '#78716C', animation: 'fadeInUp 0.3s ease both' }}>
                    {['✓ 意外医疗费用最高 ¥50,000', '✓ 宠物死亡赔付 ¥10,000', '✓ 7×24h 紧急救援服务', '✓ 理赔到账最快 2 小时'].map(item => (
                      <p key={item} style={{ color: item.startsWith('✓') ? '#4ade80' : undefined }}>{item}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="font-black text-base" style={{ color: '#4ade80' }}>¥3/次</span>
                {/* Toggle */}
                <button onClick={() => setAddInsurance(!addInsurance)}
                  className="relative transition-all duration-300"
                  style={{ width: 44, height: 24, borderRadius: 12, background: addInsurance ? 'linear-gradient(135deg,#22c55e,#4ade80)' : 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', boxShadow: addInsurance ? '0 3px 12px rgba(34,197,94,0.4)' : 'none' }}>
                  <span className="absolute top-1 bg-white rounded-full shadow-md transition-all duration-300"
                    style={{ width: 16, height: 16, left: addInsurance ? 24 : 4 }} />
                </button>
              </div>
            </div>
          </div>

          {/* Escrow notice */}
          <div className="rounded-2xl px-4 py-3 mb-6 flex items-center gap-3" style={{ background: 'rgba(255,107,44,0.08)', border: '1px solid rgba(255,107,44,0.16)' }}>
            <Lock style={{ width: 16, height: 16, color: '#FF9245', flexShrink: 0 }} />
            <p className="text-xs" style={{ color: '#78716C', lineHeight: 1.6 }}>
              支付后费用由 Puppy Paw 托管，服务确认后 <span style={{ color: '#FF9245', fontWeight: 600 }}>T+1</span> 打入遛狗师账户
            </p>
          </div>

          <button onClick={() => setPayStep('method')} className="btn-glow w-full text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2">
            前往支付 ¥{total}
            <ArrowRight style={{ width: 18, height: 18 }} />
          </button>
        </div>
      </div>
    );
  }

  /* ── DETAIL + BOOKING ─────────────────────────────────────── */
  if (selected) {
    return (
      <div style={PAGE}>
        <div className="max-w-2xl mx-auto px-4 pt-6">
          <BackBtn onClick={() => setSelected(null)} />
          {/* Profile hero */}
          <div className="rounded-3xl p-6 mb-4 anim-fade-sc" style={{ ...gc, boxShadow: '0 24px 64px rgba(0,0,0,0.45)' }}>
            <div className="flex items-start gap-5">
              <div className="rounded-3xl flex items-center justify-center text-4xl flex-shrink-0"
                style={{ width: 80, height: 80, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', boxShadow: '0 10px 28px rgba(255,107,44,0.42)' }}>
                {selected.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h2 className="font-black text-gray-900 text-xl leading-none">{selected.name}</h2>
                  {selected.verified && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(34,197,94,0.14)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.22)' }}>
                      <Shield style={{ width: 10, height: 10 }} /> 已认证
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-3" style={{ color: '#78716C', fontSize: 13 }}>
                  <span className="flex items-center gap-1"><Star style={{ width: 13, height: 13, fill: '#FBBF24', color: '#FBBF24' }} /><span style={{ color: '#FBBF24', fontWeight: 700 }}>{selected.rating}</span>({selected.reviewCount})</span>
                  <span className="flex items-center gap-1"><MapPin style={{ width: 11, height: 11 }} />{selected.distance}km</span>
                  <span>🐾 {selected.completedWalks}次完成</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.48)', fontSize: 13, lineHeight: 1.65 }}>{selected.bio}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {selected.tags.map(t => (
                <span key={t} className="text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ background: 'rgba(255,107,44,0.12)', color: '#FF9245', border: '1px solid rgba(255,107,44,0.2)' }}>{t}</span>
              ))}
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[{ icon: '⭐', val: selected.rating, sub: '综合评分' }, { icon: '🐾', val: `${selected.completedWalks}次`, sub: '完成订单' }, { icon: '📍', val: `${selected.distance}km`, sub: '距离您' }].map(s => (
              <div key={s.sub} className="rounded-2xl py-4 text-center" style={gc}>
                <div className="text-xl mb-1.5 leading-none">{s.icon}</div>
                <div className="font-black text-gray-900 text-base leading-none">{s.val}</div>
                <div className="text-xs mt-1.5" style={{ color: '#A8A29E' }}>{s.sub}</div>
              </div>
            ))}
          </div>
          {/* Booking form */}
          <div className="rounded-3xl p-6" style={{ ...gc, boxShadow: '0 24px 64px rgba(0,0,0,0.45)' }}>
            <h3 className="font-bold text-gray-900 text-base mb-5">选择服务时间</h3>
            <div className="mb-5">
              <label className="block text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: '#78716C' }}>日期</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
                style={{ background: '#F5F4F2', border: '1px solid #E0E0E0', color: '#1A1A1A' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(255,107,44,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,44,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = '#E0E0E0'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <div className="mb-6">
              <label className="block text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: '#78716C' }}>时间段</label>
              <div className="grid grid-cols-5 gap-2">
                {TIME_SLOTS.map(t => (
                  <button key={t} onClick={() => setTime(t)} className="py-3 rounded-xl text-xs font-bold transition-all"
                    style={time === t ? { background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', color: '#1C1917', border: 'none', boxShadow: '0 4px 16px rgba(255,107,44,0.42)' } : { background: '#F9F8F6', color: '#78716C', border: '1px solid #E8E5E0' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Handoff method */}
            <div className="mb-6">
              <label className="block text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: '#78716C' }}>交接方式</label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { id: 'home',   icon: <Home  style={{ width: 18, height: 18 }} />, title: '上门接狗', sub: '遛狗师到您家门口' },
                  { id: 'meetup', icon: <Users style={{ width: 18, height: 18 }} />, title: '约定地点见面', sub: '双方在集合点交接' },
                ] as const).map(opt => {
                  const active = handoff === opt.id;
                  return (
                    <button key={opt.id} onClick={() => setHandoff(opt.id)}
                      style={{
                        padding: '14px 14px', borderRadius: 16, border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                        background: active ? '#FFF4EF' : '#F5F4F2',
                        outline: active ? '1.5px solid rgba(255,107,44,0.55)' : '1px solid #E0E0E0',
                        boxShadow: active ? '0 4px 12px rgba(255,107,44,0.15)' : 'none',
                      }}>
                      <div style={{ color: active ? '#FF6B2C' : '#9B9B9B', marginBottom: 6 }}>{opt.icon}</div>
                      <p style={{ color: active ? '#FF6B2C' : '#4A4A4A', fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{opt.title}</p>
                      <p style={{ color: '#9B9B9B', fontSize: 11 }}>{opt.sub}</p>
                    </button>
                  );
                })}
              </div>
              {handoff === 'meetup' && (
                <div className="mt-3" style={{ animation: 'fadeInUp 0.25s ease both' }}>
                  <div className="relative">
                    <MapPin style={{ width: 14, height: 14, position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#FF9245' }} />
                    <input
                      value={meetupAddr}
                      onChange={e => setMeetupAddr(e.target.value)}
                      placeholder="输入集合地点，如：小区南门、中山公园正门…"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: '#F5F4F2', border: '1px solid rgba(255,107,44,0.3)',
                        borderRadius: 12, padding: '11px 14px 11px 36px',
                        color: '#1C1917', fontSize: 13, outline: 'none',
                      }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(255,107,44,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,44,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(255,107,44,0.3)'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-5" style={{ borderTop: '1px solid #E8E5E0' }}>
              <div className="leading-none">
                <span className="font-black text-3xl" style={{ background: 'linear-gradient(135deg,#FF6B2C,#FFD166)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>¥{selected.price}</span>
                <span className="text-xs ml-1.5" style={{ color: '#A8A29E' }}>/次·约1小时</span>
              </div>
              <button onClick={() => { if (date && time && handoff) setPayStep('confirm'); }}
                disabled={!date || !time || !handoff}
                className="btn-glow text-white px-7 py-3.5 rounded-2xl font-bold text-sm"
                style={{ opacity: (!date || !time || !handoff) ? 0.38 : 1, cursor: (!date || !time || !handoff) ? 'not-allowed' : 'pointer' }}>
                确认预约
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── LIST ─────────────────────────────────────────────────── */
  return (
    <div style={PAGE}>
      <div className="max-w-3xl mx-auto">
        <div className="px-5 pt-7 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-black text-gray-900 text-2xl tracking-tight">附近遛狗师</h1>
            <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
              {filtered.length} 人在线
            </span>
          </div>
          <p className="text-sm flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.32)' }}>
            <MapPin style={{ width: 12, height: 12 }} /> 上海市徐汇区
          </p>
        </div>
        <div className="px-5 mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2" style={{ width: 16, height: 16, color: '#A8A29E' }} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索遛狗师或服务标签…"
              className="w-full rounded-2xl pl-11 pr-5 py-3.5 text-sm outline-none transition-all"
              style={{ color: '#1A1A1A', background: '#F5F4F2', border: '1px solid #E8E5E0', caretColor: '#FF9245' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(255,107,44,0.5)'; e.target.style.background = '#FFFFFF'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,44,0.08)'; }}
              onBlur={e => { e.target.style.borderColor = '#E0E0E0'; e.target.style.background = '#F5F4F2'; e.target.style.boxShadow = 'none'; }} />
          </div>
        </div>
        <div className="px-5 mb-5 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {FILTER_CHIPS.map(fc => (
            <button key={fc.id} onClick={() => setFilter(fc.id)}
              className="flex-shrink-0 text-xs px-4 py-2 rounded-full font-semibold transition-all"
              style={filter === fc.id ? { background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', color: '#1C1917', border: 'none', boxShadow: '0 4px 14px rgba(255,107,44,0.35)' } : { background: '#F9F8F6', color: 'rgba(255,255,255,0.42)', border: '1px solid #E8E5E0' }}>
              {fc.label}
            </button>
          ))}
        </div>
        <div className="px-5 space-y-3">
          {filtered.map((w, i) => (
            <button key={w.id} onClick={() => setSelected(w)}
              className="w-full rounded-3xl p-5 text-left anim-fade-up"
              style={{ ...gc, animationDelay: `${i * 0.07}s` }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,0.09)'; el.style.borderColor = 'rgba(255,107,44,0.28)'; el.style.transform = 'translateY(-5px)'; el.style.boxShadow = '0 20px 56px rgba(0,0,0,0.45)'; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,0.05)'; el.style.borderColor = 'rgba(255,255,255,0.09)'; el.style.transform = 'translateY(0)'; el.style.boxShadow = 'none'; }}>
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="rounded-2xl flex items-center justify-center text-3xl" style={{ width: 58, height: 58, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', boxShadow: '0 6px 20px rgba(255,107,44,0.35)' }}>{w.avatar}</div>
                  {w.rating >= 4.9 && <div className="absolute -top-1.5 -right-1.5 text-xs px-1.5 py-0.5 rounded-full font-black leading-none" style={{ background: 'linear-gradient(135deg,#FFD166,#FF9245)', color: '#3A1000', fontSize: 9 }}>TOP</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-gray-900">{w.name}</span>
                      {w.verified && <span className="text-xs px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(34,197,94,0.14)', color: '#4ade80', fontSize: 10 }}>✓</span>}
                    </div>
                    <span className="font-black text-base" style={{ background: 'linear-gradient(135deg,#FF9245,#FFD166)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>¥{w.price}<span style={{ fontSize: 11, WebkitTextFillColor: 'rgba(255,255,255,0.28)', fontWeight: 400 }}>/次</span></span>
                  </div>
                  <div className="flex items-center gap-3 mb-2.5" style={{ color: '#78716C', fontSize: 12 }}>
                    <span className="flex items-center gap-0.5"><Star style={{ width: 11, height: 11, fill: '#FBBF24', color: '#FBBF24' }} /><span style={{ color: '#FBBF24', fontWeight: 700 }}>{w.rating}</span>({w.reviewCount})</span>
                    <span className="flex items-center gap-0.5"><MapPin style={{ width: 10, height: 10 }} />{w.distance}km</span>
                    <span>{w.completedWalks}次完成</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {w.tags.map(t => <span key={t} className="text-xs px-2.5 py-0.5 rounded-full" style={{ background: 'rgba(255,107,44,0.1)', color: '#FF9245', border: '1px solid rgba(255,107,44,0.18)' }}>{t}</span>)}
                  </div>
                </div>
                <ChevronRight style={{ width: 18, height: 18, color: 'rgba(255,255,255,0.18)', flexShrink: 0 }} />
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-3xl py-16 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.07)' }}>
              <div className="text-5xl mb-4 opacity-40">🐾</div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.22)' }}>没有找到符合条件的遛狗师</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
