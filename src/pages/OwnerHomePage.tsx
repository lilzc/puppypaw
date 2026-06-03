import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus, Star, ChevronRight, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BottomTabBar from '../components/BottomTabBar';

const BG   = '#F8F7F4';
const OG   = '#FF6B35';
const PU   = '#8B7FD4';
const T1   = '#1A1A1A';
const T2   = '#5A5A5A';
const T3   = '#A8A29E';

const SERVICES = [
  { emoji: '🐾', label: '遛狗',     sub: '30-90分钟', color: '#FF6B35', bg: '#FFF0EA', to: '/booking' },
  { emoji: '🏠', label: '寄养',     sub: '按天计费',  color: '#8B7FD4', bg: '#F0EEFF', to: '/booking' },
  { emoji: '🛁', label: '洗护',     sub: '上门/到店', color: '#06B6D4', bg: '#ECFEFF', to: '/booking' },
  { emoji: '🍖', label: '上门喂食', sub: '外出必备',  color: '#10B981', bg: '#ECFDF5', to: '/booking' },
];

const PETS = [
  { name: '豆豆', emoji: '🐕', color: '#FF6B35' },
  { name: '团子', emoji: '🐩', color: '#8B7FD4' },
];

const WALKERS = [
  { name: '张大伟', initials: '张', color: '#FF6B35', rating: 4.9, reviews: 127, dist: '0.3km', price: 45, tags: ['金牌', '大型犬'] },
  { name: '陈小燕', initials: '陈', color: '#E91E8C', rating: 4.8, reviews: 89,  dist: '0.7km', price: 40, tags: ['优秀', '小型犬'] },
  { name: '李浩然', initials: '李', color: '#3B82F6', rating: 4.7, reviews: 203, dist: '1.2km', price: 38, tags: ['优秀', '中型犬'] },
];

function hour() {
  const h = new Date().getHours();
  if (h < 6)  return '深夜好';
  if (h < 12) return '早上好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
}

export default function OwnerHomePage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [search, setSearch] = useState('');
  const name = user?.name || '李美华';

  return (
    <div style={{ background: BG, minHeight: '100vh', paddingBottom: 80, fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* ── Hero header ───────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${OG} 0%, #FF9245 100%)`, padding: '52px 20px 32px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ position: 'absolute', top: 20, right: 50, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, position: 'relative' }}>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 4 }}>{hour()}，{name} 👋</p>
            <h1 style={{ color: 'white', fontWeight: 800, fontSize: 22, lineHeight: 1.2, margin: 0 }}>
              今天的<br />遛狗计划安排好了吗？
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Bell style={{ width: 18, height: 18 }} />
            </button>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧑</div>
          </div>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: T3 }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜索服务或遛狗师…"
            style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 40, paddingRight: 16, paddingTop: 13, paddingBottom: 13, borderRadius: 14, border: 'none', outline: 'none', fontSize: 14, color: T1, background: 'white', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }} />
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>

        {/* ── Pet list ─────────────────────────────────────── */}
        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontWeight: 700, color: T1, fontSize: 16, margin: 0 }}>我的宠物</h2>
            <button style={{ fontSize: 12, color: OG, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>管理</button>
          </div>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {PETS.map(p => (
              <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${p.color}20`, border: `2.5px solid ${p.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, boxShadow: `0 4px 12px ${p.color}30` }}>
                  {p.emoji}
                </div>
                <span style={{ fontSize: 12, color: T2, fontWeight: 600 }}>{p.name}</span>
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <button style={{ width: 64, height: 64, borderRadius: '50%', background: 'white', border: `2px dashed #E8E5E0`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Plus style={{ width: 22, height: 22, color: T3 }} />
              </button>
              <span style={{ fontSize: 12, color: T3 }}>添加</span>
            </div>
          </div>
        </div>

        {/* ── Wellness prompt ───────────────────────────────── */}
        <div style={{ background: 'white', borderRadius: 18, padding: '16px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F0EFED' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FFF0EA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>💬</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: T1, fontSize: 14, marginBottom: 3 }}>今天你的宠物怎么样？</p>
            <p style={{ color: T3, fontSize: 12 }}>记录豆豆的健康状态，让遛狗师更了解它</p>
          </div>
          <ChevronRight style={{ width: 16, height: 16, color: T3, flexShrink: 0 }} />
        </div>

        {/* ── Services 2×2 ─────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontWeight: 700, color: T1, fontSize: 16, marginBottom: 14 }}>选择服务</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {SERVICES.map(s => (
              <button key={s.label} onClick={() => nav(s.to)}
                style={{ background: 'white', border: '1px solid #F0EFED', borderRadius: 18, padding: '18px 16px', textAlign: 'left', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'transform 0.15s', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {s.emoji}
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: T1, fontSize: 14, marginBottom: 2 }}>{s.label}</p>
                  <p style={{ color: T3, fontSize: 11 }}>{s.sub}</p>
                </div>
                <p style={{ fontWeight: 700, color: s.color, fontSize: 12 }}>立即预约 →</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Banner ───────────────────────────────────────── */}
        <div style={{ background: `linear-gradient(135deg, ${PU} 0%, #A78BFA 100%)`, borderRadius: 18, padding: '18px 20px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -10, top: -10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, marginBottom: 4 }}>限时优惠</p>
          <p style={{ color: 'white', fontWeight: 800, fontSize: 16, marginBottom: 12 }}>新用户首单立减 ¥20 🎁</p>
          <button style={{ background: 'white', border: 'none', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 700, color: PU, cursor: 'pointer' }}>
            立即领取
          </button>
        </div>

        {/* ── Nearby walkers ───────────────────────────────── */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, color: T1, fontSize: 16, margin: 0 }}>附近遛狗师</h2>
            <button onClick={() => nav('/walkers')} style={{ fontSize: 12, color: OG, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
              查看全部 <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {WALKERS.map(w => (
              <div key={w.name} style={{ background: 'white', border: '1px solid #F0EFED', borderRadius: 18, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}
                onClick={() => nav('/owner')}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg,${w.color},${w.color}99)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'white', fontWeight: 800, flexShrink: 0 }}>
                  {w.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: T1, fontSize: 15 }}>{w.name}</span>
                    {w.tags.map(t => (
                      <span key={t} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 20, background: t === '金牌' ? '#FFFBEB' : '#EFF6FF', color: t === '金牌' ? '#D97706' : '#2563EB', fontWeight: 700 }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: T3 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star style={{ width: 11, height: 11, fill: '#FBBF24', color: '#FBBF24' }} />
                      <span style={{ color: '#D97706', fontWeight: 700 }}>{w.rating}</span>
                      <span>（{w.reviews}）</span>
                    </span>
                    <span>·</span>
                    <span>📍 {w.dist}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontWeight: 800, color: OG, fontSize: 18 }}>¥{w.price}</p>
                  <p style={{ fontSize: 11, color: T3 }}>/次</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <BottomTabBar />
    </div>
  );
}
