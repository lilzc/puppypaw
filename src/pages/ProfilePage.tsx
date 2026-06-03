import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Camera, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Score gauge ─────────────────────────────────────────────── */
function ScoreArc({ score }: { score: number }) {
  const MIN = 350, MAX = 950, R = 58, CX = 100, CY = 80;
  const pct = Math.max(0.01, Math.min(0.99, (score - MIN) / (MAX - MIN)));
  const rad = -Math.PI + pct * Math.PI;
  const ex  = +(CX + R * Math.cos(rad)).toFixed(1);
  const ey  = +(CY + R * Math.sin(rad)).toFixed(1);
  return (
    <svg viewBox="0 0 200 95" width="200" height="95" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#8B5CF6" />
          <stop offset="60%"  stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <path d={`M ${CX-R} ${CY} A ${R} ${R} 0 0 1 ${CX+R} ${CY}`}
        fill="none" stroke="#E8E5E0" strokeWidth="9" strokeLinecap="round" />
      <path d={`M ${CX-R} ${CY} A ${R} ${R} 0 0 1 ${ex} ${ey}`}
        fill="none" stroke="url(#sg)" strokeWidth="9" strokeLinecap="round" />
      <text x={CX} y={CY-10} textAnchor="middle" dominantBaseline="middle"
        fill="#1C1917" fontSize="30" fontWeight="900" fontFamily="system-ui">{score}</text>
    </svg>
  );
}

const CREDIT_METRICS = [
  { icon: '🪪', label: '身份信息', value: '已认证', ok: true },
  { icon: '📱', label: '手机实名', value: '已完成', ok: true },
  { icon: '🐾', label: '服务记录', value: '优秀',   ok: true },
  { icon: '💳', label: '支付记录', value: '良好',   ok: true },
  { icon: '⭐', label: '评价历史', value: '优秀',   ok: true },
  { icon: '🏦', label: '信用历史', value: '2年+',   ok: true },
];

const WALKER_BADGES = [
  { icon: '🎓', title: '宠物护理资格证书', sub: '国家职业技能认证', ok: true },
  { icon: '🪪', title: '实名身份核验',      sub: '公安系统认证',    ok: true },
  { icon: '🔍', title: '背景调查通过',      sub: '无犯罪记录',      ok: true },
  { icon: '⭐', title: '平台优质认证',      sub: '好评率 100%',     ok: true },
];

const OWNER_ORDERS = [
  { id: 'o1', walker: '张大伟', wEmoji: '🧑', pet: '豆豆', date: '2024-12-15', price: 45, rating: 5, review: '非常专业，豆豆很开心！超级推荐' },
  { id: 'o2', walker: '陈小燕', wEmoji: '👩', pet: '豆豆', date: '2024-12-10', price: 40, rating: 4, review: '准时到达，服务不错' },
  { id: 'o3', walker: '张大伟', wEmoji: '🧑', pet: '豆豆', date: '2024-11-28', price: 45, rating: 5, review: '' },
];

const WALKER_ORDERS = [
  { id: 'w1', owner: '李美华', pet: '豆豆', petEmoji: '🐕', breed: '柴犬', date: '2024-12-19', price: 65, rating: 5 },
  { id: 'w2', owner: '王小刚', pet: '奶茶', petEmoji: '🐩', breed: '泰迪', date: '2024-12-18', price: 40, rating: 5 },
  { id: 'w3', owner: '陈芳',   pet: '大黄', petEmoji: '🦮', breed: '金毛', date: '2024-12-17', price: 42, rating: 4 },
];

