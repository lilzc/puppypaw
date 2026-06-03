import { useState, useRef } from 'react';
import { Star, MapPin, Clock, ChevronRight, Bell, Navigation, Upload, Check, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Types ─────────────────────────────────────────────────── */
type OrderStatus = 'new' | 'accepted' | 'in_progress' | 'completed' | 'declined';

interface OrderRequest {
  id: string;
  ownerName: string;
  petName: string;
  petBreed: string;
  petEmoji: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  distance: number;
  status: OrderStatus;
}

/* ── Static data ────────────────────────────────────────────── */
const INIT_ORDERS: OrderRequest[] = [
  { id: '1', ownerName: '李美华', petName: '豆豆', petBreed: '柴犬', petEmoji: '🐕', date: '2024-12-20', time: '09:00', duration: 60, price: 45, distance: 0.3, status: 'new' },
  { id: '2', ownerName: '王小刚', petName: '奶茶', petBreed: '泰迪', petEmoji: '🐩', date: '2024-12-20', time: '14:00', duration: 60, price: 40, distance: 0.8, status: 'new' },
  { id: '3', ownerName: '陈芳',   petName: '大黄', petBreed: '金毛', petEmoji: '🦮', date: '2024-12-19', time: '10:00', duration: 90, price: 65, distance: 1.1, status: 'accepted' },
];

/* Demo 账号数据（walker@demo.com） */
const DEMO_STATS = [
  { label: '本月收入', value: '¥1,280', icon: '💰' },
  { label: '完成次数', value: '28',     icon: '✅' },
  { label: '平均评分', value: '4.9',    icon: '⭐' },
  { label: '服务时长', value: '42h',    icon: '⏱' },
];
const NEW_STATS = [
  { label: '本月收入', value: '¥0',   icon: '💰' },
  { label: '完成次数', value: '0',    icon: '✅' },
  { label: '平均评分', value: '暂无', icon: '⭐' },
  { label: '服务时长', value: '0h',   icon: '⏱' },
];

const DEMO_TRANSACTIONS = [
  { id: 't1', petEmoji: '🐕', petName: '豆豆', breed: '柴犬', owner: '李美华', date: '12-20', amount: 45, status: 'pending'  as const },
  { id: 't2', petEmoji: '🦮', petName: '大黄', breed: '金毛', owner: '陈芳',   date: '12-19', amount: 65, status: 'received' as const },
  { id: 't3', petEmoji: '🐩', petName: '奶茶', breed: '泰迪', owner: '王小刚', date: '12-18', amount: 40, status: 'received' as const },
  { id: 't4', petEmoji: '🐕', petName: '球球', breed: '边牧', owner: '张伟',   date: '12-17', amount: 42, status: 'received' as const },
];

const card: React.CSSProperties = {
  background: '#FFFFFF', border: '1px solid #E8E5E0', borderRadius: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

/* ═══════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════ */
export default function WalkerPage() {
  const { user } = useAuth();
  /* Demo 账号保留演示数据，真实注册账号从零开始 */
  const isDemo = user?.email === 'walker@demo.com';
  const stats  = isDemo ? DEMO_STATS : NEW_STATS;
  const [orders,     setOrders]     = useState<OrderRequest[]>(isDemo ? INIT_ORDERS : []);
  const [activeTab,  setActiveTab]  = useState<'new' | 'active'>('new');
  const [online,     setOnline]     = useState(true);
  const [insuranceActive, setInsAct] = useState(false);
  const [activating, setActivating] = useState(false);

  /* Service report modal */
  const [reportTarget, setReportTarget] = useState<OrderRequest | null>(null);
  const [reportNote,   setReportNote]   = useState('');
  const [reportPhotos, setReportPhotos] = useState<string[]>([]);
  const [submittingRep, setSubRep]      = useState(false);
  const [reportDone,   setReportDone]   = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const activateIns = () => {
    setActivating(true);
    setTimeout(() => { setInsAct(true); setActivating(false); }, 1400);
  };

  const accept   = (id: string) => setOrders(p => p.map(o => o.id === id ? { ...o, status: 'accepted' as OrderStatus }    : o));
  const decline  = (id: string) => setOrders(p => p.map(o => o.id === id ? { ...o, status: 'declined' as OrderStatus }    : o));
  const startSvc = (id: string) => setOrders(p => p.map(o => o.id === id ? { ...o, status: 'in_progress' as OrderStatus } : o));

  const openReport = (order: OrderRequest) => {
    setReportTarget(order);
    setReportNote('');
    setReportPhotos([]);
    setReportDone(false);
  };

  const addPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || reportPhotos.length >= 3) return;
    const r = new FileReader();
    r.onload = ev => setReportPhotos(p => [...p, ev.target?.result as string]);
    r.readAsDataURL(file);
    e.target.value = '';
  };

  const submitReport = () => {
    if (!reportTarget || !reportNote.trim()) return;
    setSubRep(true);
    setTimeout(() => {
      setOrders(p => p.map(o => o.id === reportTarget.id ? { ...o, status: 'completed' as OrderStatus } : o));
      setSubRep(false);
      setReportDone(true);
    }, 900);
  };

  const newCount    = orders.filter(o => o.status === 'new').length;
  const activeCount = orders.filter(o => ['accepted', 'in_progress'].includes(o.status)).length;
  const visible     = orders.filter(o =>
    activeTab === 'new'
      ? o.status === 'new'
      : ['accepted', 'in_progress', 'completed'].includes(o.status),
  );

  return (
    <>
      <div style={{ background: '#F9F8F6', minHeight: '100vh', paddingBottom: '4rem' }}>

        {/* ── Profile header ──────────────────────────── */}
        <div style={{ background: 'white', borderBottom: '1px solid #E8E5E0' }}>
          <div style={{ maxWidth: 768, margin: '0 auto', padding: '24px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🧑</div>
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: online ? '#16A34A' : '#D1D5DB', border: '2px solid white' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <h2 style={{ fontWeight: 800, color: '#1C1917', fontSize: 20, lineHeight: 1 }}>{user?.name || '张大伟'}</h2>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', fontWeight: 600 }}>✓ 已认证</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#78716C' }}>
                    {isDemo ? (
                      <>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Star style={{ width: 13, height: 13, fill: '#FBBF24', color: '#FBBF24' }} />
                          <span style={{ color: '#D97706', fontWeight: 700 }}>4.9</span>
                        </span>
                        <span style={{ color: '#D6D3D1' }}>·</span>
                        <span>127 条评价</span>
                      </>
                    ) : (
                      <span style={{ color: '#A8A29E', fontSize: 12 }}>暂无评价 · 接单后评价会显示在这里</span>
                    )}
                    <span style={{ color: '#D6D3D1' }}>·</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin style={{ width: 11, height: 11 }} />上海徐汇</span>
                  </div>
                </div>
              </div>
              {/* Online toggle */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <button onClick={() => setOnline(!online)} style={{ width: 50, height: 27, borderRadius: 14, background: online ? '#FF6B2C' : '#E8E5E0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', boxShadow: online ? '0 2px 8px rgba(255,107,44,0.3)' : 'none' }}>
                  <span style={{ position: 'absolute', top: 3, width: 21, height: 21, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.25s', left: online ? 26 : 3 }} />
                </button>
                <span style={{ fontSize: 11, fontWeight: 600, color: online ? '#FF6B2C' : '#A8A29E' }}>{online ? '接单中' : '休息中'}</span>
              </div>
            </div>

            {/* Stats — 统一白色卡片 + 橙色数字 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              {stats.map(s => (
                <div key={s.label} style={{ background: 'white', border: '1px solid #E8E5E0', borderRadius: 16, padding: '14px 10px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontWeight: 800, color: '#FF6B2C', fontSize: 17, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#9B9B9B', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 768, margin: '0 auto', padding: '20px 20px 0' }}>

          {/* ── Insurance ───────────────────────────────── */}
          {!insuranceActive ? (
            <div style={{ ...card, padding: 18, marginBottom: 14, borderColor: 'rgba(124,58,237,0.2)', background: '#FAFAFF' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🛡</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: '#1C1917', fontSize: 14 }}>第三方责任险</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE', fontWeight: 600 }}>认证专属</span>
                  </div>
                  <p style={{ color: '#78716C', fontSize: 12, lineHeight: 1.6, marginBottom: 12 }}>
                    保额 ¥100万 · 覆盖遛狗过程中第三方人身/财产损失<br />
                    <span style={{ color: '#7C3AED', fontWeight: 600 }}>✦ 平台全额承担，遛狗师无需支付</span>
                  </p>
                  <button onClick={activateIns} disabled={activating} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#7C3AED,#A78BFA)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: activating ? 'not-allowed' : 'pointer', opacity: activating ? 0.7 : 1 }}>
                    {activating ? <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />激活中…</> : '立即激活（免费）'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ ...card, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🛡</span>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 700, color: '#1C1917', fontSize: 13 }}>第三方责任险</span>
                <span style={{ color: '#78716C', fontSize: 12, marginLeft: 8 }}>保额 ¥100万 · 有效期至 2025-12-31</span>
              </div>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE', fontWeight: 600, flexShrink: 0 }}>✓ 已激活</span>
            </div>
          )}

          {/* ── Wallet ──────────────────────────────────── */}
          <div style={{ ...card, padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontWeight: 700, color: '#1C1917', fontSize: 15 }}>收益中心</h3>
              <span style={{ fontSize: 12, color: '#A8A29E' }}>本月 2024-12</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ borderRadius: 14, padding: '14px 16px', background: '#FFF4EF', border: '1px solid rgba(255,107,44,0.18)' }}>
                <p style={{ fontSize: 12, color: '#78716C', marginBottom: 4 }}>待到账</p>
                <p style={{ fontWeight: 800, fontSize: 22, color: '#FF6B2C', lineHeight: 1 }}>{isDemo ? '¥105' : '¥0'}</p>
                <p style={{ fontSize: 11, color: '#A8A29E', marginTop: 4 }}>{isDemo ? '3 笔托管中 🔒' : '暂无托管'}</p>
              </div>
              <div style={{ borderRadius: 14, padding: '14px 16px', background: '#F9F8F6', border: '1px solid #E8E5E0' }}>
                <p style={{ fontSize: 12, color: '#78716C', marginBottom: 4 }}>已到账</p>
                <p style={{ fontWeight: 800, fontSize: 22, color: '#1C1917', lineHeight: 1 }}>{isDemo ? '¥1,280' : '¥0'}</p>
                <p style={{ fontSize: 11, color: '#A8A29E', marginTop: 4 }}>{isDemo ? '本月累计 ✓' : '接单后结算'}</p>
              </div>
            </div>

            {/* 交易记录 */}
            {isDemo ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {DEMO_TRANSACTIONS.map(tx => (
                  <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F9F8F6', border: '1px solid #E8E5E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{tx.petEmoji}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, color: '#1C1917', fontWeight: 500 }}>{tx.petName} · {tx.breed}</p>
                      <p style={{ fontSize: 11, color: '#A8A29E', marginTop: 2 }}>{tx.owner} · {tx.date}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: '#1C1917' }}>+¥{tx.amount}</p>
                      <span style={{ fontSize: 11, color: tx.status === 'pending' ? '#FF6B2C' : '#16A34A', fontWeight: 600 }}>
                        {tx.status === 'pending' ? '托管中' : '已到账'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '24px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.35 }}>📋</div>
                <p style={{ color: '#9B9B9B', fontSize: 13 }}>暂无订单记录</p>
                <p style={{ color: '#C0BDB9', fontSize: 12, marginTop: 4 }}>接单后收益记录会显示在这里</p>
              </div>
            )}
          </div>

          {/* ── Orders ──────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 700, color: '#1C1917', fontSize: 15 }}>订单管理</h3>
            {newCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#FFF4EF', border: '1px solid rgba(255,107,44,0.25)' }}>
                <Bell style={{ width: 13, height: 13, color: '#FF6B2C' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#FF6B2C' }}>{newCount} 个新请求</span>
              </div>
            )}
          </div>

          {/* Tab */}
          <div style={{ display: 'flex', background: '#F5F4F2', borderRadius: 14, padding: 4, marginBottom: 16 }}>
            {(['new', 'active'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? '#1C1917' : '#78716C',
                boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}>
                {tab === 'new' ? `待接受${newCount > 0 ? ` (${newCount})` : ''}` : `我的服务${activeCount > 0 ? ` (${activeCount})` : ''}`}
              </button>
            ))}
          </div>

          {/* Order cards */}
          {visible.length === 0 ? (
            <div style={{ ...card, padding: '48px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.35 }}>🐾</div>
              <p style={{ color: '#9B9B9B', fontSize: 14 }}>
                {activeTab === 'new' ? '暂无新的遛狗请求' : '还没有服务记录'}
              </p>
              {!isDemo && activeTab === 'active' && (
                <p style={{ color: '#C0BDB9', fontSize: 12, marginTop: 6 }}>接单后评价会显示在这里</p>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {visible.map((order, i) => (
                <OrderCard key={order.id} order={order} index={i}
                  onAccept={() => accept(order.id)}
                  onDecline={() => decline(order.id)}
                  onStart={() => startSvc(order.id)}
                  onComplete={() => openReport(order)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ Service Report Modal ══════════════════════════════ */}
      {reportTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ width: '100%', maxWidth: 520, background: 'white', borderRadius: '28px 28px 0 0', padding: '24px 24px 36px', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)', animation: 'slideUp 0.3s ease both' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E8E5E0', margin: '0 auto 20px' }} />

            {reportDone ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#FFF4EF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle style={{ width: 36, height: 36, color: '#FF6B2C' }} />
                </div>
                <h3 style={{ fontWeight: 800, color: '#1C1917', fontSize: 18, marginBottom: 8 }}>服务报告已提交！</h3>
                <p style={{ color: '#78716C', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
                  已通知宠物主确认并评价。<br />
                  评价完成后 <strong style={{ color: '#FF6B2C' }}>¥{reportTarget.price}</strong> 将自动打入您的账户。
                </p>
                <button onClick={() => setReportTarget(null)} style={{ background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', color: 'white', border: 'none', padding: '12px 32px', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 10px rgba(255,107,44,0.3)' }}>
                  好的，返回
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontWeight: 800, color: '#1C1917', fontSize: 18, marginBottom: 4 }}>提交服务报告</h3>
                <p style={{ color: '#78716C', fontSize: 13, marginBottom: 18 }}>告知宠物主本次服务情况，完成订单后费用自动结算</p>

                {/* Order summary */}
                <div style={{ background: '#FFF4EF', border: '1px solid rgba(255,107,44,0.18)', borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{reportTarget.petEmoji}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: '#1C1917', fontSize: 14 }}>{reportTarget.petName} · {reportTarget.petBreed}</p>
                    <p style={{ color: '#78716C', fontSize: 12, marginTop: 2 }}>宠物主：{reportTarget.ownerName} · {reportTarget.duration}分钟 · ¥{reportTarget.price}</p>
                  </div>
                </div>

                {/* Route stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {[{ icon: '📍', v: '2.3 km', l: '行走距离' }, { icon: '⏱', v: '58:24', l: '服务时长' }, { icon: '👟', v: '3,120步', l: '步数' }].map(s => (
                    <div key={s.l} style={{ background: '#F9F8F6', border: '1px solid #E8E5E0', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                      <p style={{ fontWeight: 700, color: '#1C1917', fontSize: 12 }}>{s.v}</p>
                      <p style={{ color: '#A8A29E', fontSize: 10, marginTop: 2 }}>{s.l}</p>
                    </div>
                  ))}
                </div>

                {/* Dog status */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#78716C', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>狗狗状态描述 *</label>
                  <textarea value={reportNote} onChange={e => setReportNote(e.target.value)} rows={3}
                    placeholder="描述本次服务情况：狗狗精神状态、遛步表现、是否有异常…"
                    style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', background: '#F5F4F2', border: '1px solid #E8E5E0', borderRadius: 12, color: '#1C1917', fontSize: 13, outline: 'none', resize: 'none', lineHeight: 1.65, fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = '#FF6B2C'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,44,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E8E5E0'; e.target.style.background = '#F5F4F2'; e.target.style.boxShadow = 'none'; }} />
                </div>

                {/* Photos */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#78716C', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>上传照片（最多3张）</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {reportPhotos.map((p, i) => (
                      <div key={i} style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', border: '1px solid #E8E5E0', flexShrink: 0 }}>
                        <img src={p} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                    {reportPhotos.length < 3 && (
                      <button type="button" onClick={() => photoRef.current?.click()}
                        style={{ width: 72, height: 72, borderRadius: 12, border: '1.5px dashed #D6D3D1', background: '#F9F8F6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', flexShrink: 0 }}>
                        <Upload style={{ width: 18, height: 18, color: '#A8A29E' }} />
                        <span style={{ fontSize: 10, color: '#A8A29E' }}>添加</span>
                      </button>
                    )}
                    <input ref={photoRef} type="file" accept="image/*" onChange={addPhoto} style={{ display: 'none' }} />
                  </div>
                </div>

                <button onClick={submitReport} disabled={!reportNote.trim() || submittingRep}
                  style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', color: 'white', border: 'none', fontSize: 15, fontWeight: 700, cursor: !reportNote.trim() ? 'not-allowed' : 'pointer', opacity: !reportNote.trim() ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 3px 12px rgba(255,107,44,0.3)' }}>
                  {submittingRep
                    ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    : <><Check style={{ width: 18, height: 18 }} />提交报告，完成服务</>}
                </button>
                <button type="button" onClick={() => setReportTarget(null)}
                  style={{ display: 'block', width: '100%', marginTop: 12, background: 'none', border: 'none', color: '#A8A29E', fontSize: 13, cursor: 'pointer', padding: '8px 0' }}>
                  稍后提交
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ── Order card subcomponent ─────────────────────────────────── */
function OrderCard({ order, index, onAccept, onDecline, onStart, onComplete }: {
  order: OrderRequest; index: number;
  onAccept: () => void; onDecline: () => void; onStart: () => void; onComplete: () => void;
}) {
  const isNew        = order.status === 'new';
  const isAccepted   = order.status === 'accepted';
  const isInProgress = order.status === 'in_progress';
  const isCompleted  = order.status === 'completed';

  return (
    <div style={{ background: 'white', border: isInProgress ? '1.5px solid rgba(255,107,44,0.35)' : '1px solid #E8E5E0', borderRadius: 20, padding: 18, boxShadow: isInProgress ? '0 4px 16px rgba(255,107,44,0.1)' : '0 1px 3px rgba(0,0,0,0.05)', animation: 'fadeInUp 0.4s ease both', animationDelay: `${index * 0.06}s`, opacity: isCompleted ? 0.75 : 1 }}>
      {/* Top */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F9F8F6', border: '1px solid #E8E5E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{order.petEmoji}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontWeight: 700, color: '#1C1917', fontSize: 15 }}>{order.petName}</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#F5F4F2', color: '#78716C' }}>{order.petBreed}</span>
            </div>
            <p style={{ color: '#78716C', fontSize: 12 }}>宠物主：{order.ownerName}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#FF6B2C' }}>¥{order.price}</div>
          <div style={{ fontSize: 11, color: '#A8A29E', marginTop: 2 }}>{order.duration}分钟</div>
        </div>
      </div>

      {/* Info */}
      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #F5F4F2' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '5px 12px', borderRadius: 20, background: '#F5F4F2', color: '#78716C' }}>
          <Clock style={{ width: 11, height: 11 }} />{order.date} {order.time}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '5px 12px', borderRadius: 20, background: '#F5F4F2', color: '#78716C' }}>
          <MapPin style={{ width: 11, height: 11 }} />距您 {order.distance} km
        </span>
      </div>

      {/* Actions */}
      {isNew && (
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onAccept} style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(255,107,44,0.3)' }}>接受订单</button>
          <button onClick={onDecline} style={{ padding: '12px 18px', borderRadius: 12, background: 'transparent', color: '#78716C', border: '1px solid #E8E5E0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#FCA5A5'; e.currentTarget.style.color = '#EF4444'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E5E0'; e.currentTarget.style.color = '#78716C'; }}>暂不</button>
        </div>
      )}

      {isAccepted && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, background: '#FFF4EF', color: '#FF6B2C', border: '1px solid rgba(255,107,44,0.2)' }}>● 已接受</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/tracking" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#78716C', textDecoration: 'none' }}>
              <Navigation style={{ width: 13, height: 13 }} />查看地图
            </Link>
            <button onClick={onStart} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 12, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              开始服务 <ChevronRight style={{ width: 15, height: 15 }} />
            </button>
          </div>
        </div>
      )}

      {isInProgress && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: '#FFF4EF', border: '1px solid rgba(255,107,44,0.2)' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF6B2C', flexShrink: 0, animation: 'pulse 1.2s ease-in-out infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#FF6B2C', flex: 1 }}>服务进行中…</span>
            <Link to="/tracking" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#78716C', textDecoration: 'none' }}>
              <Navigation style={{ width: 12, height: 12 }} />实时地图
            </Link>
          </div>
          <button onClick={onComplete} style={{ padding: '13px', borderRadius: 12, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 3px 12px rgba(255,107,44,0.3)' }}>
            🏁 完成服务，提交报告
          </button>
        </div>
      )}

      {isCompleted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' }}>✓ 已完成</span>
          <span style={{ fontSize: 12, color: '#A8A29E' }}>等待宠物主确认评价</span>
        </div>
      )}
    </div>
  );
}
