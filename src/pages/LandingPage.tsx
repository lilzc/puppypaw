import { Link } from 'react-router-dom';
import { Shield, MapPin, Star, Clock, ChevronRight, ArrowRight, Zap } from 'lucide-react';

const FLOATERS = [
  { e: '🐾', top: '14%', left: '7%',   cls: 'anim-float-a text-5xl', delay: '0s',   opacity: 0.15 },
  { e: '🐕', top: '22%', right: '5%',  cls: 'anim-float-b text-6xl', delay: '1.1s', opacity: 0.12 },
  { e: '🦮', top: '58%', left: '4%',   cls: 'anim-float-c text-4xl', delay: '0.7s', opacity: 0.12 },
  { e: '🐩', top: '68%', right: '7%',  cls: 'anim-float-a text-5xl', delay: '2s',   opacity: 0.12 },
  { e: '⭐', top: '32%', left: '16%',  cls: 'anim-float-c text-3xl', delay: '1.7s', opacity: 0.15 },
  { e: '🎾', top: '78%', left: '11%',  cls: 'anim-float-a text-4xl', delay: '1s',   opacity: 0.1  },
];

const FEATURES = [
  { icon: Shield, color: '#FF6B2C', bg: '#FFF4EF', border: 'rgba(255,107,44,0.2)', title: '实名认证保障', desc: '所有遛狗师通过身份核验 + 背景调查，平台全程护航。', tag: '安全第一' },
  { icon: MapPin, color: '#EC4899', bg: '#FDF2F8', border: 'rgba(236,72,153,0.2)', title: '实时 GPS 追踪', desc: '全程路线可视化，随时查看爱宠动态，数据永久保存。', tag: '全程可见' },
  { icon: Star,   color: '#7C3AED', bg: '#F5F3FF', border: 'rgba(124,58,237,0.2)', title: '双向真实评价', desc: '每次服务后双向评分，口碑决定排名，透明可信赖。', tag: '口碑透明' },
  { icon: Clock,  color: '#0891B2', bg: '#ECFEFF', border: 'rgba(8,145,178,0.2)',  title: '灵活弹性预约', desc: '随时预约或急单接单，早晚高峰与周末全天，随叫随到。', tag: '随时下单' },
];

const STEPS = [
  { n: '01', title: '选择角色注册', desc: '宠物主或遛狗师，30秒完成注册' },
  { n: '02', title: '匹配发布需求', desc: '附近遛狗师实时接单，秒级响应' },
  { n: '03', title: 'GPS 全程追踪', desc: '路线实时同步，服务结束自动报告' },
  { n: '04', title: '确认评价结算', desc: '宠物主确认后评价，费用自动结算' },
];

const STATS = [
  { v: '2,000+', l: '认证遛狗师' },
  { v: '50,000+', l: '成功订单' },
  { v: '4.9', l: '平均评分' },
  { v: '0', l: '安全事故' },
];

