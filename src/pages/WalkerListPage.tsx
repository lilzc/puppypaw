import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, MapPin, Filter, ShieldCheck } from 'lucide-react';

/* ── Design tokens ───────────────────────────────────────────── */
const ORANGE   = '#FF6B35';
const T1       = '#1A1A1A';
const T2       = '#4A4A4A';
const T3       = '#9B9B9B';
const BG_INPUT = '#F8F8F8';
const DIVIDER  = '#F0F0F0';

/* ── Types ───────────────────────────────────────────────────── */
interface Walker {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  rating: number;
  reviewCount: number;
  repeatClients: number;
  bio: string;
  distance: number;
  lastActive: string;
  price: number;
  verified: boolean;
  tags: string[];
  responseRate: number;
  creditScore: number;
}

function creditLevel(score: number): { label: string; color: string; bg: string } {
  if (score >= 90) return { label: '金牌', color: '#D97706', bg: '#FFFBEB' };
  if (score >= 80) return { label: '优秀', color: '#059669', bg: '#ECFDF5' };
  if (score >= 60) return { label: '良好', color: '#2563EB', bg: '#EFF6FF' };
  return { label: '普通', color: '#6B7280', bg: '#F3F4F6' };
}

/* ── Mock data ───────────────────────────────────────────────── */
const WALKERS: Walker[] = [
  {
    id: '1', name: '张大伟', initials: '张', avatarColor: '#FF6B35',
    rating: 4.9, reviewCount: 127, repeatClients: 23,
    bio: '养犬 8 年，持有宠物护理资格证，熟悉各类犬种。全程实时拍照汇报，随叫随到。',
    distance: 0.3, lastActive: '今天 10:23', price: 45,
    verified: true, tags: ['大型犬', '多犬同行'], responseRate: 98, creditScore: 92,
  },
  {
    id: '2', name: '陈小燕', initials: '陈', avatarColor: '#E91E8C',
    rating: 4.8, reviewCount: 89, repeatClients: 18,
    bio: '专业训犬师出身，擅长处理敏感犬只，服务细心负责，满意率 100%。',
    distance: 0.7, lastActive: '今天 08:45', price: 40,
    verified: true, tags: ['小型犬', '老年犬'], responseRate: 95, creditScore: 82,
  },
  {
    id: '3', name: '李浩然', initials: '李', avatarColor: '#3B82F6',
    rating: 4.7, reviewCount: 203, repeatClients: 45,
    bio: '热爱动物，已完成 400+ 次服务。每次附路线回放报告，好评率持续 100%。',
    distance: 1.2, lastActive: '今天 07:30', price: 38,
    verified: true, tags: ['中型犬', '实时汇报'], responseRate: 92, creditScore: 85,
  },
  {
    id: '4', name: '王婷婷', initials: '王', avatarColor: '#10B981',
    rating: 4.6, reviewCount: 56, repeatClients: 12,
    bio: '动物爱好者，时间灵活，周末全天可接单，价格实惠，沟通顺畅。',
    distance: 1.8, lastActive: '昨天 21:00', price: 35,
    verified: false, tags: ['小型犬', '周末专场'], responseRate: 88, creditScore: 68,
  },
  {
    id: '5', name: '刘明远', initials: '刘', avatarColor: '#8B5CF6',
    rating: 4.9, reviewCount: 312, repeatClients: 67,
    bio: '全职遛狗师，4 年经验，服务过 300+ 只不同犬种，获平台年度最佳评选。',
    distance: 2.1, lastActive: '今天 09:15', price: 52,
    verified: true, tags: ['大型犬', '年度最佳'], responseRate: 99, creditScore: 96,
  },
];

const SORT_OPTIONS = [
  { id: 'recommended', label: '推荐排序' },
  { id: 'rating',      label: '评分最高' },
  { id: 'price_asc',   label: '价格从低' },
  { id: 'distance',    label: '距离最近' },
];

