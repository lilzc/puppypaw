import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, PawPrint, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

/* ── Static config ──────────────────────────────────────────── */
const ROLES: Record<UserRole, { emoji: string; label: string; desc: string }> = {
  owner:  { emoji: '🐾', label: '我是宠物主', desc: '找专业遛狗师，全程 GPS 守护' },
  walker: { emoji: '🦮', label: '我是遛狗师', desc: '灵活接单，按次结算收入'      },
};

/* ── Sub: expanding border line that grows from center on focus */
function ExpandingBorder({ active, rgb }: { active: boolean; rgb: string }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 1, overflow: 'hidden',
      borderRadius: '0 0 14px 14px', pointerEvents: 'none',
    }}>
      <div style={{
        position: 'absolute', bottom: 0,
        left: '50%', transform: 'translateX(-50%)',
        height: '100%',
        width: active ? '100%' : '0%',
        background: `linear-gradient(90deg, transparent, rgba(${rgb},0.9), transparent)`,
        boxShadow: active ? `0 0 10px rgba(${rgb},0.55)` : 'none',
        transition: 'width 0.3s ease, box-shadow 0.3s ease',
      }} />
    </div>
  );
}

/* ── Sub: demo quick-fill button ─────────────────────────────── */
function DemoBtn({ role, onClick }: { role: UserRole; onClick: () => void }) {
  const c = role === 'owner' ? '255,107,44' : '139,92,246';
  const cfg = ROLES[role];
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, padding: '10px 0', borderRadius: 14,
        background: '#F5F4F2',
        border: '1px solid #E0E0E0',
        color: '#78716C',
        fontSize: 12, fontWeight: 600, cursor: 'pointer',
        transition: 'all 0.22s ease',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.background    = `rgba(${c},0.1)`;
        el.style.borderColor   = `rgba(${c},0.28)`;
        el.style.color         = role === 'owner' ? '#FF9245' : '#A78BFA';
        el.style.transform     = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.background    = 'rgba(255,255,255,0.04)';
        el.style.borderColor   = '#E0E0E0';
        el.style.color         = 'rgba(255,255,255,0.35)';
        el.style.transform     = 'none';
      }}
    >
      {cfg.emoji}&nbsp;{role === 'owner' ? '宠物主 Demo' : '遛狗师 Demo'}
    </button>
  );
}

