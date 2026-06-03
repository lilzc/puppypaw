import { useState } from 'react';
import { X, Bell, Heart, Upload, AlertTriangle } from 'lucide-react';

/* ── Dog data ─────────────────────────────────────────────── */
interface DogPin {
  id: string;
  name: string;
  breed: string;
  emoji: string;
  owner: string;
  distanceM: number;
  cx: number;
  cy: number;
  color: string;
  following?: boolean;
}

const DOGS: DogPin[] = [
  { id: 'd1', name: '豆豆', breed: '柴犬', emoji: '🐕', owner: '李美华', distanceM: 120, cx: 90,  cy: 130, color: '#FF6B2C' },
  { id: 'd2', name: '球球', breed: '边牧', emoji: '🐕', owner: '赵明',   distanceM: 280, cx: 220, cy: 85,  color: '#3B82F6' },
  { id: 'd3', name: '旺旺', breed: '哈士奇', emoji: '🐺', owner: '刘伟', distanceM: 350, cx: 310, cy: 155, color: '#8B5CF6' },
  { id: 'd4', name: '糖糖', breed: '泰迪', emoji: '🐩', owner: '孙丽',   distanceM: 410, cx: 155, cy: 195, color: '#E91E8C' },
  { id: 'd5', name: '奥利奥', breed: '法斗', emoji: '🐾', owner: '吴建', distanceM: 520, cx: 265, cy: 230, color: '#10B981' },
  { id: 'd6', name: '小白', breed: '萨摩耶', emoji: '🐶', owner: '王芳', distanceM: 680, cx: 60,  cy: 230, color: '#F59E0B' },
];

const ORGS = [
  { name: '上海市流浪动物救助协会', address: '徐汇区枫林路120号', phone: '021-6456xxxx', icon: '🏥' },
  { name: '爱心宠物家园',           address: '长宁区天山路88号', phone: '021-5241xxxx', icon: '🏡' },
  { name: '毛孩子救助站',           address: '闵行区莘庄镇',     phone: '021-3415xxxx', icon: '🐾' },
];

