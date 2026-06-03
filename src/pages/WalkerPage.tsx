import { useState, useRef, useEffect } from 'react';
import { Star, MapPin, Clock, ChevronRight, Bell, Navigation, Upload, Check, CheckCircle, Zap, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Types ─────────────────────────────────────────────────── */
type OrderStatus = 'new' | 'accepted' | 'in_progress' | 'completed' | 'declined';

interface OrderRequest {
  id: string;
  ownerName: string;
  petName: string;
  petBreed: string;
  petWeight: number;
  petEmoji: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  distance: number;
  status: OrderStatus;
}

interface NearbyOrder {
  id: string;
  petName: string;
  petBreed: string;
  petWeight: number;
  petEmoji: string;
  distance: number;
  price: number;
  type: 'instant' | 'scheduled';
  scheduledTime?: string;
  duration: number;
  ownerName: string;
  expiresIn: number; // seconds remaining (instant only)
  grabbed?: boolean;
}

/* ── Credit helpers ─────────────────────────────────────────── */
function creditLevel(score: number) {
  if (score >= 90) return { label: '金牌遛狗师', short: '金牌', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: '🏅' };
  if (score >= 80) return { label: '优秀遛狗师', short: '优秀', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', icon: '⭐' };
  if (score >= 60) return { label: '良好遛狗师', short: '良好', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: '👍' };
  return { label: '普通遛狗师', short: '普通', color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB', icon: '' };
}

const DEMO_CREDIT_HISTORY = [
  { delta: +2, reason: '张小美评价：非常专业，服务超出预期', time: '今天' },
  { delta: +2, reason: '王建国评价：准时到达，豆豆很喜欢', time: '昨天' },
  { delta: -5, reason: '匿名评价：遛狗时间未达约定时长', time: '3天前' },
  { delta: +2, reason: '李芳评价：实时汇报，很放心', time: '5天前' },
  { delta: +2, reason: '陈伟评价：服务专业，强烈推荐', time: '1周前' },
];

/* ── Static data ────────────────────────────────────────────── */
const INIT_ORDERS: OrderRequest[] = [
  { id: '1', ownerName: '李美华', petName: '豆豆', petBreed: '柴犬', petWeight: 12, petEmoji: '🐕', date: '2024-12-20', time: '09:00', duration: 60, price: 45, distance: 0.3, status: 'new' },
  { id: '2', ownerName: '王小刚', petName: '奶茶', petBreed: '泰迪', petWeight: 4, petEmoji: '🐩', date: '2024-12-20', time: '14:00', duration: 60, price: 40, distance: 0.8, status: 'new' },
  { id: '3', ownerName: '陈芳',   petName: '大黄', petBreed: '金毛', petWeight: 28, petEmoji: '🦮', date: '2024-12-19', time: '10:00', duration: 90, price: 65, distance: 1.1, status: 'accepted' },
];

const INSTANT_ORDERS: NearbyOrder[] = [
  { id: 'n1', petName: '球球', petBreed: '边牧', petWeight: 20, petEmoji: '🐕', distance: 0.4, price: 52, type: 'instant', duration: 60, ownerName: '赵明', expiresIn: 720 },
  { id: 'n2', petName: '糖糖', petBreed: '泰迪', petWeight: 3, petEmoji: '🐩', distance: 0.9, price: 38, type: 'instant', duration: 30, ownerName: '孙丽', expiresIn: 480 },
  { id: 'n3', petName: '旺旺', petBreed: '哈士奇', petWeight: 25, petEmoji: '🐺', distance: 1.3, price: 60, type: 'instant', duration: 60, ownerName: '刘伟', expiresIn: 300 },
];

const BOOKING_ORDERS: NearbyOrder[] = [
  { id: 'b1', petName: '小黑', petBreed: '拉布拉多', petWeight: 30, petEmoji: '🦮', distance: 0.6, price: 58, type: 'scheduled', scheduledTime: '明天 09:00', duration: 90, ownerName: '周芳', expiresIn: 0 },
  { id: 'b2', petName: '豆腐', petBreed: '柯基', petWeight: 13, petEmoji: '🐕', distance: 1.1, price: 45, type: 'scheduled', scheduledTime: '明天 15:30', duration: 60, ownerName: '吴建', expiresIn: 0 },
  { id: 'b3', petName: '奥利奥', petBreed: '法斗', petWeight: 10, petEmoji: '🐾', distance: 1.8, price: 42, type: 'scheduled', scheduledTime: '后天 10:00', duration: 60, ownerName: '林小红', expiresIn: 0 },
];

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

/* ── Countdown hook ─────────────────────────────────────────── */
function useCountdown(initial: number) {
  const [t, setT] = useState(initial);
  useEffect(() => {
    if (t <= 0) return;
    const id = setInterval(() => setT(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [t]);
  const mm = String(Math.floor(t / 60)).padStart(2, '0');
  const ss = String(t % 60).padStart(2, '0');
  return { t, display: `${mm}:${ss}` };
}

/* ── Instant order card ─────────────────────────────────────── */
function InstantCard({ order, onGrab }: { order: NearbyOrder; onGrab: (id: string) => void }) {
  const { t, display } = useCountdown(order.expiresIn);
  const urgent = t < 120;

  if (order.grabbed) return (
    <div style={{ ...card, padding: 16, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.7 }}>
      <span style={{ fontSize: 28 }}>{order.petEmoji}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, color: '#1C1917', fontSize: 14 }}>{order.petName} · {order.petBreed}</p>
        <p style={{ fontSize: 12, color: '#A8A29E' }}>已抢单</p>
      </div>
      <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, background: '#F0FDF4', color: '#16A34A', fontWeight: 600 }}>✓ 已接单</span>
    </div>
  );

  if (t === 0) return (
    <div style={{ ...card, padding: 16, display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5 }}>
      <span style={{ fontSize: 28 }}>{order.petEmoji}</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 700, color: '#1C1917', fontSize: 14 }}>{order.petName} · {order.petBreed}</p>
        <p style={{ fontSize: 12, color: '#EF4444' }}>订单已超时取消</p>
      </div>
    </div>
  );

  return (
    <div style={{ ...card, padding: 16, border: urgent ? '1.5px solid rgba(239,68,68,0.4)' : '1px solid #E8E5E0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F9F8F6', border: '1px solid #E8E5E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{order.petEmoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ fontWeight: 700, color: '#1C1917', fontSize: 15 }}>{order.petName}</span>
            <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: '#F5F4F2', color: '#78716C' }}>{order.petBreed}</span>
            <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: '#F5F4F2', color: '#78716C' }}>{order.petWeight}kg</span>
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#78716C' }}>
            <span>距您 {order.distance} km</span>
            <span>·</span>
            <span>{order.duration} 分钟</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontWeight: 800, fontSize: 20, color: '#FF6B2C', lineHeight: 1 }}>¥{order.price}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 4, justifyContent: 'flex-end' }}>
            <Clock style={{ width: 11, height: 11, color: urgent ? '#EF4444' : '#A8A29E' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: urgent ? '#EF4444' : '#A8A29E', fontVariantNumeric: 'tabular-nums' }}>{display}</span>
          </div>
        </div>
      </div>
      <button onClick={() => onGrab(order.id)}
        style={{ width: '100%', padding: '11px', borderRadius: 12, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 2px 8px rgba(255,107,44,0.35)' }}>
        <Zap style={{ width: 15, height: 15 }} /> 立即抢单
      </button>
    </div>
  );
}

