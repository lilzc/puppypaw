import { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, Star, MapPin } from 'lucide-react';
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

const card: React.CSSProperties = {
  background: '#FFFFFF', border: '1px solid #E8E5E0', borderRadius: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

export default function TrackingPage() {
  const [progress,   setProgress]   = useState(0);
  const [playing,    setPlaying]    = useState(false);
  const [elapsed,    setElapsed]    = useState(0);
  const [showModal,  setShowModal]  = useState(false);
  const [confirming, setConfirming] = useState(false);

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
      <div style={{ background: '#F9F8F6', minHeight: '100vh', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>

          {/* ── Header ──────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 16px' }}>
            <Link to="/owner" style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '1px solid #E8E5E0', color: '#78716C', textDecoration: 'none', flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <ChevronLeft style={{ width: 18, height: 18 }} />
            </Link>
            <div>
              <h1 style={{ fontWeight: 800, color: '#1C1917', fontSize: 19, lineHeight: 1 }}>实时追踪</h1>
              <p style={{ color: '#78716C', fontSize: 12, marginTop: 4 }}>豆豆 · 遛狗师：张大伟</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, background: done ? '#F0FDF4' : '#FFF4EF', border: `1px solid ${done ? '#BBF7D0' : 'rgba(255,107,44,0.25)'}` }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: done ? '#16A34A' : '#FF6B2C', animation: done ? 'none' : 'pulse 1.5s ease-in-out infinite' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: done ? '#16A34A' : '#FF6B2C' }}>
                {done ? '已完成' : playing ? 'LIVE' : '等待中'}
              </span>
            </div>
          </div>

          {/* ── Map ─────────────────────────────────────────── */}
          <div style={{ margin: '0 16px', borderRadius: 20, overflow: 'hidden', border: '1px solid #E8E5E0', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
            <svg viewBox="0 0 560 380" width="100%" style={{ display: 'block' }}>
              <defs>
                <filter id="rg" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="dg" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="4" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Light map background */}
              <rect width="560" height="380" fill="#F0EDE8" />

              {/* City blocks */}
              <rect x="0"   y="0"   width="63"  height="380" fill="#E5E0D8" />
              <rect x="418" y="0"   width="142" height="380" fill="#E5E0D8" />
              <rect x="63"  y="0"   width="355" height="63"  fill="#E5E0D8" />
              <rect x="63"  y="326" width="355" height="54"  fill="#E5E0D8" />

              {/* Streets */}
              <rect x="63" y="64"  width="355" height="23" fill="#D6D0C8" />
              <rect x="63" y="303" width="355" height="23" fill="#D6D0C8" />
              <rect x="63" y="64"  width="24"  height="262" fill="#D6D0C8" />
              <line x1="75" y1="64"  x2="75"  y2="303" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeDasharray="14 12"/>
              <line x1="87" y1="75"  x2="418" y2="75"  stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="14 12"/>
              <line x1="87" y1="314" x2="418" y2="314" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="14 12"/>

              {/* Park */}
              <rect x="88" y="88" width="330" height="215" rx="18" fill="#C8E6C9" />
              <rect x="88" y="88" width="330" height="215" rx="18" fill="none" stroke="#A5D6A7" strokeWidth="1.5" />
              <ellipse cx="253" cy="196" rx="108" ry="72" fill="none" stroke="rgba(76,175,80,0.2)" strokeWidth="1" strokeDasharray="6 9" />
              <text x="253" y="265" textAnchor="middle" fill="rgba(46,125,50,0.6)" fontSize="11" fontFamily="system-ui,sans-serif">🌳 中山公园</text>
              <text x="100" y="112" fill="rgba(46,125,50,0.7)" fontSize="14">🌲</text>
              <text x="390" y="112" fill="rgba(46,125,50,0.7)" fontSize="14">🌲</text>
              <text x="100" y="290" fill="rgba(46,125,50,0.7)" fontSize="14">🌲</text>
              <text x="390" y="290" fill="rgba(46,125,50,0.7)" fontSize="14">🌲</text>

              {/* Ghost route */}
              <polyline points={ghostPts} fill="none" stroke="rgba(255,107,44,0.2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 10" />

              {/* Drawn route */}
              {progress > 0 && (
                <polyline points={drawnPts} fill="none" stroke="#FF6B2C" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter="url(#rg)" />
              )}
              {progress > 0 && (
                <polyline points={drawnPts} fill="none" stroke="#FFBD7A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              )}
              {progress > 0 && playing && (
                <polyline points={drawnPts} fill="none" stroke="#FFE999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="path-flow" opacity="0.8" />
              )}

              {/* Start */}
              <circle cx={ROUTE[0][0]} cy={ROUTE[0][1]} r="9" fill="#FF6B2C" filter="url(#rg)" />
              <text x={ROUTE[0][0]} y={ROUTE[0][1]} textAnchor="middle" dominantBaseline="central" fontSize="9" fontWeight="bold" fill="white" fontFamily="system-ui">S</text>

              {/* End */}
              <circle cx={ROUTE[N-1][0]} cy={ROUTE[N-1][1]} r="7" fill="none" stroke="rgba(255,107,44,0.5)" strokeWidth="2" />
              <circle cx={ROUTE[N-1][0]} cy={ROUTE[N-1][1]} r="3.5" fill="rgba(255,107,44,0.7)" />

              {/* Dog */}
              {!done && (
                <>
                  <circle cx={cur[0]} cy={cur[1]} r="20" fill="rgba(255,107,44,0.1)" className="anim-ripple" style={{ transformOrigin: `${cur[0]}px ${cur[1]}px` }} />
                  <circle cx={cur[0]} cy={cur[1]} r="16" fill="#FF6B2C" filter="url(#dg)" style={{ transition: 'cx 0.55s ease, cy 0.55s ease' }} />
                  <text x={cur[0]} y={cur[1]} textAnchor="middle" dominantBaseline="central" fontSize="17" style={{ transition: 'x 0.55s ease, y 0.55s ease' }}>🐶</text>
                </>
              )}
            </svg>
          </div>

          {/* ── Info card ────────────────────────────────────── */}
          <div style={{ ...card, margin: '12px 16px 0', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 50, height: 50, borderRadius: 14, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🧑</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: '#1C1917', fontSize: 14, lineHeight: 1 }}>张大伟</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5 }}>
                  <Star style={{ width: 12, height: 12, fill: '#FBBF24', color: '#FBBF24' }} />
                  <span style={{ color: '#D97706', fontSize: 12, fontWeight: 600 }}>4.9</span>
                  <span style={{ color: '#A8A29E', fontSize: 12 }}>· 312次完成 · ✓ 认证</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: 28, color: '#FF6B2C', lineHeight: 1 }}>{pct}%</div>
                <div style={{ fontSize: 11, color: '#A8A29E', marginTop: 3 }}>进度</div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[{ label: '已行走', value: `${km} km`, icon: '📍' }, { label: '用时', value: fmt(elapsed), icon: '⏱' }, { label: '步数', value: `${(parseFloat(km)*1340).toFixed(0)}`, icon: '👟' }].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '10px 0', borderRadius: 14, background: '#F9F8F6', border: '1px solid #E8E5E0' }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, color: '#1C1917', fontSize: 13 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: '#A8A29E', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div style={{ height: 6, borderRadius: 3, background: '#E8E5E0', marginBottom: 14 }}>
              <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: 'linear-gradient(90deg,#FF6B2C,#FF9245)', transition: 'width 0.5s ease' }} />
            </div>

            {/* Play/complete */}
            {!done ? (
              <button onClick={() => setPlaying(!playing)}
                style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 3px 12px rgba(255,107,44,0.3)' }}>
                {playing ? <><Pause style={{ width: 18, height: 18 }} /> 暂停追踪</> : <><Play style={{ width: 18, height: 18 }} /> 开始播放路线</>}
              </button>
            ) : (
              <button onClick={() => setShowModal(true)}
                style={{ width: '100%', padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 3px 12px rgba(255,107,44,0.3)' }}>
                🏠 查看服务完成详情
              </button>
            )}
          </div>

          {/* ── Timeline ─────────────────────────────────────── */}
          <div style={{ padding: '24px 16px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <MapPin style={{ width: 15, height: 15, color: '#FF6B2C' }} />
              <h3 style={{ fontWeight: 700, color: '#1C1917', fontSize: 15 }}>实时动态</h3>
              {events.length > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: 11, padding: '3px 10px', borderRadius: 20, background: '#FFF4EF', color: '#FF6B2C', fontWeight: 600, border: '1px solid rgba(255,107,44,0.2)' }}>
                  {events.length} 条更新
                </span>
              )}
            </div>

            {events.length === 0 ? (
              <div style={{ ...card, padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.4 }}>🐾</div>
                <p style={{ color: '#A8A29E', fontSize: 13 }}>点击「开始播放路线」后显示实时动态</p>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: 20, bottom: 20, left: 19, width: 2, background: 'linear-gradient(to bottom,#FF6B2C,rgba(255,107,44,0.1))', borderRadius: 1 }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {events.map((ev, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }} className="anim-left">
                      <div style={{ width: 40, height: 40, borderRadius: 14, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, zIndex: 1, boxShadow: '0 3px 10px rgba(255,107,44,0.25)' }}>
                        {ev.icon}
                      </div>
                      <div style={{ flex: 1, background: 'white', border: '1px solid #E8E5E0', borderRadius: 14, padding: '12px 14px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                        <p style={{ fontSize: 13, color: '#1C1917', lineHeight: 1.5 }}>{ev.text}</p>
                        <p style={{ fontSize: 11, color: '#A8A29E', marginTop: 4 }}>{ev.time}</p>
                      </div>
                    </div>
                  ))}
                  {playing && !done && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }} className="anim-fade-up">
                      <div style={{ width: 40, height: 40, borderRadius: 14, background: '#FFF4EF', border: '1.5px dashed rgba(255,107,44,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF6B2C', animation: 'pulse 1.2s ease-in-out infinite' }} />
                      </div>
                      <p style={{ fontSize: 12, color: '#FF6B2C' }}>正在记录中…</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Completion modal ──────────────────────────────── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px', zIndex: 200, background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ width: '100%', maxWidth: 380, background: 'white', borderRadius: 28, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.2)', animation: 'fadeInScale 0.35s ease both' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏠</div>
              <h2 style={{ fontWeight: 800, color: '#1C1917', fontSize: 20, marginBottom: 6 }}>已安全归还</h2>
              <p style={{ color: '#78716C', fontSize: 14 }}>豆豆已由张大伟安全送回</p>
            </div>

            {/* Walker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F9F8F6', borderRadius: 16, padding: '12px 16px', marginBottom: 14, border: '1px solid #E8E5E0' }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🧑</div>
              <div>
                <p style={{ fontWeight: 700, color: '#1C1917', fontSize: 14 }}>张大伟</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                  <Star style={{ width: 11, height: 11, fill: '#FBBF24', color: '#FBBF24' }} />
                  <span style={{ color: '#D97706', fontSize: 11, fontWeight: 600 }}>4.9</span>
                  <span style={{ color: '#A8A29E', fontSize: 11 }}>· 认证遛狗师</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[{ icon: '📍', value: `${km} km`, label: '行走' }, { icon: '⏱', value: fmt(elapsed), label: '用时' }, { icon: '👟', value: `${(parseFloat(km)*1340).toFixed(0)}步`, label: '步数' }].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '10px 6px', borderRadius: 12, background: '#F9F8F6', border: '1px solid #E8E5E0' }}>
                  <div style={{ fontSize: 16, marginBottom: 3 }}>{s.icon}</div>
                  <div style={{ fontWeight: 700, color: '#1C1917', fontSize: 12 }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: '#A8A29E', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Payment */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 14, background: '#FFF4EF', border: '1px solid rgba(255,107,44,0.2)', marginBottom: 18 }}>
              <div>
                <p style={{ color: '#78716C', fontSize: 12 }}>服务费用（托管中）</p>
                <p style={{ color: '#FF6B2C', fontWeight: 800, fontSize: 18, marginTop: 2 }}>¥45</p>
              </div>
              <span style={{ fontSize: 22 }}>🔒</span>
            </div>

            {/* CTA */}
            <button onClick={handleConfirm} disabled={confirming}
              style={{ width: '100%', padding: '14px', borderRadius: 14, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', color: 'white', border: 'none', fontWeight: 700, fontSize: 14, cursor: confirming ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 3px 12px rgba(255,107,44,0.3)', opacity: confirming ? 0.7 : 1, marginBottom: 10 }}>
              {confirming
                ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                : '✅ 确认完成订单，去评价'}
            </button>
            <button onClick={() => setShowModal(false)}
              style={{ display: 'block', width: '100%', background: 'none', border: 'none', color: '#A8A29E', fontSize: 13, cursor: 'pointer', padding: '8px 0' }}>
              稍后确认
            </button>
          </div>
        </div>
      )}

      <ChatWidget partnerName="张大伟" partnerEmoji="🧑" />
    </>
  );
}
