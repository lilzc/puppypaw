import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, Heart, ShieldCheck, SlidersHorizontal } from 'lucide-react';

const BG = '#F8F7F4';
const OG = '#FF6B35';
const T1 = '#1A1A1A';
const T2 = '#5A5A5A';
const T3 = '#A8A29E';

interface Walker {
  id: string;
  name: string;
  initials: string;
  gradientA: string;
  gradientB: string;
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
  emoji: string;
}

function creditLevel(score: number) {
  if (score >= 90) return { label: '金牌', color: '#D97706', bg: '#FFFBEB' };
  if (score >= 80) return { label: '优秀', color: '#059669', bg: '#ECFDF5' };
  if (score >= 60) return { label: '良好', color: '#2563EB', bg: '#EFF6FF' };
  return { label: '普通', color: '#6B7280', bg: '#F3F4F6' };
}

const WALKERS: Walker[] = [
  { id: '1', name: '刘明远', initials: '刘', gradientA: '#FF6B35', gradientB: '#FF9245',
    rating: 4.9, reviewCount: 312, repeatClients: 67, emoji: '🏅',
    bio: '全职遛狗师，4年经验，服务过300+只不同犬种，获平台年度最佳评选。',
    distance: 2.1, lastActive: '今天 09:15', price: 52,
    verified: true, tags: ['大型犬', '年度最佳'], responseRate: 99, creditScore: 96 },
  { id: '2', name: '张大伟', initials: '张', gradientA: '#8B7FD4', gradientB: '#A78BFA',
    rating: 4.9, reviewCount: 127, repeatClients: 23, emoji: '⭐',
    bio: '养犬8年，持有宠物护理资格证，熟悉各类犬种。全程实时拍照汇报，随叫随到。',
    distance: 0.3, lastActive: '今天 10:23', price: 45,
    verified: true, tags: ['大型犬', '多犬同行'], responseRate: 98, creditScore: 92 },
  { id: '3', name: '李浩然', initials: '李', gradientA: '#06B6D4', gradientB: '#0EA5E9',
    rating: 4.7, reviewCount: 203, repeatClients: 45, emoji: '⭐',
    bio: '热爱动物，已完成400+次服务。每次附路线回放报告，好评率持续100%。',
    distance: 1.2, lastActive: '今天 07:30', price: 38,
    verified: true, tags: ['中型犬', '实时汇报'], responseRate: 92, creditScore: 85 },
  { id: '4', name: '陈小燕', initials: '陈', gradientA: '#E91E8C', gradientB: '#F472B6',
    rating: 4.8, reviewCount: 89, repeatClients: 18, emoji: '⭐',
    bio: '专业训犬师出身，擅长处理敏感犬只，服务细心负责，满意率100%。',
    distance: 0.7, lastActive: '今天 08:45', price: 40,
    verified: true, tags: ['小型犬', '老年犬'], responseRate: 95, creditScore: 82 },
  { id: '5', name: '王婷婷', initials: '王', gradientA: '#10B981', gradientB: '#34D399',
    rating: 4.6, reviewCount: 56, repeatClients: 12, emoji: '',
    bio: '动物爱好者，时间灵活，周末全天可接单，价格实惠，沟通顺畅。',
    distance: 1.8, lastActive: '昨天 21:00', price: 35,
    verified: false, tags: ['小型犬', '周末专场'], responseRate: 88, creditScore: 68 },
];

const FILTERS = ['全部', '距离最近', '评分最高', '价格最低', '金牌认证', '立即可接'];