/* ── Grab confirm modal ─────────────────────────────────────── */
function GrabModal({ order, onClose }: { order: NearbyOrder; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 24, padding: 28, maxWidth: 340, width: '100%', textAlign: 'center', animation: 'fadeInUp 0.3s ease both' }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
        <h3 style={{ fontWeight: 800, color: '#1C1917', fontSize: 20, marginBottom: 8 }}>抢单成功！</h3>
        <p style={{ color: '#78716C', fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>
          您已成功接单 <strong style={{ color: '#FF6B2C' }}>{order.petName}（{order.petBreed}）</strong><br />
          宠物主：{order.ownerName} · 距您 {order.distance} km<br />
          报酬：<strong style={{ color: '#FF6B2C' }}>¥{order.price}</strong> · {order.duration} 分钟
        </p>
        <button onClick={onClose}
          style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', color: 'white', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 10px rgba(255,107,44,0.3)' }}>
          好的，开始准备
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════ */
export default function WalkerPage() {
  const { user } = useAuth();
  const isDemo = user?.email === 'walker@demo.com';
  const stats  = isDemo ? DEMO_STATS : NEW_STATS;
  const creditScore = isDemo ? 92 : 60;
  const lvl = creditLevel(creditScore);

  const [orders,     setOrders]     = useState<OrderRequest[]>(isDemo ? INIT_ORDERS : []);
  const [mainTab,    setMainTab]    = useState<'orders' | 'nearby' | 'credit' | 'wallet'>('orders');
  const [orderTab,   setOrderTab]   = useState<'new' | 'active'>('new');
  const [nearbyTab,  setNearbyTab]  = useState<'instant' | 'scheduled'>('instant');
  const [online,     setOnline]     = useState(true);
  const [insuranceActive, setInsAct] = useState(false);
  const [activating, setActivating] = useState(false);

  /* Nearby orders state */
  const [nearbyOrders, setNearbyOrders] = useState<NearbyOrder[]>([...INSTANT_ORDERS, ...BOOKING_ORDERS]);
  const [grabbedOrder, setGrabbedOrder] = useState<NearbyOrder | null>(null);

  /* Service report modal */
  const [reportTarget,  setReportTarget]  = useState<OrderRequest | null>(null);
  const [reportNote,    setReportNote]    = useState('');
  const [reportPhotos,  setReportPhotos]  = useState<string[]>([]);
  const [submittingRep, setSubRep]        = useState(false);
  const [reportDone,    setReportDone]    = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const activateIns = () => {
    setActivating(true);
    setTimeout(() => { setInsAct(true); setActivating(false); }, 1400);
  };

  const accept   = (id: string) => setOrders(p => p.map(o => o.id === id ? { ...o, status: 'accepted'    as OrderStatus } : o));
  const decline  = (id: string) => setOrders(p => p.map(o => o.id === id ? { ...o, status: 'declined'    as OrderStatus } : o));
  const startSvc = (id: string) => setOrders(p => p.map(o => o.id === id ? { ...o, status: 'in_progress' as OrderStatus } : o));

  const openReport = (order: OrderRequest) => {
    setReportTarget(order); setReportNote(''); setReportPhotos([]); setReportDone(false);
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
      setSubRep(false); setReportDone(true);
    }, 900);
  };

  const handleGrab = (id: string) => {
    const order = nearbyOrders.find(o => o.id === id);
    if (!order) return;
    setNearbyOrders(p => p.map(o => o.id === id ? { ...o, grabbed: true } : o));
    setGrabbedOrder(order);
  };

  const handleApply = (id: string) => {
    setNearbyOrders(p => p.map(o => o.id === id ? { ...o, grabbed: true } : o));
  };

  const newCount    = orders.filter(o => o.status === 'new').length;
  const activeCount = orders.filter(o => ['accepted', 'in_progress'].includes(o.status)).length;
  const visibleOrders = orders.filter(o =>
    orderTab === 'new'
      ? o.status === 'new'
      : ['accepted', 'in_progress', 'completed'].includes(o.status),
  );

  const instantList   = nearbyOrders.filter(o => o.type === 'instant');
  const scheduledList = nearbyOrders.filter(o => o.type === 'scheduled');

  const MAIN_TABS = [
    { id: 'orders' as const,  label: '我的订单', badge: newCount > 0 ? newCount : 0 },
    { id: 'nearby' as const,  label: '附近订单', badge: instantList.filter(o => !o.grabbed).length },
    { id: 'credit' as const,  label: '信用档案', badge: 0 },
    { id: 'wallet' as const,  label: '收益中心', badge: 0 },
  ];

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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h2 style={{ fontWeight: 800, color: '#1C1917', fontSize: 20, lineHeight: 1 }}>{user?.name || '张大伟'}</h2>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', fontWeight: 600 }}>✓ 已认证</span>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: lvl.bg, color: lvl.color, border: `1px solid ${lvl.border}`, fontWeight: 700 }}>
                      {lvl.icon} {lvl.short}
                    </span>
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <button onClick={() => setOnline(!online)} style={{ width: 50, height: 27, borderRadius: 14, background: online ? '#FF6B2C' : '#E8E5E0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', boxShadow: online ? '0 2px 8px rgba(255,107,44,0.3)' : 'none' }}>
                  <span style={{ position: 'absolute', top: 3, width: 21, height: 21, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left 0.25s', left: online ? 26 : 3 }} />
                </button>
                <span style={{ fontSize: 11, fontWeight: 600, color: online ? '#FF6B2C' : '#A8A29E' }}>{online ? '接单中' : '休息中'}</span>
              </div>
            </div>

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

          {/* ── Main tabs ───────────────────────────────── */}
          <div style={{ maxWidth: 768, margin: '0 auto', padding: '0 20px', display: 'flex', borderTop: '1px solid #F5F4F2' }}>
            {MAIN_TABS.map(tab => (
              <button key={tab.id} onClick={() => setMainTab(tab.id)}
                style={{ flex: 1, padding: '14px 0', fontSize: 13, fontWeight: mainTab === tab.id ? 700 : 500, color: mainTab === tab.id ? '#FF6B2C' : '#78716C', background: 'none', border: 'none', cursor: 'pointer', borderBottom: mainTab === tab.id ? '2px solid #FF6B2C' : '2px solid transparent', transition: 'all 0.2s', position: 'relative' }}>
                {tab.label}
                {tab.badge > 0 && (
                  <span style={{ position: 'absolute', top: 8, right: '12%', width: 16, height: 16, borderRadius: '50%', background: '#EF4444', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tab.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 768, margin: '0 auto', padding: '16px 20px 0' }}>

          {/* ════════════════ TAB: 我的订单 ════════════════ */}
          {mainTab === 'orders' && (
            <>
              {/* Insurance */}
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

              {/* Order tabs */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ fontWeight: 700, color: '#1C1917', fontSize: 15 }}>订单管理</h3>
                {newCount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: '#FFF4EF', border: '1px solid rgba(255,107,44,0.25)' }}>
                    <Bell style={{ width: 13, height: 13, color: '#FF6B2C' }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#FF6B2C' }}>{newCount} 个新请求</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', background: '#F5F4F2', borderRadius: 14, padding: 4, marginBottom: 16 }}>
                {(['new', 'active'] as const).map(tab => (
                  <button key={tab} onClick={() => setOrderTab(tab)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: orderTab === tab ? 'white' : 'transparent',
                    color: orderTab === tab ? '#1C1917' : '#78716C',
                    boxShadow: orderTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}>
                    {tab === 'new' ? `待接受${newCount > 0 ? ` (${newCount})` : ''}` : `我的服务${activeCount > 0 ? ` (${activeCount})` : ''}`}
                  </button>
                ))}
              </div>

              {visibleOrders.length === 0 ? (
                <div style={{ ...card, padding: '48px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.35 }}>🐾</div>
                  <p style={{ color: '#9B9B9B', fontSize: 14 }}>
                    {orderTab === 'new' ? '暂无新的遛狗请求' : '还没有服务记录'}
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {visibleOrders.map((order, i) => (
                    <OrderCard key={order.id} order={order} index={i}
                      onAccept={() => accept(order.id)}
                      onDecline={() => decline(order.id)}
                      onStart={() => startSvc(order.id)}
                      onComplete={() => openReport(order)} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ════════════════ TAB: 附近订单 ════════════════ */}
          {mainTab === 'nearby' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '12px 16px', background: '#FFF4EF', borderRadius: 14, border: '1px solid rgba(255,107,44,0.2)' }}>
                <Zap style={{ width: 16, height: 16, color: '#FF6B2C', flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: '#FF6B2C', fontWeight: 600 }}>即时单 15 分钟无人接自动取消 · 预约单主人 24 小时内确认</p>
              </div>

              <div style={{ display: 'flex', background: '#F5F4F2', borderRadius: 14, padding: 4, marginBottom: 16 }}>
                {([
                  { id: 'instant'   as const, label: `⚡ 即时单 (${instantList.filter(o => !o.grabbed).length})` },
                  { id: 'scheduled' as const, label: `📅 预约单 (${scheduledList.filter(o => !o.grabbed).length})` },
                ]).map(tab => (
                  <button key={tab.id} onClick={() => setNearbyTab(tab.id)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: nearbyTab === tab.id ? 'white' : 'transparent',
                    color: nearbyTab === tab.id ? '#1C1917' : '#78716C',
                    boxShadow: nearbyTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}>{tab.label}</button>
                ))}
              </div>

              {nearbyTab === 'instant' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {instantList.map(o => (
                    <InstantCard key={o.id} order={o} onGrab={handleGrab} />
                  ))}
                </div>
              )}

              {nearbyTab === 'scheduled' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {scheduledList.map(o => (
                    <div key={o.id} style={{ ...card, padding: 16, opacity: o.grabbed ? 0.65 : 1 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F9F8F6', border: '1px solid #E8E5E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{o.petEmoji}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <span style={{ fontWeight: 700, color: '#1C1917', fontSize: 15 }}>{o.petName}</span>
                            <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: '#F5F4F2', color: '#78716C' }}>{o.petBreed}</span>
                            <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: '#F5F4F2', color: '#78716C' }}>{o.petWeight}kg</span>
                          </div>
                          <div style={{ display: 'flex', gap: 10, fontSize: 12, color: '#78716C' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Calendar style={{ width: 11, height: 11 }} />{o.scheduledTime}</span>
                            <span>·</span>
                            <span>{o.duration}分钟</span>
                            <span>·</span>
                            <span>{o.distance} km</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontWeight: 800, fontSize: 20, color: '#FF6B2C', lineHeight: 1 }}>¥{o.price}</p>
                          <p style={{ fontSize: 11, color: '#A8A29E', marginTop: 3 }}>{o.ownerName}</p>
                        </div>
                      </div>
                      {o.grabbed ? (
                        <div style={{ padding: '8px 14px', borderRadius: 10, background: '#F0FDF4', border: '1px solid #BBF7D0', textAlign: 'center' }}>
                          <span style={{ fontSize: 13, color: '#16A34A', fontWeight: 600 }}>✓ 已申请 · 等待宠物主确认（24小时内）</span>
                        </div>
                      ) : (
                        <button onClick={() => handleApply(o.id)}
                          style={{ width: '100%', padding: '11px', borderRadius: 12, background: '#F5F4F2', color: '#1C1917', border: '1.5px solid #E8E5E0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                          申请接单
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ════════════════ TAB: 信用档案 ════════════════ */}
          {mainTab === 'credit' && (
            <>
              {/* Score card */}
              <div style={{ ...card, padding: 24, marginBottom: 14, background: `linear-gradient(135deg, ${lvl.bg}, white)`, borderColor: lvl.border }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  {/* SVG gauge */}
                  <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
                    <svg viewBox="0 0 88 88" style={{ width: 88, height: 88, transform: 'rotate(-90deg)' }}>
                      <circle cx="44" cy="44" r="36" fill="none" stroke="#F0EFED" strokeWidth="8" />
                      <circle cx="44" cy="44" r="36" fill="none" stroke={lvl.color} strokeWidth="8"
                        strokeDasharray={`${(creditScore / 100) * 226} 226`}
                        strokeLinecap="round" />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontWeight: 900, fontSize: 22, color: lvl.color, lineHeight: 1 }}>{creditScore}</span>
                      <span style={{ fontSize: 10, color: '#A8A29E', marginTop: 2 }}>/ 100</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 28 }}>{lvl.icon}</span>
                      <span style={{ fontWeight: 800, fontSize: 18, color: '#1C1917' }}>{lvl.label}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#78716C', lineHeight: 1.6 }}>
                      每条好评 <strong style={{ color: '#16A34A' }}>+2分</strong>，差评 <strong style={{ color: '#EF4444' }}>-5分</strong>
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                      {[
                        { min: 0,  max: 59,  label: '普通', color: '#6B7280' },
                        { min: 60, max: 79,  label: '良好', color: '#2563EB' },
                        { min: 80, max: 89,  label: '优秀', color: '#059669' },
                        { min: 90, max: 100, label: '金牌', color: '#D97706' },
                      ].map(tier => (
                        <span key={tier.label} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'white', color: tier.color, border: `1px solid ${tier.color}40`, fontWeight: 600 }}>
                          {tier.min}-{tier.max} {tier.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* History */}
              <div style={{ ...card, padding: 20 }}>
                <h3 style={{ fontWeight: 700, color: '#1C1917', fontSize: 15, marginBottom: 16 }}>积分变化记录</h3>
                {(isDemo ? DEMO_CREDIT_HISTORY : []).length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, opacity: 0.3, marginBottom: 8 }}>📋</div>
                    <p style={{ color: '#9B9B9B', fontSize: 13 }}>暂无积分记录</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {DEMO_CREDIT_HISTORY.map((h, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 0', borderBottom: i < DEMO_CREDIT_HISTORY.length - 1 ? '1px solid #F5F4F2' : 'none' }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: h.delta > 0 ? '#F0FDF4' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontWeight: 800, fontSize: 13, color: h.delta > 0 ? '#16A34A' : '#EF4444' }}>
                            {h.delta > 0 ? `+${h.delta}` : h.delta}
                          </span>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, color: '#1C1917', lineHeight: 1.5 }}>{h.reason}</p>
                          <p style={{ fontSize: 11, color: '#A8A29E', marginTop: 3 }}>{h.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ ...card, padding: 16, marginTop: 14, background: '#FFFBEB', borderColor: '#FDE68A' }}>
                <p style={{ fontSize: 13, color: '#92400E', lineHeight: 1.7 }}>
                  💡 <strong>信用分影响搜索排名</strong>：信用分越高，在宠物主搜索时排名越靠前，获得更多接单机会。
                  90分以上的金牌遛狗师将获得平台额外流量扶持。
                </p>
              </div>
            </>
          )}

          {/* ════════════════ TAB: 收益中心（金融风格）════════════════ */}
          {mainTab === 'wallet' && (
            <div>
              {/* Balance hero */}
              <div style={{ background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)', borderRadius: 22, padding: '24px 22px', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,107,44,0.1)' }} />
                <div style={{ position: 'absolute', bottom: -30, left: -10, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 6 }}>你好，{user?.name || '张大伟'} 🔥</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 12 }}>本月总收益</p>
                <p style={{ fontWeight: 900, fontSize: 42, color: 'white', lineHeight: 1, marginBottom: 4, letterSpacing: -1 }}>
                  {isDemo ? '¥1,280' : '¥0'}
                  <span style={{ fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.5)', marginLeft: 6 }}>.00</span>
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
                  {isDemo ? '↑ 比上月增长 ¥320' : '接单后开始结算'}
                </p>
                {/* Quick actions */}
                <div style={{ display: 'flex', gap: 16 }}>
                  {[
                    { icon: '💸', label: '提现' },
                    { icon: '📋', label: '账单' },
                    { icon: '🛡', label: '保险' },
                    { icon: '⋯', label: '更多' },
                  ].map(a => (
                    <div key={a.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, cursor: 'pointer' }}>
                        {a.icon}
                      </div>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{a.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Horizontal scroll cards */}
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', marginBottom: 14 }}>
                {[
                  { label: '本月收入', value: isDemo ? '¥1,280' : '¥0', sub: '12月', gradA: '#FF6B35', gradB: '#FF9245' },
                  { label: '待到账',   value: isDemo ? '¥105' : '¥0',   sub: '3笔托管中', gradA: '#8B7FD4', gradB: '#A78BFA' },
                  { label: '已提现',   value: isDemo ? '¥980' : '¥0',   sub: '本月累计', gradA: '#06B6D4', gradB: '#0EA5E9' },
                ].map(c => (
                  <div key={c.label} style={{ minWidth: 150, borderRadius: 18, padding: '18px 16px', background: `linear-gradient(135deg,${c.gradA},${c.gradB})`, flexShrink: 0 }}>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 8 }}>{c.label}</p>
                    <p style={{ color: 'white', fontWeight: 900, fontSize: 22, lineHeight: 1, marginBottom: 6 }}>{c.value}</p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{c.sub}</p>
                  </div>
                ))}
              </div>

              {/* Recent orders */}
              <div style={{ ...card, padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <h3 style={{ fontWeight: 700, color: '#1C1917', fontSize: 15, margin: 0 }}>最近订单</h3>
                  <span style={{ fontSize: 12, color: '#A8A29E' }}>2024-12</span>
                </div>
                {isDemo ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {DEMO_TRANSACTIONS.map(tx => (
                      <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#FF6B35,#FF9245)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{tx.petEmoji}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, color: '#1C1917', fontWeight: 600 }}>{tx.petName} · {tx.breed}</p>
                          <p style={{ fontSize: 12, color: '#A8A29E', marginTop: 2 }}>{tx.owner} · {tx.date}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 800, fontSize: 15, color: '#1C1917' }}>+¥{tx.amount}</p>
                          <span style={{ fontSize: 11, color: tx.status === 'pending' ? '#FF6B2C' : '#16A34A', fontWeight: 600, display: 'block', marginTop: 2 }}>
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
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ══ Grab confirm modal ═══════════════════════════════ */}
      {grabbedOrder && <GrabModal order={grabbedOrder} onClose={() => setGrabbedOrder(null)} />}

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

                <div style={{ background: '#FFF4EF', border: '1px solid rgba(255,107,44,0.18)', borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{reportTarget.petEmoji}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, color: '#1C1917', fontSize: 14 }}>{reportTarget.petName} · {reportTarget.petBreed}</p>
                    <p style={{ color: '#78716C', fontSize: 12, marginTop: 2 }}>宠物主：{reportTarget.ownerName} · {reportTarget.duration}分钟 · ¥{reportTarget.price}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                  {[{ icon: '📍', v: '2.3 km', l: '行走距离' }, { icon: '⏱', v: '58:24', l: '服务时长' }, { icon: '👟', v: '3,120步', l: '步数' }].map(s => (
                    <div key={s.l} style={{ background: '#F9F8F6', border: '1px solid #E8E5E0', borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                      <p style={{ fontWeight: 700, color: '#1C1917', fontSize: 12 }}>{s.v}</p>
                      <p style={{ color: '#A8A29E', fontSize: 10, marginTop: 2 }}>{s.l}</p>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#78716C', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>狗狗状态描述 *</label>
                  <textarea value={reportNote} onChange={e => setReportNote(e.target.value)} rows={3}
                    placeholder="描述本次服务情况：狗狗精神状态、遛步表现、是否有异常…"
                    style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', background: '#F5F4F2', border: '1px solid #E8E5E0', borderRadius: 12, color: '#1C1917', fontSize: 13, outline: 'none', resize: 'none', lineHeight: 1.65, fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = '#FF6B2C'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,44,0.08)'; }}
                    onBlur={e => { e.target.style.borderColor = '#E8E5E0'; e.target.style.background = '#F5F4F2'; e.target.style.boxShadow = 'none'; }} />
                </div>

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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: '#F9F8F6', border: '1px solid #E8E5E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{order.petEmoji}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
              <span style={{ fontWeight: 700, color: '#1C1917', fontSize: 15 }}>{order.petName}</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#F5F4F2', color: '#78716C' }}>{order.petBreed}</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#F5F4F2', color: '#78716C' }}>{order.petWeight}kg</span>
            </div>
            <p style={{ color: '#78716C', fontSize: 12 }}>宠物主：{order.ownerName}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#FF6B2C' }}>¥{order.price}</div>
          <div style={{ fontSize: 11, color: '#A8A29E', marginTop: 2 }}>{order.duration}分钟</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid #F5F4F2' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '5px 12px', borderRadius: 20, background: '#F5F4F2', color: '#78716C' }}>
          <Clock style={{ width: 11, height: 11 }} />{order.date} {order.time}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '5px 12px', borderRadius: 20, background: '#F5F4F2', color: '#78716C' }}>
          <MapPin style={{ width: 11, height: 11 }} />距您 {order.distance} km
        </span>
      </div>

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
