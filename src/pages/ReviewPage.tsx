import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, ChevronLeft, ArrowRight, CheckCircle } from 'lucide-react';

interface ServiceState {
  walkerName?: string;
  walkerEmoji?: string;
  km?: string;
  elapsed?: number;
  price?: number;
  steps?: string;
  reportNote?: string;
}

const TAGS = ['非常专业', '准时到达', '温柔耐心', '实时汇报', '细心负责', '强烈推荐', '价格实惠', '超出预期'];
const STAR_LABELS = ['', '非常差劲', '不太满意', '还算可以', '比较满意', '非常满意！'];

const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

const card: React.CSSProperties = {
  background: '#FFFFFF', border: '1px solid #E8E5E0', borderRadius: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

export default function ReviewPage() {
  const nav = useNavigate();
  const { state } = useLocation() as { state: ServiceState | null };

  const walkerName  = state?.walkerName  ?? '张大伟';
  const walkerEmoji = state?.walkerEmoji ?? '🧑';
  const km          = state?.km          ?? '2.4';
  const elapsed     = state?.elapsed     ?? 2280;
  const price       = state?.price       ?? 45;
  const steps       = state?.steps       ?? '3120';
  const reportNote  = state?.reportNote  ?? '豆豆今天状态非常棒！全程活泼，顺利完成遛狗。';

  const [rating,    setRating]    = useState(0);
  const [hover,     setHover]     = useState(0);
  const [tags,      setTags]      = useState<string[]>([]);
  const [text,      setText]      = useState('');
  const [submitted, setSubmitted] = useState(false);

  const display = hover || rating;
  const toggleTag = (t: string) =>
    setTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const handleSubmit = () => {
    if (rating === 0) return;
    setSubmitted(true);
    setTimeout(() => nav('/'), 2200);
  };

  if (submitted) return (
    <div style={{ background: '#F9F8F6', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <div style={{ textAlign: 'center', animation: 'fadeInScale 0.5s ease both' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FFF4EF', border: '2px solid rgba(255,107,44,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle style={{ width: 40, height: 40, color: '#FF6B2C' }} />
        </div>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: '#1C1917', marginBottom: 8 }}>感谢您的评价！</h2>
        <p style={{ color: '#78716C', fontSize: 14 }}>
          <span style={{ color: '#FF6B2C', fontWeight: 600 }}>¥{price}</span> 已释放给遛狗师，正在返回首页…
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#F9F8F6', minHeight: '100vh', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 20px 0' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => nav('/')} style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, cursor: 'pointer', background: '#FFFFFF', border: '1px solid #E8E5E0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#78716C' }}>
            <ChevronLeft style={{ width: 18, height: 18 }} />
          </button>
          <div>
            <h1 style={{ fontWeight: 800, color: '#1C1917', fontSize: 20, lineHeight: 1 }}>评价本次服务</h1>
            <p style={{ color: '#A8A29E', fontSize: 12, marginTop: 4 }}>您的评价帮助其他宠物主做更好的选择</p>
          </div>
        </div>

        {/* Walker + service report */}
        <div style={{ ...card, padding: 20, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{walkerEmoji}</div>
            <div>
              <p style={{ fontWeight: 700, color: '#1C1917', fontSize: 15, marginBottom: 3 }}>{walkerName}</p>
              <p style={{ color: '#78716C', fontSize: 12 }}>本次服务已完成 · ✓ 认证遛狗师</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
            {[{ icon: '📍', value: `${km} km`, label: '行走距离' }, { icon: '⏱', value: fmt(elapsed), label: '服务时长' }, { icon: '👟', value: `${steps}步`, label: '步数' }].map(s => (
              <div key={s.label} style={{ background: '#F9F8F6', border: '1px solid #E8E5E0', borderRadius: 12, padding: '10px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontWeight: 700, color: '#1C1917', fontSize: 13 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#A8A29E', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Walker's service report */}
          <div style={{ background: '#FFF4EF', border: '1px solid rgba(255,107,44,0.18)', borderRadius: 14, padding: '12px 14px' }}>
            <p style={{ color: '#FF6B2C', fontWeight: 700, fontSize: 12, marginBottom: 6 }}>📋 遛狗师服务报告</p>
            <p style={{ color: '#44403C', fontSize: 13, lineHeight: 1.65 }}>{reportNote}</p>
          </div>
        </div>

        {/* Star rating */}
        <div style={{ ...card, padding: 24, marginBottom: 12, textAlign: 'center' }}>
          <p style={{ fontWeight: 700, color: '#1C1917', fontSize: 15, marginBottom: 6 }}>本次服务评分</p>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, minHeight: 20, color: display > 0 ? '#FF6B2C' : 'transparent', transition: 'color 0.2s' }}>
            {STAR_LABELS[display]}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, transform: n <= display ? 'scale(1.18)' : 'scale(1)', transition: 'transform 0.15s' }}>
                <Star style={{ width: 36, height: 36, fill: n <= display ? '#FBBF24' : 'transparent', color: n <= display ? '#FBBF24' : '#D6D3D1', transition: 'all 0.15s' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Quick tags */}
        <div style={{ ...card, padding: 20, marginBottom: 12 }}>
          <p style={{ fontWeight: 700, color: '#1C1917', fontSize: 14, marginBottom: 14 }}>
            快速标签 <span style={{ fontSize: 12, fontWeight: 400, color: '#A8A29E' }}>可多选</span>
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TAGS.map(tag => {
              const active = tags.includes(tag);
              return (
                <button key={tag} type="button" onClick={() => toggleTag(tag)} style={{
                  padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s',
                  background: active ? 'linear-gradient(135deg,#FF6B2C,#FF9245)' : '#F5F4F2',
                  border: active ? 'none' : '1px solid #E8E5E0',
                  color: active ? 'white' : '#78716C',
                  boxShadow: active ? '0 2px 8px rgba(255,107,44,0.3)' : 'none',
                }}>
                  {active ? '✓ ' : ''}{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Text review */}
        <div style={{ ...card, padding: 20, marginBottom: 12 }}>
          <p style={{ fontWeight: 700, color: '#1C1917', fontSize: 14, marginBottom: 12 }}>
            写点什么 <span style={{ fontSize: 12, fontWeight: 400, color: '#A8A29E' }}>选填</span>
          </p>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="分享这次遛狗体验，帮助其他宠物主…" rows={3}
            style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', background: '#F5F4F2', border: '1px solid #E8E5E0', borderRadius: 12, color: '#1C1917', fontSize: 13, outline: 'none', resize: 'none', lineHeight: 1.6, fontFamily: 'inherit', transition: 'border-color 0.2s' }}
            onFocus={e => { e.target.style.borderColor = '#FF6B2C'; e.target.style.background = 'white'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,44,0.08)'; }}
            onBlur={e => { e.target.style.borderColor = '#E8E5E0'; e.target.style.background = '#F5F4F2'; e.target.style.boxShadow = 'none'; }} />
        </div>

        {/* Payment release notice */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: 16, marginBottom: 16, background: '#FFF4EF', border: '1px solid rgba(255,107,44,0.2)' }}>
          <div>
            <p style={{ color: '#78716C', fontSize: 12, marginBottom: 3 }}>提交评价后费用将从托管账户释放</p>
            <p style={{ color: '#FF6B2C', fontWeight: 700, fontSize: 15 }}>¥{price} 待确认释放给遛狗师</p>
          </div>
          <div style={{ fontSize: 26 }}>🔒</div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={rating === 0}
          style={{ width: '100%', padding: '15px 24px', borderRadius: 16, color: 'white', fontSize: 15, fontWeight: 700, border: 'none', cursor: rating === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: rating === 0 ? 0.45 : 1, transition: 'opacity 0.2s', background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', boxShadow: rating === 0 ? 'none' : '0 4px 14px rgba(255,107,44,0.35)' }}>
          提交评价，完成订单
          <ArrowRight style={{ width: 17, height: 17 }} />
        </button>

        <button onClick={() => nav('/')} style={{ display: 'block', margin: '12px auto 0', background: 'none', border: 'none', color: '#A8A29E', fontSize: 13, cursor: 'pointer' }}>
          跳过，稍后评价
        </button>
      </div>
    </div>
  );
}