export default function LandingPage() {
  return (
    <div style={{ background: '#F9F8F6', minHeight: '100vh', color: '#1C1917' }}>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '88vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '5rem 1.5rem 6rem', background: 'linear-gradient(180deg, #FFFFFF 0%, #F9F8F6 100%)' }}>
        {/* Subtle orange tint blobs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,107,44,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '8%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,146,69,0.05)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        {FLOATERS.map((f, i) => (
          <span key={i} className={`absolute select-none pointer-events-none ${f.cls}`}
            style={{ top: f.top, left: (f as { left?: string }).left, right: (f as { right?: string }).right, opacity: f.opacity, animationDelay: f.delay }}>
            {f.e}
          </span>
        ))}

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 720, margin: '0 auto' }}>
          {/* Badge */}
          <div className="anim-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, fontSize: 13, fontWeight: 600, marginBottom: 28, background: '#FFF4EF', border: '1px solid rgba(255,107,44,0.25)', color: '#FF6B2C' }}>
            <Zap style={{ width: 14, height: 14 }} />
            新一代宠物遛狗平台 · 安全 · 专业 · 可信赖
          </div>

          {/* Headline */}
          <h1 className="anim-fade-up d-200" style={{ fontWeight: 900, fontSize: 'clamp(2.6rem,6.5vw,5rem)', lineHeight: 1.15, letterSpacing: '-0.03em', color: '#1C1917', marginBottom: 20 }}>
            让每一次遛狗<br />
            <span style={{ background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>安心又快乐</span>
          </h1>

          <p className="anim-fade-up d-400" style={{ color: '#78716C', fontSize: '1.1rem', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 40px' }}>
            Puppy Paw 连接宠物主与专业遛狗师。实名认证 + 实时 GPS 追踪，让您的毛孩子在最可靠的陪伴下尽情奔跑。
          </p>

          {/* CTAs */}
          <div className="anim-fade-up d-500" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 52 }}>
            <Link to="/booking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', color: 'white', fontWeight: 700, padding: '14px 32px', borderRadius: 22, fontSize: 15, boxShadow: '0 4px 16px rgba(255,107,44,0.35)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(255,107,44,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,107,44,0.35)'; e.currentTarget.style.transform = 'none'; }}>
              🐾 我要找遛狗师 <ArrowRight style={{ width: 17, height: 17 }} />
            </Link>
            <Link to="/walker-register" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#FF6B2C', fontWeight: 700, padding: '14px 32px', borderRadius: 22, fontSize: 15, border: '1.5px solid #FF6B2C', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FFF4EF'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'none'; }}>
              🦮 我要接单赚钱 <ChevronRight style={{ width: 17, height: 17 }} />
            </Link>
          </div>

          {/* Stats */}
          <div className="anim-fade-up d-700" style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
            {STATS.map((s, i) => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                {i > 0 && <div style={{ position: 'absolute', left: -16, top: '10%', height: '80%', width: 1, background: '#E8E5E0' }} />}
                <div style={{ fontWeight: 900, fontSize: 22, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', position: 'relative' }}>{s.v}</div>
                <div style={{ fontSize: 12, color: '#78716C', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#FF6B2C', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>CORE FEATURES</p>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: '#1C1917', letterSpacing: '-0.02em', marginBottom: 12 }}>
              为什么选择 <span style={{ background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Puppy Paw</span>？
            </h2>
            <p style={{ color: '#78716C', fontSize: 16 }}>每一个功能，都是对宠物安全的承诺</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
            {FEATURES.map(f => {
              const Icon = f.icon;
              return (
                <div key={f.title} style={{ background: 'white', border: `1px solid ${f.border}`, borderRadius: 20, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.2s', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: `1px solid ${f.border}` }}>
                    <Icon style={{ width: 24, height: 24, color: f.color }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: f.bg, color: f.color, display: 'inline-block', marginBottom: 10 }}>{f.tag}</span>
                  <h3 style={{ fontWeight: 700, color: '#1C1917', fontSize: 17, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ color: '#78716C', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', background: '#F9F8F6' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#FF6B2C', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>HOW IT WORKS</p>
            <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: '#1C1917', letterSpacing: '-0.02em' }}>
              四步完成一次<span style={{ background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>安心遛狗</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 24, position: 'relative' }}>
            {STEPS.map((s) => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px', background: '#FFF4EF', border: '2px solid rgba(255,107,44,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontWeight: 900, fontSize: 20, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.n}</span>
                </div>
                <h3 style={{ fontWeight: 700, color: '#1C1917', fontSize: 15, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: '#78716C', fontSize: 13, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', textAlign: 'center', background: '#FFF4EF', borderTop: '1px solid rgba(255,107,44,0.15)', borderBottom: '1px solid rgba(255,107,44,0.15)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🐾</div>
          <h2 style={{ fontWeight: 900, color: '#1C1917', fontSize: 'clamp(1.8rem,4vw,3rem)', letterSpacing: '-0.02em', marginBottom: 16 }}>立即开始，给毛孩子<br />最好的陪伴</h2>
          <p style={{ color: '#78716C', fontSize: 16, marginBottom: 36 }}>加入 Puppy Paw，让专业的人做专业的事</p>
          <Link to="/booking" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', color: 'white', fontWeight: 700, padding: '16px 40px', borderRadius: 24, fontSize: 16, boxShadow: '0 4px 20px rgba(255,107,44,0.4)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,107,44,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,107,44,0.4)'; }}>
            免费注册，马上体验 <ArrowRight style={{ width: 20, height: 20 }} />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={{ padding: '32px 24px', textAlign: 'center', background: 'white', borderTop: '1px solid #E8E5E0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 14 }}>🐾</span>
          </div>
          <span style={{ fontWeight: 700, color: '#1C1917', fontSize: 15 }}>Puppy Paw</span>
        </div>
        <p style={{ color: '#A8A29E', fontSize: 13 }}>© 2024 Puppy Paw · 让每一只狗狗都被温柔对待。</p>
      </footer>
    </div>
  );
}