/* ── SVG dark map ─────────────────────────────────────────── */
function DarkMap({ dogs, lostMarkers, onClickDog }: {
  dogs: DogPin[];
  lostMarkers: { cx: number; cy: number }[];
  onClickDog: (d: DogPin) => void;
}) {
  return (
    <svg viewBox="0 0 400 280" style={{ width: '100%', display: 'block' }} xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <rect width="400" height="280" fill="#0f172a" />

      {/* Major roads - horizontal */}
      <rect x="0" y="58"  width="400" height="10" fill="#1e293b" />
      <rect x="0" y="155" width="400" height="10" fill="#1e293b" />
      <rect x="0" y="252" width="400" height="10" fill="#1e293b" />
      {/* Major roads - vertical */}
      <rect x="55"  y="0" width="10" height="280" fill="#1e293b" />
      <rect x="165" y="0" width="10" height="280" fill="#1e293b" />
      <rect x="280" y="0" width="10" height="280" fill="#1e293b" />
      {/* Minor roads */}
      <rect x="0"   y="108" width="400" height="5" fill="#172033" />
      <rect x="0"   y="205" width="400" height="5" fill="#172033" />
      <rect x="110" y="0"   width="5"   height="280" fill="#172033" />
      <rect x="220" y="0"   width="5"   height="280" fill="#172033" />
      <rect x="330" y="0"   width="5"   height="280" fill="#172033" />

      {/* Park */}
      <rect x="67" y="68" width="90" height="82" rx="4" fill="#0d2c1a" />
      <text x="112" y="114" textAnchor="middle" fontSize="9" fill="#16473a" fontWeight="600">🌿 中山公园</text>

      {/* Water */}
      <rect x="290" y="68" width="102" height="40" rx="3" fill="#0a1e3d" />
      <text x="341" y="90" textAnchor="middle" fontSize="8" fill="#1a3a5c">苏州河</text>

      {/* Buildings */}
      {[
        [120,68,38,35],[175,68,38,35],[240,68,32,35],
        [67,170,38,28],[120,170,38,28],[175,170,38,28],[240,170,28,28],[295,170,28,28],[330,170,28,28],
        [67,216,38,28],[120,216,38,28],[175,216,38,28],[240,216,28,28],[295,216,28,28],
      ].map(([x,y,w,h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill="#12233a" />
      ))}

      {/* Road labels */}
      <text x="200" y="55"  textAnchor="middle" fontSize="8" fill="#334155" fontWeight="500">天钥桥路</text>
      <text x="200" y="152" textAnchor="middle" fontSize="8" fill="#334155" fontWeight="500">漕溪北路</text>

      {/* Walk paths (subtle dashes) */}
      <path d="M90,130 Q120,110 155,100 Q190,90 220,85" stroke="#FF6B2C" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.4" />
      <path d="M155,195 Q185,185 220,175 Q255,165 265,155" stroke="#E91E8C" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.4" />

      {/* Current location pulse */}
      <circle cx="200" cy="165" r="12" fill="rgba(59,130,246,0.15)" />
      <circle cx="200" cy="165" r="7"  fill="rgba(59,130,246,0.25)" />
      <circle cx="200" cy="165" r="4"  fill="#3B82F6" />
      <circle cx="200" cy="165" r="2"  fill="white" />

      {/* Lost dog markers */}
      {lostMarkers.map((m, i) => (
        <g key={i}>
          <circle cx={m.cx} cy={m.cy} r="12" fill="#EF4444" opacity="0.9" />
          <text x={m.cx} y={m.cy + 4} textAnchor="middle" fontSize="12" fill="white">!</text>
        </g>
      ))}

      {/* Dog pins */}
      {dogs.map(dog => (
        <g key={dog.id} style={{ cursor: 'pointer' }} onClick={() => onClickDog(dog)}>
          {/* tail */}
          <line x1={dog.cx} y1={dog.cy} x2={dog.cx} y2={dog.cy + 8} stroke={dog.color} strokeWidth="2" />
          {/* bubble */}
          <circle cx={dog.cx} cy={dog.cy - 16} r="16" fill={dog.color} opacity="0.95" />
          <text x={dog.cx} y={dog.cy - 11} textAnchor="middle" fontSize="14">{dog.emoji}</text>
          {/* name label */}
          <rect x={dog.cx - 18} y={dog.cy + 10} width="36" height="13" rx="4" fill="rgba(0,0,0,0.6)" />
          <text x={dog.cx} y={dog.cy + 20} textAnchor="middle" fontSize="8" fill="white" fontWeight="600">{dog.name}</text>
        </g>
      ))}

      {/* You label */}
      <rect x="184" y="172" width="32" height="12" rx="4" fill="rgba(0,0,0,0.6)" />
      <text x="200" y="181" textAnchor="middle" fontSize="8" fill="#93C5FD" fontWeight="600">你在这</text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function DogMapPage() {
  const [dogs, setDogs]           = useState<DogPin[]>(DOGS);
  const [selected, setSelected]   = useState<DogPin | null>(null);
  const [lostOpen, setLostOpen]   = useState(false);
  const [lostMarkers, setLostMarkers] = useState<{ cx: number; cy: number }[]>([]);
  const [lostDesc, setLostDesc]   = useState('');
  const [lostLoc,  setLostLoc]    = useState('');
  const [lostDone, setLostDone]   = useState(false);

  const toggleFollow = (id: string) => {
    setDogs(p => p.map(d => d.id === id ? { ...d, following: !d.following } : d));
    if (selected?.id === id) setSelected(s => s ? { ...s, following: !s.following } : null);
  };

  const submitLost = () => {
    if (!lostDesc.trim()) return;
    setLostMarkers(p => [...p, { cx: 130 + Math.random() * 140, cy: 90 + Math.random() * 100 }]);
    setLostDone(true);
  };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ background: '#0f172a', borderBottom: '1px solid #1e293b', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 20, color: 'white', lineHeight: 1 }}>🗺 狗狗地图</h1>
          <p style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>附近 {dogs.length} 只正在遛弯的狗狗</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: '#1e293b', border: '1px solid #334155' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', animation: 'pulse 1.5s ease-in-out infinite' }} />
          <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>实时</span>
        </div>
      </div>

      {/* ── Map ─────────────────────────────────────────── */}
      <div style={{ position: 'relative' }}>
        <DarkMap dogs={dogs} lostMarkers={lostMarkers} onClickDog={setSelected} />

        {/* Lost dog button */}
        <button onClick={() => { setLostOpen(true); setLostDone(false); setLostDesc(''); setLostLoc(''); }}
          style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 22, background: '#EF4444', color: 'white', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(239,68,68,0.45)' }}>
          <AlertTriangle style={{ width: 15, height: 15 }} /> 走失提醒
        </button>
      </div>

      {/* ── Dog popup ───────────────────────────────────── */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
          <div style={{ background: '#1e293b', borderRadius: 24, padding: 24, width: '100%', maxWidth: 320, border: '1px solid #334155', animation: 'fadeInUp 0.25s ease both' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: selected.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>{selected.emoji}</div>
                <div>
                  <h3 style={{ fontWeight: 800, color: 'white', fontSize: 18, lineHeight: 1, marginBottom: 4 }}>{selected.name}</h3>
                  <p style={{ fontSize: 13, color: '#94A3B8' }}>{selected.breed}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4 }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1, background: '#0f172a', borderRadius: 12, padding: '10px 12px' }}>
                <p style={{ fontSize: 11, color: '#64748B', marginBottom: 3 }}>主人</p>
                <p style={{ fontSize: 14, color: 'white', fontWeight: 600 }}>{selected.owner}</p>
              </div>
              <div style={{ flex: 1, background: '#0f172a', borderRadius: 12, padding: '10px 12px' }}>
                <p style={{ fontSize: 11, color: '#64748B', marginBottom: 3 }}>距你</p>
                <p style={{ fontSize: 14, color: 'white', fontWeight: 600 }}>{selected.distanceM}m</p>
              </div>
            </div>

            <button onClick={() => toggleFollow(selected.id)}
              style={{ width: '100%', padding: '12px', borderRadius: 14, background: selected.following ? '#1e293b' : selected.color, color: selected.following ? '#94A3B8' : 'white', border: selected.following ? '1.5px solid #334155' : 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}>
              {selected.following
                ? <><Bell style={{ width: 16, height: 16 }} />已关注 · 取消</>
                : <><Heart style={{ width: 16, height: 16 }} />关注 {selected.name}</>}
            </button>
            {selected.following && (
              <p style={{ textAlign: 'center', fontSize: 11, color: '#64748B', marginTop: 8 }}>
                {selected.name} 发布新任务时将推送通知给你
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Lost dog modal ──────────────────────────────── */}
      {lostOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 300 }}>
          <div style={{ width: '100%', maxWidth: 520, background: '#1e293b', borderRadius: '24px 24px 0 0', padding: '24px 24px 40px', border: '1px solid #334155', animation: 'slideUp 0.3s ease both' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#334155', margin: '0 auto 20px' }} />

            {lostDone ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>🔴</div>
                <h3 style={{ fontWeight: 800, color: 'white', fontSize: 18, marginBottom: 8 }}>走失提醒已发布！</h3>
                <p style={{ color: '#94A3B8', fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                  地图上已标注红色警示标记<br />
                  附近 500m 内的用户将收到推送通知
                </p>
                <button onClick={() => setLostOpen(false)}
                  style={{ padding: '12px 32px', borderRadius: 14, background: '#EF4444', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  好的，关闭
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ fontWeight: 800, color: 'white', fontSize: 18, marginBottom: 4 }}>🚨 发布走失提醒</h3>
                <p style={{ color: '#94A3B8', fontSize: 13, marginBottom: 20 }}>提交后地图标注红色警示，并推送给附近用户</p>

                {/* Photo upload */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>上传狗狗照片</label>
                  <button style={{ width: '100%', height: 80, borderRadius: 12, border: '1.5px dashed #334155', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
                    <Upload style={{ width: 20, height: 20, color: '#64748B' }} />
                    <span style={{ fontSize: 12, color: '#64748B' }}>点击上传照片</span>
                  </button>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>狗狗描述 *</label>
                  <textarea value={lostDesc} onChange={e => setLostDesc(e.target.value)} rows={3}
                    placeholder="品种、体型、毛色、特征…"
                    style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: 'white', fontSize: 13, outline: 'none', resize: 'none', lineHeight: 1.65, fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = '#EF4444'; }}
                    onBlur={e => { e.target.style.borderColor = '#334155'; }} />
                </div>

                {/* Last seen */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>最后出现地点</label>
                  <input value={lostLoc} onChange={e => setLostLoc(e.target.value)}
                    placeholder="如：徐汇区天钥桥路公园附近"
                    style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: 'white', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
                    onFocus={e => { e.target.style.borderColor = '#EF4444'; }}
                    onBlur={e => { e.target.style.borderColor = '#334155'; }} />
                </div>

                <button onClick={submitLost} disabled={!lostDesc.trim()}
                  style={{ width: '100%', padding: '13px', borderRadius: 14, background: lostDesc.trim() ? '#EF4444' : '#374151', color: 'white', border: 'none', fontSize: 14, fontWeight: 700, cursor: lostDesc.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: lostDesc.trim() ? '0 3px 12px rgba(239,68,68,0.4)' : 'none' }}>
                  <AlertTriangle style={{ width: 16, height: 16 }} /> 发布走失提醒
                </button>
                <button onClick={() => setLostOpen(false)}
                  style={{ display: 'block', width: '100%', marginTop: 10, background: 'none', border: 'none', color: '#64748B', fontSize: 13, cursor: 'pointer', padding: '8px 0' }}>
                  取消
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Nearby organizations ────────────────────────── */}
      <div style={{ background: '#0f172a', borderTop: '1px solid #1e293b', padding: '20px 20px 40px' }}>
        <h2 style={{ fontWeight: 700, color: 'white', fontSize: 15, marginBottom: 14 }}>🏥 附近动物救助机构</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ORGS.map((org, i) => (
            <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{org.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, color: 'white', fontSize: 14, marginBottom: 3 }}>{org.name}</p>
                <p style={{ fontSize: 12, color: '#64748B' }}>{org.address}</p>
                <p style={{ fontSize: 12, color: '#FF6B2C', marginTop: 2, fontWeight: 600 }}>{org.phone}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