export default function WalkerListPage() {
  const nav = useNavigate();
  const [search,      setSearch]      = useState('');
  const [activeFilter, setFilter]     = useState('全部');
  const [liked,        setLiked]      = useState<Set<string>>(new Set());

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const sorted = [...WALKERS]
    .filter(w => !search || w.name.includes(search) || w.tags.some(t => t.includes(search)))
    .filter(w => activeFilter === '金牌认证' ? w.creditScore >= 90 : true)
    .sort((a, b) => {
      if (activeFilter === '距离最近') return a.distance - b.distance;
      if (activeFilter === '评分最高') return b.rating - a.rating;
      if (activeFilter === '价格最低') return a.price - b.price;
      return (b.creditScore * 0.6 + b.repeatClients * 0.4) - (a.creditScore * 0.6 + a.repeatClients * 0.4);
    });

  return (
    <div style={{ background: BG, minHeight: '100vh', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* ── Sticky top ───────────────────────────────────── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: BG, paddingTop: 16, paddingBottom: 12 }}>
        {/* Search */}
        <div style={{ padding: '0 16px', marginBottom: 12 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: T3 }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索遛狗师或标签…"
                style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 40, paddingRight: 16, paddingTop: 13, paddingBottom: 13, borderRadius: 14, border: '1.5px solid #E8E5E0', background: 'white', fontSize: 14, color: T1, outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                onFocus={e => { e.target.style.borderColor = OG; e.target.style.boxShadow = `0 0 0 3px rgba(255,107,53,0.1)`; }}
                onBlur={e => { e.target.style.borderColor = '#E8E5E0'; e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }} />
            </div>
            <button style={{ width: 46, height: 46, borderRadius: 14, background: 'white', border: '1.5px solid #E8E5E0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <SlidersHorizontal style={{ width: 18, height: 18, color: T2 }} />
            </button>
          </div>
        </div>

        {/* Filter chips - horizontal scroll */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 16px', scrollbarWidth: 'none' }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 22, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                background: activeFilter === f ? OG : 'white',
                color: activeFilter === f ? 'white' : T2,
                boxShadow: activeFilter === f ? `0 4px 12px rgba(255,107,53,0.35)` : '0 1px 4px rgba(0,0,0,0.08)',
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Safety banner ────────────────────────────────── */}
      <div style={{ margin: '12px 16px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShieldCheck style={{ width: 15, height: 15, color: '#16A34A', flexShrink: 0 }} />
        <p style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>所有遛狗师均已通过实名认证与背景调查 ✓</p>
      </div>

      {/* ── Count ────────────────────────────────────────── */}
      <div style={{ padding: '0 16px', marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: T3 }}>找到 <strong style={{ color: T1 }}>{sorted.length}</strong> 位遛狗师</p>
      </div>

      {/* ── Walker cards - travel style ───────────────────── */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 32 }}>
        {sorted.map(w => {
          const lvl = creditLevel(w.creditScore);
          const isLiked = liked.has(w.id);
          return (
            <div key={w.id} onClick={() => nav('/owner')}
              style={{ background: 'white', borderRadius: 22, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.14)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; }}>

              {/* Card image / gradient top */}
              <div style={{ height: 140, background: `linear-gradient(135deg, ${w.gradientA} 0%, ${w.gradientB} 100%)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ position: 'absolute', bottom: -10, left: 20, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

                {/* Avatar circle */}
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, border: '3px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)' }}>
                  {w.initials}
                </div>

                {/* Heart button */}
                <button onClick={e => toggleLike(w.id, e)}
                  style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.25)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                  <Heart style={{ width: 18, height: 18, fill: isLiked ? 'white' : 'transparent', color: 'white', strokeWidth: isLiked ? 0 : 2 }} />
                </button>

                {/* Verified badge */}
                {w.verified && (
                  <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)' }}>
                    <ShieldCheck style={{ width: 12, height: 12, color: 'white' }} />
                    <span style={{ fontSize: 11, color: 'white', fontWeight: 700 }}>认证</span>
                  </div>
                )}

                {/* TOP badge */}
                {w.rating >= 4.9 && (
                  <div style={{ position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '3px 12px', borderRadius: '20px 20px 0 0', fontSize: 11, fontWeight: 800, color: w.gradientA }}>
                    TOP RATED
                  </div>
                )}
              </div>

              {/* Card body */}
              <div style={{ padding: '14px 16px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                      <h3 style={{ fontWeight: 800, color: T1, fontSize: 17, margin: 0 }}>{w.name}</h3>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: lvl.bg, color: lvl.color, fontWeight: 700, border: `1px solid ${lvl.color}30` }}>
                        {w.emoji} {lvl.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: T3 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Star style={{ width: 12, height: 12, fill: '#FBBF24', color: '#FBBF24' }} />
                        <strong style={{ color: T1 }}>{w.rating}</strong>
                        <span>（{w.reviewCount}）</span>
                      </span>
                      <span>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <MapPin style={{ width: 11, height: 11 }} />{w.distance} km
                      </span>
                      <span>·</span>
                      <span>{w.repeatClients} 回头客</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: 900, fontSize: 22, color: OG, lineHeight: 1 }}>¥{w.price}</p>
                    <p style={{ fontSize: 11, color: T3, marginTop: 3 }}>/次</p>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: T2, lineHeight: 1.55, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as React.CSSProperties['WebkitBoxOrient'], overflow: 'hidden' }}>
                  {w.bio}
                </p>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {w.tags.map(t => (
                    <span key={t} style={{ fontSize: 11, color: T3, background: '#F5F4F2', padding: '4px 10px', borderRadius: 20, fontWeight: 500 }}>{t}</span>
                  ))}
                  <span style={{ fontSize: 11, color: T3, background: '#F5F4F2', padding: '4px 10px', borderRadius: 20, fontWeight: 500 }}>响应率 {w.responseRate}%</span>
                </div>
              </div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 22 }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>🔍</div>
            <p style={{ fontWeight: 600, color: T1, fontSize: 16, marginBottom: 8 }}>暂无符合条件的遛狗师</p>
            <p style={{ color: T3, fontSize: 14 }}>尝试调整筛选条件</p>
          </div>
        )}
      </div>
    </div>
  );
}
