import { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, Bell, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ChatWidget from '../components/ChatWidget';

const ROUTE: [number, number][] = [
  [76, 316], [76, 285], [80, 255], [100, 224],
  [134, 194], [174, 170], [220, 154], [268, 147],
  [316, 154], [358, 174], [388, 207], [400, 246],
  [391, 281], [361, 308], [320, 320], [274, 323],
  [229, 318], [187, 312], [148, 310], [106, 312], [80, 316],
];

const EVENTS = [
  { time: '09:02', icon: '🐾', text: '豆豆出发啦！今天状态很好' },
  { time: '09:08', icon: '💧', text: '在公园门口停留 — 喝水休息' },
  { time: '09:15', icon: '🌳', text: '进入中山公园绿地，开始自由奔跑' },
  { time: '09:22', icon: '📸', text: '张大伟发来了一张照片' },
  { time: '09:35', icon: '🏠', text: '正在返程，预计 5 分钟到家' },
];

export default function TrackingPage() {
  const [progress,   setProgress]   = useState(0);
  const [playing,    setPlaying]    = useState(false);
  const [elapsed,    setElapsed]    = useState(0);
  const [showModal,  setShowModal]  = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [notifOn,    setNotifOn]    = useState(false);

  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const nav   = useNavigate();
  const N     = ROUTE.length;

  useEffect(() => {
    if (playing && progress < N - 1) {
      timer.current = setInterval(() => {
        setProgress(p => { if (p >= N - 1) { setPlaying(false); return p; } return p + 1; });
        setElapsed(e => e + 3);
      }, 580);
    }
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [playing, N]);

  useEffect(() => {
    if (progress >= N - 1) {
      const t = setTimeout(() => setShowModal(true), 900);
      return () => clearTimeout(t);
    }
  }, [progress, N]);

  const cur  = ROUTE[progress];
  const done = progress >= N - 1;
  const pct  = Math.round((progress / (N - 1)) * 100);
  const km   = ((progress / (N - 1)) * 2.4).toFixed(1);
  const spd  = playing ? (1.8 + Math.random() * 0.6).toFixed(1) : '0.0';
  const eta  = Math.max(0, Math.round((N - 1 - progress) * 0.58 / 60));
  const fmt  = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const drawnPts = ROUTE.slice(0, progress + 1).map(([x, y]) => `${x},${y}`).join(' ');
  const ghostPts = ROUTE.map(([x, y]) => `${x},${y}`).join(' ');
  const events   = EVENTS.filter(
    (_, i) => i <= Math.floor((progress / (N - 1)) * (EVENTS.length - 1)),
  );

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => {
      nav('/review', {
        state: {
          walkerName: '张大伟', walkerEmoji: '🧑', km, elapsed, price: 45,
          steps: (parseFloat(km) * 1340).toFixed(0),
          reportNote: '豆豆今天状态非常棒！全程活泼好动，在公园里自由奔跑，喝了两次水。安全归还，下次见！',
        },
      });
    }, 700);
  };

  return (
    <>
      <div style={{ background: '#0a0f1e', minHeight: '100vh', color: 'white', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

        {/* ── Flight-style header ──────────────────────────── */}
        <div style={{ padding: '16px 20px 0', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Link to="/home" style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'white', textDecoration: 'none', flexShrink: 0 }}>
              <ChevronLeft style={{ width: 18, height: 18 }} />
            </Link>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>实时追踪</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: done ? 'rgba(34,197,94,0.15)' : 'rgba(255,107,53,0.15)', border: `1px solid ${done ? 'rgba(34,197,94,0.3)' : 'rgba(255,107,53,0.3)'}` }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: done ? '#22C55E' : '#FF6B35', animation: done ? 'none' : 'pulse 1.5s ease-in-out infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: done ? '#22C55E' : '#FF6B35' }}>
                {done ? '已完成' : playing ? 'LIVE' : '等待中'}
              </span>
            </div>
          </div>

          {/* Origin → Destination (flight-tracker style) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '16px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF6B35', margin: '0 auto 6px', boxShadow: '0 0 10px #FF6B35' }} />
              <p style={{ fontWeight: 800, fontSize: 16, color: 'white', marginBottom: 2 }}>小区南门</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>09:00 出发</p>
            </div>
            <div style={{ flex: 1, margin: '0 16px', position: 'relative' }}>
              <div style={{ height: 1, background: 'linear-gradient(to right, rgba(255,107,53,0.5), rgba(255,107,53,0.2), rgba(34,197,94,0.5))', position: 'relative' }}>
                <div style={{ position: 'absolute', left: `${pct}%`, top: '50%', transform: 'translate(-50%,-50%)', fontSize: 16, transition: 'left 0.5s ease' }}>🐶</div>
              </div>
              <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>{km} km 已走</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22C55E', margin: '0 auto 6px', boxShadow: done ? '0 0 10px #22C55E' : 'none', opacity: done ? 1 : 0.4 }} />
              <p style={{ fontWeight: 800, fontSize: 16, color: done ? 'white' : 'rgba(255,255,255,0.45)', marginBottom: 2 }}>中山公园</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>终点</p>
            </div>
          </div>
        </div>

        {/* ── Dark map with glowing path ───────────────────── */}
        <div style={{ position: 'relative' }}>
          <svg viewBox="0 0 560 340" width="100%" style={{ display: 'block' }}>
            <defs>
              <filter id="glow-path" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="glow-dot" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <radialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF6B35" stopOpacity="1" />
                <stop offset="100%" stopColor="#FF6B35" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Dark background */}
            <rect width="560" height="340" fill="#0a0f1e" />

            {/* City grid - roads */}
            <rect x="0"   y="0"   width="63"  height="340" fill="#111827" />
            <rect x="418" y="0"   width="142" height="340" fill="#111827" />
            <rect x="63"  y="0"   width="355" height="60"  fill="#111827" />
            <rect x="63"  y="300" width="355" height="40"  fill="#111827" />
            <rect x="63"  y="60"  width="24"  height="240" fill="#1a2744" />
            <rect x="63"  y="60"  width="355" height="20"  fill="#1a2744" />
            <rect x="63"  y="280" width="355" height="20"  fill="#1a2744" />

            {/* Road center lines */}
            <line x1="75" y1="60" x2="75" y2="280" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="12 10" />
            <line x1="87" y1="70" x2="418" y2="70"  stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="12 10" />
            <line x1="87" y1="290" x2="418" y2="290" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" strokeDasharray="12 10" />

            {/* Park - dark green */}
            <rect x="88" y="82" width="330" height="198" rx="16" fill="#0a1f0e" />
            <rect x="88" y="82" width="330" height="198" rx="16" fill="none" stroke="rgba(34,197,94,0.15)" strokeWidth="1" />
            <ellipse cx="253" cy="182" rx="100" ry="66" fill="none" stroke="rgba(34,197,94,0.08)" strokeWidth="1" strokeDasharray="6 9" />
            <text x="253" y="245" textAnchor="middle" fill="rgba(34,197,94,0.35)" fontSize="11" fontFamily="system-ui,sans-serif">中山公园</text>
            <text x="104" y="106" fill="rgba(34,197,94,0.3)" fontSize="14">🌲</text>
            <text x="390" y="106" fill="rgba(34,197,94,0.3)" fontSize="14">🌲</text>
            <text x="104" y="268" fill="rgba(34,197,94,0.3)" fontSize="14">🌲</text>
            <text x="390" y="268" fill="rgba(34,197,94,0.3)" fontSize="14">🌲</text>

            {/* Ghost route */}
            <polyline points={ghostPts} fill="none" stroke="rgba(255,107,53,0.1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="4 8" />

            {/* Glowing drawn route - outer glow */}
            {progress > 0 && (
              <polyline points={drawnPts} fill="none" stroke="#FF6B35" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow-path)" opacity="0.4" />
            )}
            {/* Glowing drawn route - main line */}
            {progress > 0 && (
              <polyline points={drawnPts} fill="none" stroke="#FF6B35" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            )}
            {/* Bright center of path */}
            {progress > 0 && (
              <polyline points={drawnPts} fill="none" stroke="#FFB380" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
            )}
            {/* Flowing animation */}
            {progress > 0 && playing && (
              <polyline points={drawnPts} fill="none" stroke="rgba(255,220,180,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="path-flow" />
            )}

            {/* Start point */}
            <circle cx={ROUTE[0][0]} cy={ROUTE[0][1]} r="14" fill="rgba(255,107,53,0.15)" />
            <circle cx={ROUTE[0][0]} cy={ROUTE[0][1]} r="7" fill="#FF6B35" filter="url(#glow-path)" />
            <text x={ROUTE[0][0]} y={ROUTE[0][1]} textAnchor="middle" dominantBaseline="central" fontSize="8" fontWeight="bold" fill="white">S</text>

            {/* End point */}
            <circle cx={ROUTE[N-1][0]} cy={ROUTE[N-1][1]} r="10" fill="rgba(34,197,94,0.1)" />
            <circle cx={ROUTE[N-1][0]} cy={ROUTE[N-1][1]} r="5" fill="none" stroke={done ? '#22C55E' : 'rgba(34,197,94,0.35)'} strokeWidth="2" />
            <circle cx={ROUTE[N-1][0]} cy={ROUTE[N-1][1]} r="2.5" fill={done ? '#22C55E' : 'rgba(34,197,94,0.5)'} />

            {/* Dog dot */}
            {!done && (
              <>
                <circle cx={cur[0]} cy={cur[1]} r="22" fill="url(#dotGlow)" opacity="0.4" style={{ transformOrigin: `${cur[0]}px ${cur[1]}px` }} />
                <circle cx={cur[0]} cy={cur[1]} r="14" fill="#FF6B35" filter="url(#glow-dot)" style={{ transition: 'cx 0.55s ease, cy 0.55s ease' }} />
                <text x={cur[0]} y={cur[1]} textAnchor="middle" dominantBaseline="central" fontSize="14" style={{ transition: 'x 0.55s ease, y 0.55s ease' }}>🐶</text>
              </>
            )}
          </svg>

          {/* Floating info card - right side */}
          <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '12px 14px', minWidth: 90 }}>
            <div style={{ marginBottom: 10 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>速度</p>
              <p style={{ color: 'white', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{spd}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>km/h</p>
            </div>
            <div style={{ marginBottom: 10 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>已走</p>
              <p style={{ color: '#FF6B35', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{km}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>公里</p>
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>返回</p>
              <p style={{ color: '#22C55E', fontWeight: 800, fontSize: 18, lineHeight: 1 }}>{done ? '已到' : `${eta}分`}</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>预计</p>
            </div>
          </div>
        </div>

        {/* ── Walker info bar ──────────────────────────────── */}
        <div style={{ margin: '0 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#FF6B35,#FF9245)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🧑</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 700, color: 'white', fontSize: 14, marginBottom: 3 }}>张大伟</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star style={{ width: 11, height: 11, fill: '#FBBF24', color: '#FBBF24' }} />
              <span style={{ color: '#FBBF24', fontSize: 12, fontWeight: 600 }}>4.9</span>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>· 312次完成 · ✓ 认证</span>
            </div>
          </div>
          <div style={{ fontWeight: 900, fontSize: 24, color: '#FF6B35', textAlign: 'right' }}>
            {pct}%
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginTop: 2 }}>完成度</p>
          </div>
        </div>

        {/* ── Progress bar ─────────────────────────────────── */}
        <div style={{ margin: '12px 16px' }}>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)' }}>
            <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: 'linear-gradient(90deg,#FF6B35,#FF9245)', transition: 'width 0.5s ease', boxShadow: '0 0 8px rgba(255,107,53,0.6)' }} />
          </div>
        </div>

        {/* ── Controls ─────────────────────────────────────── */}
        <div style={{ padding: '0 16px', display: 'flex', gap: 10 }}>
          {!done ? (
            <button onClick={() => setPlaying(!playing)}
              style={{ flex: 1, padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#FF6B35,#FF9245)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(255,107,53,0.4)' }}>
              {playing ? <><Pause style={{ width: 18, height: 18 }} />暂停追踪</> : <><Play style={{ width: 18, height: 18 }} />开始播放路线</>}
            </button>
          ) : (
            <button onClick={() => setShowModal(true)}
              style={{ flex: 1, padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#FF6B35,#FF9245)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,107,53,0.4)' }}>
              🏠 查看完成详情
            </button>
          )}
          {/* Receive notification button */}
          <button onClick={() => setNotifOn(!notifOn)}
            style={{ padding: '14px 18px', borderRadius: 14, background: notifOn ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${notifOn ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`, color: notifOn ? '#22C55E' : 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
            <Bell style={{ width: 16, height: 16 }} />
            {notifOn ? '已开启' : '通知'}
          </button>
        </div>

        {/* ── Timeline ─────────────────────────────────────── */}
        {events.length > 0 && (
          <div style={{ padding: '20px 16px' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>实时动态</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 20, bottom: 20, left: 17, width: 1, background: 'linear-gradient(to bottom, rgba(255,107,53,0.5), rgba(255,107,53,0.05))' }} />
              {events.map((ev, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, zIndex: 1 }}>
                    {ev.icon}
                  </div>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '10px 12px' }}>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{ev.text}</p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{ev.time}</p>
                  </div>
                </div>
              ))}
              {playing && !done && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,107,53,0.08)', border: '1px dashed rgba(255,107,53,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF6B35', animation: 'pulse 1.2s ease-in-out infinite' }} />
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,107,53,0.7)' }}>正在记录中…</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ height: 20 }} />
      </div>

      {/* ── Completion modal ──────────────────────────────── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div style={{ width: '100%', maxWidth: 380, background: '#131c38', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 28, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.6)', animation: 'fadeInScale 0.35s ease both' }}>
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
              <h2 style={{ fontWeight: 800, color: 'white', fontSize: 20, marginBottom: 6 }}>已安全归还</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>豆豆已由张大伟安全送回</p>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              {[{ icon: '📍', value: `${km}km`, label: '行走' }, { icon: '⏱', value: fmt(elapsed), label: '用时' }, { icon: '👟', value: `${(parseFloat(km)*1340).toFixed(0)}步`, label: '步数' }].map(s => (
                <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '10px 6px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, color: 'white', fontSize: 13 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 14, background: 'rgba(255,107,53,0.1)', border: '1px solid rgba(255,107,53,0.25)', marginBottom: 18 }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>服务费用（托管中）</p>
                <p style={{ color: '#FF6B35', fontWeight: 800, fontSize: 20, marginTop: 2 }}>¥45</p>
              </div>
              <span style={{ fontSize: 22 }}>🔒</span>
            </div>

            <button onClick={handleConfirm} disabled={confirming}
              style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#FF6B35,#FF9245)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: confirming ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(255,107,53,0.4)', opacity: confirming ? 0.7 : 1, marginBottom: 10 }}>
              {confirming
                ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                : '✅ 确认完成，去评价'}
            </button>
            <button onClick={() => setShowModal(false)}
              style={{ display: 'block', width: '100%', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 13, cursor: 'pointer', padding: '8px 0' }}>
              稍后确认
            </button>
          </div>
        </div>
      )}

      <ChatWidget partnerName="张大伟" partnerEmoji="🧑" />
    </>
  );
}