/* ── Main page ──────────────────────────────────────────────── */
export default function AuthPage() {
  const [sp] = useSearchParams();
  const [isReg,     setIsReg]     = useState(sp.get('register') === 'true');
  const [role,      setRole]      = useState<UserRole>((sp.get('role') as UserRole) || 'owner');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [name,      setName]      = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [error,     setError]     = useState('');
  const [submitting, setSub]      = useState(false);
  const [focused,   setFocused]   = useState<string | null>(null);
  const [btnHover,  setBtnHover]  = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (isAuthenticated) nav(user?.role === 'owner' ? '/home' : '/walker');
  }, [isAuthenticated, user, nav]);


  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Role-specific onboarding flows
    if (isReg && role === 'owner')  { nav('/owner-register');  return; }
    if (isReg && role === 'walker') { nav('/walker-register'); return; }
    if (!email || !password)        { setError('请填写邮箱和密码'); return; }
    if (isReg && !name)             { setError('请填写您的姓名');   return; }
    setSub(true);
    setTimeout(() => { login(email, password, role); setSub(false); }, 700);
  };

  const fillDemo = (r: UserRole) => {
    setRole(r);
    setEmail(r === 'owner' ? 'owner@demo.com' : 'walker@demo.com');
    setPassword('demo123');
    setIsReg(false);
  };

  /* Derived accent values – update when role changes */
  const isOwner    = role === 'owner';
  const rgb        = isOwner ? '255,107,44' : '139,92,246';
  const accent     = isOwner ? '#FF6B2C'    : '#8B5CF6';
  const accentMid  = isOwner ? '#FF9245'    : '#A78BFA';

  /* Input style factory (dynamic border + glow) */
  const inputSx = (field: string): React.CSSProperties => ({
    width: '100%', padding: '14px 16px',
    background: '#F5F4F2',
    border: focused === field
      ? `1px solid rgba(${rgb},0.65)`
      : '1px solid rgba(255,255,255,0.1)',
    boxShadow: focused === field
      ? `0 0 0 3.5px rgba(${rgb},0.13), 0 0 22px rgba(${rgb},0.08)`
      : 'none',
    borderRadius: 14, color: '#1C1917', fontSize: 14,
    outline: 'none', boxSizing: 'border-box' as const,
    transition: 'border-color 0.25s ease, box-shadow 0.28s ease',
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-14 relative overflow-hidden"
      style={{ background: '#F9F8F6' }}
    >

      {/* Subtle tint */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: isOwner
          ? 'radial-gradient(ellipse 60% 40% at 20% 30%, rgba(255,107,44,0.06) 0%, transparent 65%)'
          : 'radial-gradient(ellipse 60% 40% at 20% 30%, rgba(139,92,246,0.06) 0%, transparent 65%)',
        transition: 'background 0.4s ease',
      }} />

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="w-full max-w-md relative z-10">

        {/* Logo — blur(8px)→0 + fade in, 0.65s */}
        <div className="text-center mb-8" style={{ animation: 'logoReveal 0.65s ease-out both' }}>
          <Link to="/" className="inline-flex items-center gap-3">
            <div style={{
              width: 50, height: 50, borderRadius: 17,
              background: `linear-gradient(135deg, ${accent}, ${accentMid})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 26px rgba(${rgb},0.45)`,
              transition: 'background 0.4s ease, box-shadow 0.4s ease',
              flexShrink: 0,
            }}>
              <PawPrint style={{ width: 24, height: 24, color: '#1C1917' }} />
            </div>
            <span style={{ fontWeight: 900, color: '#1C1917', fontSize: 23, letterSpacing: '-0.03em' }}>
              Puppy{' '}
              <span style={{
                background: `linear-gradient(135deg, ${accent}, ${accentMid})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                transition: 'background 0.4s ease',
              }}>Paw</span>
            </span>
          </Link>
          <p style={{ color: '#78716C', fontSize: 13, marginTop: 10 }}>
            {isReg ? '创建账号，开始安心遛狗之旅' : '欢迎回来，继续出发吧'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E8E5E0',
          borderRadius: 28, padding: 28,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          animation: 'fadeInUp 0.65s ease-out 0.12s both',
        }}>

          {/* Role selector — two clickable cards ──────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 26 }}>
            {(['owner', 'walker'] as UserRole[]).map((r) => {
              const cfg    = ROLES[r];
              const active = role === r;
              const c      = r === 'owner' ? '255,107,44' : '139,92,246';
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  style={{
                    padding: '18px 14px 16px',
                    borderRadius: 18, textAlign: 'left',
                    position: 'relative', overflow: 'hidden', cursor: 'pointer',
                    border: active
                      ? `1.5px solid rgba(${c},0.55)`
                      : '1px solid #E0E0E0',
                    background: active
                      ? `rgba(${c},0.08)`
                      : '#F8F8F8',
                    boxShadow: active
                      ? `0 0 0 1px rgba(${c},0.12),
                         0 8px 28px rgba(${c},0.16),
                         inset 0 1px 0 rgba(255,255,255,0.09)`
                      : 'none',
                    transform: active ? 'scale(1.035)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)',
                  }}
                >
                  {/* Selected checkmark */}
                  <div style={{
                    position: 'absolute', top: 9, right: 9,
                    width: 18, height: 18, borderRadius: '50%',
                    background: active ? `rgba(${c},0.9)` : '#E0E0E0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.25s ease',
                  }}>
                    {active && <Check style={{ width: 10, height: 10, color: '#1C1917' }} />}
                  </div>

                  <div style={{ fontSize: 30, marginBottom: 9, lineHeight: 1 }}>{cfg.emoji}</div>
                  <div style={{
                    fontWeight: 700, fontSize: 13, marginBottom: 4,
                    color: active ? '#1A1A1A' : '#4A4A4A',
                    transition: 'color 0.2s',
                  }}>{cfg.label}</div>
                  <div style={{
                    fontSize: 11, lineHeight: 1.5,
                    color: active ? '#4A4A4A' : '#9B9B9B',
                  }}>{cfg.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Form ─────────────────────────────────────────────── */}
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {isReg && (
              <div style={{ animation: 'fadeInScale 0.35s ease both' }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 600,
                  color: '#78716C', marginBottom: 8,
                  letterSpacing: '0.08em', textTransform: 'uppercase' as const,
                }}>姓名</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text" value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入真实姓名"
                    className="auth-input"
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    style={inputSx('name')}
                  />
                  <ExpandingBorder active={focused === 'name'} rgb={rgb} />
                </div>
              </div>
            )}

            <div>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                color: '#78716C', marginBottom: 8,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
              }}>邮箱地址</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="auth-input"
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  style={inputSx('email')}
                />
                <ExpandingBorder active={focused === 'email'} rgb={rgb} />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600,
                color: '#78716C', marginBottom: 8,
                letterSpacing: '0.08em', textTransform: 'uppercase' as const,
              }}>密码</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="auth-input"
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  style={{ ...inputSx('password'), paddingRight: 48 }}
                />
                <button
                  type="button" onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 14, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: '#A8A29E',
                    cursor: 'pointer', padding: 0,
                    display: 'flex', alignItems: 'center',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.28)'; }}
                >
                  {showPw
                    ? <EyeOff style={{ width: 17, height: 17 }} />
                    : <Eye    style={{ width: 17, height: 17 }} />}
                </button>
                <ExpandingBorder active={focused === 'password'} rgb={rgb} />
              </div>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 16px', borderRadius: 14,
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.22)',
                color: '#F87171', fontSize: 13,
              }}>⚠&nbsp;{error}</div>
            )}

            {/* Submit — hover: translateX(4px) + shimmer sweep ── */}
            <button
              type="submit"
              disabled={submitting}
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                width: '100%', padding: '15px 24px', marginTop: 4,
                background: `linear-gradient(135deg, ${accent} 0%, ${accentMid} 100%)`,
                border: 'none', borderRadius: 16,
                color: '#1C1917', fontSize: 15, fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.65 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                position: 'relative', overflow: 'hidden',
                transform: btnHover && !submitting ? 'translateX(4px)' : 'translateX(0)',
                boxShadow: btnHover && !submitting
                  ? `0 12px 36px rgba(${rgb},0.55), 0 0 60px rgba(${rgb},0.2)`
                  : `0 6px 22px rgba(${rgb},0.32)`,
                transition: 'transform 0.25s ease, box-shadow 0.25s ease, opacity 0.2s ease',
              }}
            >
              {/* Shimmer overlay — slides through on hover */}
              <span style={{
                position: 'absolute', top: 0, height: '100%', width: '55%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)',
                transform: 'skewX(-20deg)',
                pointerEvents: 'none',
                left: btnHover && !submitting ? '130%' : '-80%',
                transition: btnHover && !submitting ? 'left 0.5s ease' : 'none',
              }} />

              {submitting ? (
                <span style={{
                  width: 18, height: 18,
                  border: '2px solid rgba(255,255,255,0.28)',
                  borderTopColor: 'white', borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.7s linear infinite',
                }} />
              ) : (
                <>
                  {isReg ? '🐾 开始我的旅程' : '登录账号'}
                  <ArrowRight style={{ width: 17, height: 17 }} />
                </>
              )}
            </button>
          </form>

          {/* Toggle register / login */}
          <p style={{ textAlign: 'center', fontSize: 13, color: '#78716C', marginTop: 20 }}>
            {isReg ? '已有账号？' : '还没有账号？'}{' '}
            <button
              type="button"
              onClick={() => setIsReg(!isReg)}
              style={{
                color: accentMid, fontWeight: 700,
                background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 13,
                transition: 'color 0.3s ease',
              }}
            >
              {isReg ? '直接登录' : '免费注册'}
            </button>
          </p>

          {/* Demo accounts */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #F0F0F0' }}>
            <p style={{
              fontSize: 11, color: 'rgba(255,255,255,0.2)',
              textAlign: 'center', marginBottom: 10,
              letterSpacing: '0.07em', textTransform: 'uppercase',
            }}>体验 Demo 账号</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <DemoBtn role="owner"  onClick={() => fillDemo('owner')} />
              <DemoBtn role="walker" onClick={() => fillDemo('walker')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