/* ── Walker card ─────────────────────────────────────────────── */
function WalkerCard({ walker, onSelect }: { walker: Walker; onSelect: () => void }) {
  return (
    <button onClick={onSelect}
      style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'background 0.12s' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#FAFAFA'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>

      {/* Avatar */}
      <div style={{ width: 52, height: 52, borderRadius: '50%', background: walker.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'white', fontWeight: 800, flexShrink: 0 }}>
        {walker.initials}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name + verified + credit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontWeight: 700, color: T1, fontSize: 16 }}>{walker.name}</span>
          {walker.verified && (
            <span style={{ fontSize: 11, fontWeight: 700, color: ORANGE, background: '#FFF3EE', padding: '2px 7px', borderRadius: 100, whiteSpace: 'nowrap' }}>
              认证遛狗师
            </span>
          )}
          {(() => { const lvl = creditLevel(walker.creditScore); return (
            <span style={{ fontSize: 10, fontWeight: 700, color: lvl.color, background: lvl.bg, padding: '2px 7px', borderRadius: 100, whiteSpace: 'nowrap', border: `1px solid ${lvl.color}30` }}>
              {lvl.label === '金牌' ? '🏅' : lvl.label === '优秀' ? '⭐' : ''}{lvl.label} {walker.creditScore}分
            </span>
          ); })()}
        </div>

        {/* Rating row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Star style={{ width: 13, height: 13, fill: '#F59E0B', color: '#F59E0B' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: T1 }}>{walker.rating}</span>
            <span style={{ fontSize: 13, color: T3 }}>（{walker.reviewCount} 评价）</span>
          </div>
          <span style={{ color: DIVIDER }}>·</span>
          <span style={{ fontSize: 13, color: T3 }}>{walker.repeatClients} 位回头客</span>
        </div>

        {/* Bio */}
        <p style={{ fontSize: 13, color: T2, lineHeight: 1.55, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as React.CSSProperties['WebkitBoxOrient'], overflow: 'hidden' }}>
          {walker.bio}
        </p>

        {/* Tags */}
        {walker.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {walker.tags.map(tag => (
              <span key={tag} style={{ fontSize: 11, color: T3, background: BG_INPUT, padding: '3px 9px', borderRadius: 100, fontWeight: 500 }}>{tag}</span>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: T3 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <MapPin style={{ width: 11, height: 11 }} />{walker.distance} km
          </span>
          <span>最近活跃：{walker.lastActive}</span>
          <span>响应率 {walker.responseRate}%</span>
        </div>
      </div>

      {/* Price */}
      <div style={{ flexShrink: 0, textAlign: 'right', paddingTop: 2 }}>
        <p style={{ fontWeight: 800, fontSize: 18, color: T1, lineHeight: 1 }}>¥{walker.price}</p>
        <p style={{ fontSize: 11, color: T3, marginTop: 3 }}>/次</p>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function WalkerListPage() {
  const nav = useNavigate();
  const [sort,       setSort]       = useState('recommended');
  const [showSort,   setShowSort]   = useState(false);
  const [onlyVerify, setOnlyVerify] = useState(false);

  const sorted = [...WALKERS]
    .filter(w => onlyVerify ? w.verified : true)
    .sort((a, b) => {
      if (sort === 'rating')    return b.rating - a.rating;
      if (sort === 'price_asc') return a.price - b.price;
      if (sort === 'distance')  return a.distance - b.distance;
      // recommended: 60% credit score + 40% repeat clients
      return (b.creditScore * 0.6 + b.repeatClients * 0.4) - (a.creditScore * 0.6 + a.repeatClients * 0.4);
    });

  const currentSort = SORT_OPTIONS.find(o => o.id === sort)?.label ?? '推荐排序';

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Nav ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${DIVIDER}`, position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
        <button onClick={() => nav('/pet-info')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: T2, fontSize: 15, fontWeight: 500, padding: 0 }}>
          <ChevronLeft style={{ width: 19, height: 19 }} /> 返回
        </button>
        <span style={{ fontWeight: 700, color: T1, fontSize: 16 }}>搜索结果</span>
        <button
          onClick={() => setOnlyVerify(!onlyVerify)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4, color: onlyVerify ? ORANGE : T3, fontSize: 13, fontWeight: 600 }}>
          <Filter style={{ width: 15, height: 15 }} />
          筛选
        </button>
      </div>

      {/* ── Safety banner ───────────────────────────────── */}
      <div style={{ background: ORANGE, padding: '11px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShieldCheck style={{ width: 16, height: 16, color: 'white', flexShrink: 0 }} />
        <p style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>
          所有遛狗师均已通过实名认证与背景调查
          <span style={{ marginLeft: 6, opacity: 0.85 }}>✓</span>
        </p>
      </div>

      {/* ── Sort + count bar ────────────────────────────── */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${DIVIDER}` }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 22, color: T1, letterSpacing: -0.3 }}>找到匹配</h2>
          <p style={{ fontSize: 13, color: T3, marginTop: 2 }}>附近 {sorted.length} 位遛狗师可接单</p>
        </div>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowSort(!showSort)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: BG_INPUT, border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: T2, fontWeight: 500 }}>
            {currentSort}
            <ChevronLeft style={{ width: 14, height: 14, transform: 'rotate(-90deg)', color: T3 }} />
          </button>
          {showSort && (
            <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 4px)', background: 'white', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden', minWidth: 140 }}>
              {SORT_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => { setSort(opt.id); setShowSort(false); }}
                  style={{ display: 'block', width: '100%', padding: '12px 16px', background: sort === opt.id ? '#FFF3EE' : 'transparent', border: 'none', textAlign: 'left', fontSize: 14, color: sort === opt.id ? ORANGE : T2, fontWeight: sort === opt.id ? 600 : 400, cursor: 'pointer' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Filter chips ────────────────────────────────── */}
      {onlyVerify && (
        <div style={{ padding: '10px 20px', display: 'flex', gap: 8, borderBottom: `1px solid ${DIVIDER}` }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#FFF3EE', color: ORANGE, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 100, border: `1px solid rgba(255,107,53,0.25)` }}>
            ✓ 仅显示认证
            <button onClick={() => setOnlyVerify(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: ORANGE, padding: 0, marginLeft: 2, fontSize: 14, lineHeight: 1 }}>×</button>
          </span>
        </div>
      )}

      {/* ── Walker list ──────────────────────────────────── */}
      <div>
        {sorted.map((walker, i) => (
          <div key={walker.id}>
            <WalkerCard walker={walker} onSelect={() => nav(`/owner`)} />
            {i < sorted.length - 1 && (
              <div style={{ height: 1, background: DIVIDER, marginLeft: 20 + 52 + 14 }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Empty state ──────────────────────────────────── */}
      {sorted.length === 0 && (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{ fontWeight: 600, color: T1, fontSize: 16, marginBottom: 8 }}>暂无符合条件的遛狗师</p>
          <p style={{ color: T3, fontSize: 14 }}>尝试调整筛选条件</p>
        </div>
      )}

      {/* ── Bottom padding ───────────────────────────────── */}
      <div style={{ height: 40 }} />
    </div>
  );
}