const card: React.CSSProperties = {
  background: '#FFFFFF', border: '1px solid #E8E5E0', borderRadius: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const nav       = useNavigate();
  const fileRef   = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const isOwner = user?.role === 'owner';

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const score = 728;
  const level = score >= 800 ? '杰出' : score >= 700 ? '优秀' : score >= 600 ? '良好' : '普通';
  const levelColor = score >= 800 ? '#16A34A' : score >= 700 ? '#2563EB' : '#D97706';

  return (
    <div style={{ background: '#F9F8F6', minHeight: '100vh', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 0' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={() => nav(-1)} style={{ width: 36, height: 36, borderRadius: 10, background: 'white', border: '1px solid #E8E5E0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#78716C', flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <ChevronLeft style={{ width: 18, height: 18 }} />
          </button>
          <h1 style={{ fontWeight: 800, color: '#1C1917', fontSize: 20, lineHeight: 1 }}>个人中心</h1>
        </div>

        {/* Identity card */}
        <div style={{ ...card, padding: 20, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div onClick={() => fileRef.current?.click()} style={{ width: 68, height: 68, borderRadius: 20, cursor: 'pointer', overflow: 'hidden', background: avatar ? 'transparent' : 'linear-gradient(135deg,#FF6B2C,#FF9245)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, position: 'relative' }}>
                {avatar
                  ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (isOwner ? '👤' : '🧑')}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }} onMouseLeave={e => { e.currentTarget.style.opacity = '0'; }}>
                  <Camera style={{ width: 20, height: 20, color: 'white' }} />
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
              <div style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: '#16A34A', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 900 }}>✓</div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h2 style={{ fontWeight: 800, color: '#1C1917', fontSize: 19, lineHeight: 1 }}>{user?.name || (isOwner ? '李美华' : '张大伟')}</h2>
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: isOwner ? '#FFF4EF' : '#F5F3FF', color: isOwner ? '#FF6B2C' : '#7C3AED', fontWeight: 600, border: `1px solid ${isOwner ? 'rgba(255,107,44,0.2)' : 'rgba(124,58,237,0.2)'}` }}>
                  {isOwner ? '宠物主' : '遛狗师'}
                </span>
              </div>
              <p style={{ color: '#78716C', fontSize: 13, marginBottom: 10 }}>{user?.email || (isOwner ? 'owner@demo.com' : 'walker@demo.com')}</p>
              <div style={{ display: 'flex', gap: 20 }}>
                {isOwner ? (
                  <>
                    <div><p style={{ fontWeight: 800, color: '#1C1917', fontSize: 18, lineHeight: 1 }}>3</p><p style={{ color: '#A8A29E', fontSize: 11, marginTop: 3 }}>历史订单</p></div>
                    <div><p style={{ fontWeight: 800, color: '#1C1917', fontSize: 18, lineHeight: 1 }}>1</p><p style={{ color: '#A8A29E', fontSize: 11, marginTop: 3 }}>宠物档案</p></div>
                  </>
                ) : (
                  <>
                    <div><p style={{ fontWeight: 800, color: '#FF6B2C', fontSize: 18, lineHeight: 1 }}>312</p><p style={{ color: '#A8A29E', fontSize: 11, marginTop: 3 }}>完成接单</p></div>
                    <div><p style={{ fontWeight: 800, color: '#D97706', fontSize: 18, lineHeight: 1 }}>4.9</p><p style={{ color: '#A8A29E', fontSize: 11, marginTop: 3 }}>平均评分</p></div>
                    <div><p style={{ fontWeight: 800, color: '#16A34A', fontSize: 18, lineHeight: 1 }}>¥1,280</p><p style={{ color: '#A8A29E', fontSize: 11, marginTop: 3 }}>本月收入</p></div>
                  </>
                )}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#A8A29E', marginTop: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Camera style={{ width: 11, height: 11 }} /> 点击头像可更换照片
          </p>
        </div>

        {/* Credit score */}
        <div style={{ ...card, padding: 20, marginBottom: 12, borderColor: 'rgba(124,58,237,0.2)', background: '#FAFAFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h3 style={{ fontWeight: 700, color: '#1C1917', fontSize: 14 }}>Puppy Paw 信用分</h3>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: score >= 700 ? '#EFF6FF' : '#FFFBEB', color: levelColor, fontWeight: 700, border: `1px solid ${score >= 700 ? '#BFDBFE' : '#FDE68A'}` }}>{level}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ScoreArc score={score} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, padding: '0 4px' }}>
                {['普通','良好','优秀','杰出','超凡'].map((l, i) => (
                  <span key={l} style={{ fontSize: 9, color: i === 2 ? '#2563EB' : '#A8A29E', fontWeight: i === 2 ? 700 : 400 }}>{l}</span>
                ))}
              </div>
            </div>
            {/* Sesame credit entry */}
            <div style={{ flexShrink: 0, width: 96, background: 'white', border: '1px solid rgba(124,58,237,0.18)', borderRadius: 16, padding: '10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'; e.currentTarget.style.background = '#F5F3FF'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.18)'; e.currentTarget.style.background = 'white'; }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>🏛</div>
              <p style={{ color: '#1C1917', fontSize: 11, fontWeight: 700, marginBottom: 2 }}>芝麻信用</p>
              <p style={{ color: '#78716C', fontSize: 10 }}>已授权查询</p>
              <p style={{ color: '#7C3AED', fontSize: 11, fontWeight: 700, marginTop: 4 }}>718 分</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, marginTop: 2 }}>
                <span style={{ fontSize: 9, color: '#A8A29E' }}>查看报告</span>
                <ChevronRight style={{ width: 10, height: 10, color: '#A8A29E' }} />
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
            {CREDIT_METRICS.map(m => (
              <div key={m.label} style={{ background: 'white', border: '1px solid #E8E5E0', borderRadius: 12, padding: '8px 10px' }}>
                <span style={{ fontSize: 15 }}>{m.icon}</span>
                <p style={{ color: '#78716C', fontSize: 10, marginTop: 4 }}>{m.label}</p>
                <p style={{ color: m.ok ? '#16A34A' : '#EF4444', fontSize: 11, fontWeight: 700, marginTop: 1 }}>{m.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Role-specific */}
        {isOwner ? (
          <div style={{ ...card, padding: 18, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontWeight: 700, color: '#1C1917', fontSize: 14 }}>🐾 宠物档案</h3>
              <button style={{ fontSize: 12, color: '#FF6B2C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+ 添加宠物</button>
            </div>
            <div style={{ background: '#F9F8F6', border: '1px solid #E8E5E0', borderRadius: 16, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FFF4EF', border: '1px solid rgba(255,107,44,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>🐕</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 800, color: '#1C1917', fontSize: 16 }}>豆豆</span>
                  <span style={{ fontSize: 11, color: '#78716C', background: '#F5F4F2', padding: '2px 8px', borderRadius: 20 }}>柴犬</span>
                  <span style={{ fontSize: 11, color: '#A8A29E' }}>3岁 · 12kg</span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' as const }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#F0FDF4', color: '#16A34A', fontWeight: 600, border: '1px solid #BBF7D0' }}>✓ 已接种疫苗</span>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#EFF6FF', color: '#2563EB', fontWeight: 600, border: '1px solid #BFDBFE' }}>🛡 意外险已激活</span>
                </div>
                <p style={{ color: '#78716C', fontSize: 12, lineHeight: 1.55 }}>温顺，不咬人，喜欢玩球，对陌生人友好</p>
              </div>
            </div>
            <div style={{ marginTop: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>🛡</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#16A34A', fontWeight: 700, fontSize: 13 }}>宠物意外险 · 保额 ¥50,000</p>
                <p style={{ color: '#78716C', fontSize: 11, marginTop: 2 }}>有效期至 2024-12-31 · 已理赔 0 次</p>
              </div>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#F0FDF4', color: '#16A34A', fontWeight: 600, border: '1px solid #BBF7D0' }}>有效</span>
            </div>
          </div>
        ) : (
          <div style={{ ...card, padding: 18, marginBottom: 12 }}>
            <h3 style={{ fontWeight: 700, color: '#1C1917', fontSize: 14, marginBottom: 14 }}>认证徽章</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {WALKER_BADGES.map(b => (
                <div key={b.title} style={{ background: '#F9F8F6', border: '1px solid #E8E5E0', borderRadius: 14, padding: '12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 22 }}>{b.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#1C1917', fontWeight: 700, fontSize: 12, lineHeight: 1.3 }}>{b.title}</p>
                    <p style={{ color: '#78716C', fontSize: 10, marginTop: 3 }}>{b.sub}</p>
                  </div>
                  {b.ok && <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 900, flexShrink: 0 }}>✓</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order history */}
        <div style={{ ...card, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, color: '#1C1917', fontSize: 14 }}>历史订单</h3>
            <span style={{ fontSize: 12, color: '#A8A29E' }}>最近 3 条</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(isOwner ? OWNER_ORDERS : WALKER_ORDERS).map((o, i) => (
              <div key={o.id} style={{ background: '#F9F8F6', border: '1px solid #E8E5E0', borderRadius: 16, padding: '12px 14px', animation: `fadeInUp 0.4s ease ${i * 0.08}s both` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {'wEmoji' in o ? o.wEmoji : o.petEmoji}
                    </div>
                    <div>
                      <p style={{ color: '#1C1917', fontWeight: 700, fontSize: 13, lineHeight: 1 }}>
                        {'walker' in o ? o.walker : `${o.pet} · ${o.breed}`}
                      </p>
                      <p style={{ color: '#A8A29E', fontSize: 11, marginTop: 3 }}>
                        {'pet' in o && 'walker' in o ? o.pet : ('owner' in o ? `宠物主：${o.owner}` : '')} · {o.date}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#FF6B2C' }}>¥{o.price}</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginTop: 3 }}>
                      {[...Array(5)].map((_, si) => (
                        <Star key={si} style={{ width: 10, height: 10, fill: si < o.rating ? '#FBBF24' : 'transparent', color: si < o.rating ? '#FBBF24' : '#E8E5E0' }} />
                      ))}
                    </div>
                  </div>
                </div>
                {'review' in o && o.review && (
                  <p style={{ color: '#78716C', fontSize: 12, lineHeight: 1.55, paddingTop: 8, borderTop: '1px solid #E8E5E0', marginTop: 2 }}>「{o.review}」</p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
