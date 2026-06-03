import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PawPrint, ChevronRight, Check, Upload, Shield, Clock, MapPin, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Palette ──────────────────────────────────────────────────── */
const rgb    = '139,92,246';
const accent = '#8B5CF6';
const accentM = '#A78BFA';

/* ── Shared primitives ───────────────────────────────────────── */
const gc: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E8E5E0', borderRadius: 28,
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: '#78716C', marginBottom: 8,
  letterSpacing: '0.08em', textTransform: 'uppercase',
};
function iSx(focused: boolean): React.CSSProperties {
  return {
    width: '100%', padding: '13px 16px', boxSizing: 'border-box',
    background: focused ? '#FFFFFF' : '#F5F4F2',
    border: focused ? `1px solid rgba(${rgb},0.65)` : '1px solid #E0E0E0',
    boxShadow: focused ? `0 0 0 3px rgba(${rgb},0.10)` : 'none',
    borderRadius: 14, color: '#1A1A1A', fontSize: 14, outline: 'none',
    transition: 'border-color 0.22s, box-shadow 0.22s',
  };
}

function SubmitBtn({ label, onClick, loading, disabled }: {
  label: string; onClick?: () => void; loading?: boolean; disabled?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button type={onClick ? 'button' : 'submit'} onClick={onClick}
      disabled={loading || disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', padding: '15px 24px', marginTop: 8,
        background: `linear-gradient(135deg,${accent},${accentM})`,
        border: 'none', borderRadius: 16, color: 'white',
        fontSize: 15, fontWeight: 700,
        cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
        opacity: (loading || disabled) ? 0.5 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transform: hov && !loading && !disabled ? 'translateX(4px)' : 'none',
        boxShadow: hov && !loading && !disabled
          ? `0 12px 36px rgba(${rgb},0.5)` : `0 6px 22px rgba(${rgb},0.26)`,
        transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.2s',
      }}>
      {loading
        ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.28)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
        : <>{label} <ChevronRight style={{ width: 17, height: 17 }} /></>}
    </button>
  );
}

/* ── Step bar (5 steps) ──────────────────────────────────────── */
const STEP_LABELS = ['基本注册', '实名认证', '背景调查', '知识测试', '账号激活'];
function StepBar({ step }: { step: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
      {STEP_LABELS.map((label, i) => {
        const idx = i + 1;
        const done = step > idx; const active = step === idx;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? accent : active ? `rgba(${rgb},0.12)` : '#F0F0F0',
                border: active ? `2px solid ${accent}` : done ? 'none' : '1px solid #E0E0E0',
                color: done ? 'white' : active ? accent : '#9B9B9B',
                transition: 'all 0.3s',
              }}>
                {done ? <Check style={{ width: 13, height: 13 }} /> : idx}
              </div>
              <span style={{ fontSize: 9.5, color: active ? accentM : done ? '#78716C' : '#9B9B9B', fontWeight: active ? 700 : 400, whiteSpace: 'nowrap' }}>{label}</span>
            </div>
            {i < 4 && <div style={{ width: 36, height: 1, margin: '0 3px', marginBottom: 16, background: step > idx ? accent : '#E0E0E0', transition: 'background 0.4s' }} />}
          </div>
        );
      })}
    </div>
  );
}

/* ── OTP component (reused) ──────────────────────────────────── */
function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const onBox = (i: number, val: string) => {
    const d = val.replace(/\D/g, '').slice(-1);
    const next = [...value]; next[i] = d; onChange(next);
    if (d && i < 5) setTimeout(() => refs.current[i + 1]?.focus(), 10);
  };
  const onKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      const next = [...value]; next[i - 1] = ''; onChange(next);
      setTimeout(() => refs.current[i - 1]?.focus(), 10);
    }
  };
  const onPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) onChange(digits.split(''));
  };
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }} onPaste={onPaste}>
      {value.map((d, i) => (
        <input key={i} ref={el => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={2} value={d}
          onChange={e => onBox(i, e.target.value)} onKeyDown={e => onKey(i, e)}
          style={{
            width: 46, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 800,
            background: d ? '#FFFFFF' : '#F5F4F2',
            border: d ? `2px solid rgba(${rgb},0.65)` : '1px solid #E0E0E0',
            borderRadius: 14, color: '#1A1A1A', outline: 'none',
            boxShadow: d ? `0 0 0 3px rgba(${rgb},0.08)` : 'none',
            transition: 'all 0.15s',
          }} />
      ))}
    </div>
  );
}

/* ── IdUpload subcomponent ───────────────────────────────────── */
function IdUpload({ side, img, onChange }: { side: string; img: string | null; onChange: (s: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const load = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => onChange(ev.target?.result as string); r.readAsDataURL(f);
    e.target.value = '';
  };
  return (
    <div onClick={() => ref.current?.click()} style={{
      flex: 1, minHeight: 100, borderRadius: 16, cursor: 'pointer',
      border: img ? '1.5px solid rgba(139,92,246,0.4)' : '1.5px dashed #D0D0D0',
      background: img ? 'transparent' : '#F5F4F2',
      overflow: 'hidden', position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = img ? 'rgba(139,92,246,0.65)' : '#BBBBBB'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = img ? 'rgba(139,92,246,0.4)' : '#D0D0D0'; }}>
      {img ? (
        <img src={img} alt={side} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
      ) : (
        <div style={{ textAlign: 'center', padding: 14 }}>
          <Upload style={{ width: 20, height: 20, color: '#A8A29E', margin: '0 auto 6px' }} />
          <p style={{ color: '#78716C', fontSize: 12, fontWeight: 600 }}>身份证{side}</p>
          <p style={{ color: 'rgba(255,255,255,0.16)', fontSize: 11, marginTop: 3 }}>点击上传</p>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" onChange={load} style={{ display: 'none' }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 1 · 基本注册
═══════════════════════════════════════════════════════════════ */
function Step1({ onNext }: { onNext: (phone: string, name: string) => void }) {
  const [phone,    setPhone]    = useState('');
  const [name,     setName]     = useState('');
  const [code,     setCode]     = useState(['', '', '', '', '', '']);
  const [sent,     setSent]     = useState(false);
  const [mock,     setMock]     = useState('');
  const [cd,       setCd]       = useState(0);
  const [verified, setVerified] = useState(false);
  const [error,    setError]    = useState('');
  const [foc,      setFoc]      = useState('');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendCode = () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) { setError('请输入有效的11位手机号'); return; }
    setError('');
    const c = String(Math.floor(100000 + Math.random() * 900000));
    setMock(c); setSent(true); setCd(60); setCode(['', '', '', '', '', '']);
    timer.current = setInterval(() => setCd(d => { if (d <= 1) { clearInterval(timer.current!); return 0; } return d - 1; }), 1000);
  };
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const handleCode = (v: string[]) => {
    setCode(v);
    if (v.every(d => d)) {
      if (v.join('') === mock) { setVerified(true); setError(''); }
      else { setError('验证码错误'); setTimeout(() => setCode(['', '', '', '', '', '']), 600); }
    }
  };

  const canNext = verified && name.trim().length >= 2;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Role badge */}
      <div style={{ padding: '12px 16px', borderRadius: 14, background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.25)`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>🦮</span>
        <div>
          <p style={{ color: accentM, fontWeight: 700, fontSize: 14 }}>我是遛狗师</p>
          <p style={{ color: '#78716C', fontSize: 12, marginTop: 2 }}>灵活接单 · 按次结算收入</p>
        </div>
        <div style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check style={{ width: 11, height: 11, color: 'white' }} />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label style={lbl}>手机号码</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#78716C', fontSize: 14 }}>+86</span>
            <input type="tel" maxLength={11} value={phone}
              onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
              placeholder="138 0000 0000"
              onFocus={() => setFoc('phone')} onBlur={() => setFoc('')}
              style={{ ...iSx(foc === 'phone'), paddingLeft: 48 }} />
          </div>
          <button type="button" onClick={sendCode} disabled={cd > 0 || verified}
            style={{
              flexShrink: 0, padding: '0 14px', borderRadius: 14, border: 'none', whiteSpace: 'nowrap',
              background: cd > 0 || verified ? '#F0F0F0' : `linear-gradient(135deg,${accent},${accentM})`,
              color: cd > 0 || verified ? '#9B9B9B' : 'white',
              fontSize: 13, fontWeight: 700, cursor: cd > 0 || verified ? 'not-allowed' : 'pointer',
            }}>
            {verified ? '✓ 已验证' : cd > 0 ? `${cd}s` : sent ? '重新发送' : '发送验证码'}
          </button>
        </div>
      </div>

      {sent && !verified && (
        <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
          <div style={{ padding: '10px 14px', borderRadius: 12, background: `rgba(${rgb},0.08)`, border: `1px solid rgba(${rgb},0.22)`, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📱</span>
            <span style={{ color: '#4A4A4A', fontSize: 13 }}>模拟验证码：<strong style={{ color: accentM, letterSpacing: 3 }}>{mock}</strong></span>
          </div>
          <label style={lbl}>输入验证码</label>
          <OtpInput value={code} onChange={handleCode} />
        </div>
      )}

      {verified && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderRadius: 14, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', animation: 'fadeInUp 0.3s ease both' }}>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Check style={{ width: 11, height: 11, color: 'white' }} />
          </div>
          <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 14 }}>手机号验证成功！</span>
        </div>
      )}

      {/* Name */}
      {verified && (
        <div style={{ animation: 'fadeInUp 0.3s ease 0.1s both' }}>
          <label style={lbl}>真实姓名</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="请输入真实姓名（用于实名认证）"
            onFocus={() => setFoc('name')} onBlur={() => setFoc('')} style={iSx(foc === 'name')} />
        </div>
      )}

      {error && <p style={{ color: '#F87171', fontSize: 13, textAlign: 'center' }}>{error}</p>}
      <SubmitBtn label="下一步：实名认证" disabled={!canNext} onClick={() => onNext(phone, name)} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 2 · 实名认证
═══════════════════════════════════════════════════════════════ */
function Step2({ name: initialName, onNext }: { name: string; onNext: () => void }) {
  const [idCard,   setIdCard]   = useState('');
  const [front,    setFront]    = useState<string | null>(null);
  const [back,     setBack]     = useState<string | null>(null);
  const [status,   setStatus]   = useState<'idle' | 'reviewing' | 'passed'>('idle');
  const [error,    setError]    = useState('');
  const [foc,      setFoc]      = useState('');

  const submit = () => {
    const id = idCard.replace(/\s/g, '');
    if (!/^\d{17}[\dX]$/i.test(id)) { setError('请输入有效的18位身份证号'); return; }
    if (!front || !back) { setError('请上传身份证正反面照片'); return; }
    setError(''); setStatus('reviewing');
    setTimeout(() => setStatus('passed'), 2000);
  };

  if (status === 'reviewing') return (
    <div style={{ textAlign: 'center', padding: '36px 0', animation: 'fadeInUp 0.35s ease both' }}>
      <div style={{ width: 70, height: 70, borderRadius: '50%', background: `rgba(${rgb},0.1)`, border: `2px solid rgba(${rgb},0.28)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
        <span style={{ width: 24, height: 24, border: `3px solid rgba(255,255,255,0.12)`, borderTopColor: accent, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
      </div>
      <h3 style={{ color: '#1A1A1A', fontWeight: 800, fontSize: 17, marginBottom: 8 }}>核验中…</h3>
      <p style={{ color: '#78716C', fontSize: 13 }}>正在通过公安系统核验身份</p>
    </div>
  );

  if (status === 'passed') return (
    <div style={{ animation: 'fadeInUp 0.35s ease both' }}>
      <div style={{ textAlign: 'center', padding: '24px 0 20px' }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'rgba(34,197,94,0.13)', border: '2px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Check style={{ width: 30, height: 30, color: '#4ade80' }} />
        </div>
        <h3 style={{ color: '#1A1A1A', fontWeight: 800, fontSize: 17, marginBottom: 6 }}>实名认证通过 ✓</h3>
        <p style={{ color: '#78716C', fontSize: 13 }}>身份信息与公安库匹配一致</p>
      </div>
      <div style={{ padding: '14px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 14, alignItems: 'center', marginBottom: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Shield style={{ width: 20, height: 20, color: '#4ade80' }} />
        </div>
        <div>
          <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: 14 }}>{initialName}</p>
          <p style={{ color: '#78716C', fontSize: 12, marginTop: 2 }}>身份证 {idCard.slice(0, 6)}****{idCard.slice(-4)} · 实名核验完成</p>
        </div>
      </div>
      <SubmitBtn label="下一步：背景调查" onClick={onNext} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <label style={lbl}>身份证号码</label>
        <input type="text" value={idCard} maxLength={18}
          onChange={e => setIdCard(e.target.value.toUpperCase().replace(/[^0-9X]/gi, ''))}
          placeholder="请输入18位身份证号码"
          onFocus={() => setFoc('id')} onBlur={() => setFoc('')} style={iSx(foc === 'id')} />
      </div>
      <div>
        <label style={lbl}>身份证照片</label>
        <div style={{ display: 'flex', gap: 12 }}>
          <IdUpload side="正面" img={front} onChange={setFront} />
          <IdUpload side="反面" img={back}  onChange={setBack}  />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11, marginTop: 8 }}>🔒 证件信息加密存储，仅用于平台实名核验</p>
      </div>
      {error && <p style={{ color: '#F87171', fontSize: 13 }}>⚠ {error}</p>}
      <SubmitBtn label="提交认证" onClick={submit} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 3 · 背景调查
═══════════════════════════════════════════════════════════════ */
function Step3({ onNext }: { onNext: () => void }) {
  const [choice,  setChoice]  = useState<'paid' | 'subsidy' | null>(null);
  const [showPay, setShowPay] = useState(false);
  const [payStep, setPayStep] = useState<'idle' | 'processing' | 'done'>('idle');
  const [status,  setStatus]  = useState<'idle' | 'pending' | 'passed'>('idle');

  const handlePaid = () => { setChoice('paid'); setShowPay(true); };
  const handleSubsidy = () => { setChoice('subsidy'); setStatus('pending'); };

  const handlePay = () => {
    setPayStep('processing');
    setTimeout(() => { setPayStep('done'); setStatus('pending'); setShowPay(false); }, 1800);
  };

  useEffect(() => {
    if (status !== 'pending') return;
    const t = setTimeout(() => setStatus('passed'), 3000);
    return () => clearTimeout(t);
  }, [status]);

  if (status === 'pending') return (
    <div style={{ animation: 'fadeInUp 0.35s ease both' }}>
      <div style={{ textAlign: 'center', padding: '28px 0 20px' }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: `rgba(${rgb},0.1)`, border: `2px solid rgba(${rgb},0.28)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <span style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.12)', borderTopColor: accent, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
        </div>
        <h3 style={{ color: '#1A1A1A', fontWeight: 800, fontSize: 17, marginBottom: 6 }}>背景调查进行中…</h3>
        <p style={{ color: '#78716C', fontSize: 13 }}>
          {choice === 'subsidy' ? '已提交申请，预计1-3个工作日审核' : '正在核查犯罪记录数据库'}
        </p>
      </div>
    </div>
  );

  if (status === 'passed') return (
    <div style={{ animation: 'fadeInUp 0.35s ease both' }}>
      <div style={{ textAlign: 'center', padding: '24px 0 20px' }}>
        <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'rgba(34,197,94,0.13)', border: '2px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Check style={{ width: 30, height: 30, color: '#4ade80' }} />
        </div>
        <h3 style={{ color: '#1A1A1A', fontWeight: 800, fontSize: 17, marginBottom: 6 }}>背景调查通过 ✓</h3>
        <p style={{ color: '#78716C', fontSize: 13 }}>无犯罪记录，符合平台要求</p>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {[{ icon: '🪪', t: '身份核验', s: '已通过' }, { icon: '🔍', t: '无犯罪记录', s: '已确认' }, { icon: '✅', t: '平台资质', s: '符合要求' }].map(b => (
          <div key={b.t} style={{ flex: 1, padding: '12px 10px', textAlign: 'center', borderRadius: 14, background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)' }}>
            <div style={{ fontSize: 18, marginBottom: 5 }}>{b.icon}</div>
            <p style={{ color: '#4ade80', fontSize: 11, fontWeight: 700 }}>{b.t}</p>
            <p style={{ color: '#78716C', fontSize: 10, marginTop: 2 }}>{b.s}</p>
          </div>
        ))}
      </div>
      <SubmitBtn label="下一步：知识测试" onClick={onNext} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Info banner */}
      <div style={{ padding: '16px', borderRadius: 16, background: `rgba(${rgb},0.08)`, border: `1px solid rgba(${rgb},0.22)` }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          <Shield style={{ width: 20, height: 20, color: accentM, flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>第三方背景调查</p>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, lineHeight: 1.65 }}>为保障宠物主和宠物的安全，平台要求所有遛狗师完成无犯罪记录核查（由第三方机构出具证明）。</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['公安部犯罪记录查询', '第三方征信机构', '结果5分钟内反馈'].map(t => (
            <span key={t} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: `rgba(${rgb},0.12)`, color: accentM, fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Option cards */}
      <p style={{ color: '#78716C', fontSize: 12, textAlign: 'center' }}>请选择提交方式</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Paid */}
        <button type="button" onClick={handlePaid} style={{
          padding: 18, borderRadius: 18, textAlign: 'left', cursor: 'pointer',
          background: choice === 'paid' ? `rgba(${rgb},0.1)` : 'rgba(255,255,255,0.04)',
          border: choice === 'paid' ? `1.5px solid rgba(${rgb},0.55)` : '1px solid rgba(255,255,255,0.09)',
          transition: 'all 0.2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>💳</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: 14 }}>自费提交</p>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(251,191,36,0.15)', color: '#FBBF24', fontWeight: 700 }}>¥99</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(34,197,94,0.1)', color: '#4ade80', fontWeight: 600 }}>⚡ 5分钟出结果</span>
              </div>
              <p style={{ color: '#78716C', fontSize: 12 }}>支付后立即启动查询，结果最快5分钟</p>
            </div>
          </div>
        </button>

        {/* Subsidy */}
        <button type="button" onClick={handleSubsidy} style={{
          padding: 18, borderRadius: 18, textAlign: 'left', cursor: 'pointer',
          background: choice === 'subsidy' ? `rgba(${rgb},0.1)` : 'rgba(255,255,255,0.04)',
          border: choice === 'subsidy' ? `1.5px solid rgba(${rgb},0.55)` : '1px solid rgba(255,255,255,0.09)',
          transition: 'all 0.2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: `rgba(${rgb},0.12)`, border: `1px solid rgba(${rgb},0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>🎁</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: 14 }}>申请平台补贴</p>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `rgba(${rgb},0.15)`, color: accentM, fontWeight: 700 }}>免费</span>
              </div>
              <p style={{ color: '#78716C', fontSize: 12 }}>提交申请后等待平台审核，1-3个工作日</p>
            </div>
          </div>
        </button>
      </div>

      {/* Payment modal */}
      {showPay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '100%', maxWidth: 480, background: '#12091F', borderRadius: '28px 28px 0 0', padding: 28, border: '1px solid rgba(255,255,255,0.1)', borderBottom: 'none', animation: 'slideUp 0.3s ease both' }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 24px' }} />
            <h3 style={{ color: 'white', fontWeight: 800, fontSize: 18, marginBottom: 6, textAlign: 'center' }}>背景调查费用</h3>
            <p style={{ color: '#78716C', fontSize: 13, textAlign: 'center', marginBottom: 24 }}>由第三方机构出具无犯罪记录证明</p>
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 20 }}>
              {[{ k: '背景调查服务费', v: '¥99.00' }, { k: '证明文件费', v: '¥0.00（平台补贴）' }].map(row => (
                <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>{row.k}</span>
                  <span style={{ color: 'white', fontWeight: 600 }}>{row.v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 4 }}>
                <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>合计</span>
                <span style={{ fontWeight: 900, background: `linear-gradient(135deg,${accent},${accentM})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>¥99.00</span>
              </div>
            </div>
            {payStep === 'processing' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span style={{ width: 28, height: 28, border: `3px solid rgba(${rgb},0.2)`, borderTopColor: accent, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 12 }}>支付处理中…</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[{ id: 'wechat', label: '微信支付', color: '#07C160' }, { id: 'alipay', label: '支付宝', color: '#1677FF' }].map(m => (
                  <button key={m.id} type="button" onClick={handlePay} style={{
                    padding: '14px 20px', borderRadius: 14, border: `1px solid rgba(255,255,255,0.1)`,
                    background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: 12, flexShrink: 0 }}>{m.label[0]}</div>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{m.label}</span>
                    <ChevronRight style={{ width: 16, height: 16, color: '#A8A29E', marginLeft: 'auto' }} />
                  </button>
                ))}
                <button type="button" onClick={() => setShowPay(false)} style={{ padding: '12px', borderRadius: 14, background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 13, cursor: 'pointer' }}>取消</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 4 · 宠物知识测试
═══════════════════════════════════════════════════════════════ */
const QUESTIONS = [
  { q: '遛狗途中狗狗突然倒地不起，第一步应该？', opts: ['继续遛狗，等它恢复', '立即联系主人和平台', '自行判断并处理', '先拍视频记录'], ans: 1 },
  { q: '带狗路过陌生狗只时，最安全的做法是？', opts: ['让两只狗自由互动', '加速快走不理会', '拉紧牵绳保持距离', '放开牵绳让狗社交'], ans: 2 },
  { q: '狗狗遛步中突然呕吐，正确处理是？', opts: ['忽略继续遛狗', '给狗大量喝水', '拍照记录并立刻通知主人', '自行观察半小时'], ans: 2 },
  { q: '炎热天气遛狗，以下哪项最重要？', opts: ['延长遛狗时间促进散热', '避开高温时段并携带饮水', '在阳光下休息乘凉', '快跑增加散热效率'], ans: 1 },
  { q: '狗狗在户外误食不明物品，正确做法是？', opts: ['等待观察无需干预', '给狗大量饮水稀释', '立即通知主人准备就医', '继续遛完再通知'], ans: 2 },
  { q: '遛狗时手机没电与主人失联，应该？', opts: ['继续遛到服务结束', '把狗拴在路边等待', '借手机联系主人或拨打平台客服', '直接送狗回家'], ans: 2 },
  { q: '狗狗突然挣脱牵绳跑走，第一步是？', opts: ['大声呼喊让它停止', '等它自己跑回来', '立刻追上并冷静呼唤，通知主人', '直接报警求助'], ans: 2 },
  { q: '服务期间拍摄宠物照片，必须做到？', opts: ['可随意发布到社交媒体', '仅发送给主人，不对外传播', '不需要拍照', '发布时打码即可'], ans: 1 },
  { q: '遛狗结束后，正确的交接流程是？', opts: ['直接离开即可', '把狗拴在门口', '电话通知主人已结束', '确认宠物安全交还主人并上传服务报告'], ans: 3 },
  { q: '以下哪种情况需要拒绝接单？', opts: ['天气轻微下雨', '狗狗体重超过15kg', '主人要求遛狗超2小时且未提供水', '遛狗路线较长'], ans: 2 },
];

function Step4({ onNext }: { onNext: () => void }) {
  const [cur,       setCur]       = useState(0);
  const [answers,   setAnswers]   = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null));
  const [selected,  setSelected]  = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [done,      setDone]      = useState(false);

  const N = QUESTIONS.length;
  const q = QUESTIONS[cur];
  const pct = Math.round((cur / N) * 100);

  const confirm = () => {
    if (selected === null) return;
    const next = [...answers]; next[cur] = selected; setAnswers(next);
    setConfirmed(true);
    setTimeout(() => {
      if (cur < N - 1) { setCur(c => c + 1); setSelected(null); setConfirmed(false); }
      else setDone(true);
    }, 700);
  };

  if (done) {
    const score = answers.filter((a, i) => a === QUESTIONS[i].ans).length;
    const pct100 = Math.round((score / N) * 100);
    const pass = pct100 >= 80;
    return (
      <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
        <div style={{ textAlign: 'center', padding: '20px 0 16px' }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{pass ? '🎉' : '📚'}</div>
          <h3 style={{ color: '#1A1A1A', fontWeight: 900, fontSize: 20, marginBottom: 6 }}>
            {pass ? '测试通过！' : '需要重新测试'}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, marginBottom: 18 }}>
            答对 {score}/{N} 题，得分 {pct100} 分（通过线：80分）
          </p>
          {/* Score ring */}
          <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 20px' }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="none"
                stroke={pass ? '#4ade80' : '#F87171'} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct100 / 100)}`}
                transform="rotate(-90 50 50)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
              <text x="50" y="50" textAnchor="middle" dominantBaseline="middle"
                fill={pass ? '#4ade80' : '#F87171'} fontSize="18" fontWeight="900" fontFamily="system-ui">{pct100}</text>
              <text x="50" y="64" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="system-ui">分</text>
            </svg>
          </div>
          {/* Per-question breakdown */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            {answers.map((a, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                background: a === QUESTIONS[i].ans ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)',
                border: `1px solid ${a === QUESTIONS[i].ans ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.35)'}`,
                color: a === QUESTIONS[i].ans ? '#4ade80' : '#F87171',
              }}>{a === QUESTIONS[i].ans ? '✓' : '✗'}</div>
            ))}
          </div>
        </div>
        {pass
          ? <SubmitBtn label="下一步：账号激活" onClick={onNext} />
          : <SubmitBtn label="重新测试" onClick={() => { setCur(0); setAnswers(Array(N).fill(null)); setSelected(null); setConfirmed(false); setDone(false); }} />}
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: '#78716C', fontSize: 12 }}>第 {cur + 1} / {N} 题</span>
          <span style={{ color: accentM, fontSize: 12, fontWeight: 700 }}>{pct}%</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.07)' }}>
          <div style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: `linear-gradient(90deg,${accent},${accentM})`, transition: 'width 0.4s ease', boxShadow: `0 0 8px rgba(${rgb},0.4)` }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ padding: '16px 18px', borderRadius: 18, background: `rgba(${rgb},0.07)`, border: `1px solid rgba(${rgb},0.2)`, marginBottom: 16 }}>
        <p style={{ color: '#4A4A4A', fontWeight: 700, fontSize: 14, lineHeight: 1.7 }}>
          <span style={{ color: accentM, fontWeight: 900, marginRight: 6 }}>Q{cur + 1}.</span>{q.q}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {q.opts.map((opt, i) => {
          const isCorrect = i === q.ans;
          const isSelected = selected === i;
          const showResult = confirmed;
          let bg = '#F5F4F2', border = '1px solid #E0E0E0', color = '#4A4A4A';
          if (isSelected && !showResult) { bg = `rgba(${rgb},0.1)`; border = `1.5px solid rgba(${rgb},0.55)`; color = '#4A4A4A'; }
          if (showResult && isCorrect) { bg = 'rgba(34,197,94,0.12)'; border = '1.5px solid rgba(34,197,94,0.45)'; color = '#4ade80'; }
          if (showResult && isSelected && !isCorrect) { bg = 'rgba(239,68,68,0.1)'; border = '1.5px solid rgba(239,68,68,0.38)'; color = '#F87171'; }
          return (
            <button key={i} type="button" onClick={() => !confirmed && setSelected(i)} style={{
              padding: '13px 16px', borderRadius: 14, textAlign: 'left', cursor: confirmed ? 'default' : 'pointer',
              background: bg, border, transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ width: 24, height: 24, borderRadius: 8, border: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, color: '#9B9B9B', background: 'white' }}>
                {['A', 'B', 'C', 'D'][i]}
              </span>
              <span style={{ color, fontSize: 13, fontWeight: isSelected || (showResult && isCorrect) ? 600 : 400 }}>{opt}</span>
              {showResult && isCorrect && <Check style={{ width: 16, height: 16, color: '#4ade80', marginLeft: 'auto', flexShrink: 0 }} />}
            </button>
          );
        })}
      </div>

      <SubmitBtn label={cur < N - 1 ? '确认并下一题' : '提交答案'} disabled={selected === null} onClick={confirm} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 5 · 账号激活与设置
═══════════════════════════════════════════════════════════════ */
const DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
function Step5({ name, onDone }: { name: string; onDone: () => void }) {
  const [bio,      setBio]      = useState('');
  const [radius,   setRadius]   = useState<3 | 5 | 10>(5);
  const [price,    setPrice]    = useState(60);
  const [avatar,   setAvatar]   = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Record<number, { on: boolean; start: string; end: string }>>(
    Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i, { on: i < 5, start: '09:00', end: '18:00' }]))
  );
  const [submitting, setSub]    = useState(false);
  const [foc,        setFoc]    = useState('');
  const [showCelebration, setCeleb] = useState(true);
  const avatarRef = useRef<HTMLInputElement>(null);

  useEffect(() => { const t = setTimeout(() => setCeleb(false), 2500); return () => clearTimeout(t); }, []);

  const toggleDay = (i: number) => setSchedule(s => ({ ...s, [i]: { ...s[i], on: !s[i].on } }));
  const setDayTime = (i: number, key: 'start' | 'end', val: string) =>
    setSchedule(s => ({ ...s, [i]: { ...s[i], [key]: val } }));

  const loadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => setAvatar(ev.target?.result as string); r.readAsDataURL(f);
    e.target.value = '';
  };

  const submit = () => {
    setSub(true);
    setTimeout(() => onDone(), 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Celebration banner */}
      {showCelebration && (
        <div style={{ textAlign: 'center', padding: '16px 0', animation: 'fadeInUp 0.4s ease both' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
          <h3 style={{ color: '#1A1A1A', fontWeight: 900, fontSize: 18, marginBottom: 4 }}>审核全部通过！</h3>
          <p style={{ color: '#78716C', fontSize: 13 }}>欢迎加入 Puppy Paw 遛狗师团队，{name}！</p>
        </div>
      )}

      {/* Avatar */}
      <div>
        <label style={lbl}>个人照片</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div onClick={() => avatarRef.current?.click()} style={{ width: 72, height: 72, borderRadius: 22, cursor: 'pointer', overflow: 'hidden', background: avatar ? 'transparent' : `linear-gradient(135deg,${accent},${accentM})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, flexShrink: 0, boxShadow: `0 6px 20px rgba(${rgb},0.35)`, position: 'relative' }}>
            {avatar ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🧑'}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }} onMouseLeave={e => { e.currentTarget.style.opacity = '0'; }}>
              <Camera style={{ width: 20, height: 20, color: 'white' }} />
            </div>
          </div>
          <input ref={avatarRef} type="file" accept="image/*" onChange={loadAvatar} style={{ display: 'none' }} />
          <div>
            <p style={{ color: '#1A1A1A', fontWeight: 700, fontSize: 14 }}>{name}</p>
            <p style={{ color: '#78716C', fontSize: 12, marginTop: 3 }}>点击头像上传照片</p>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label style={lbl}>个人介绍</label>
        <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
          placeholder="介绍一下自己，让宠物主了解你：养宠经验、性格特点、服务特色…"
          onFocus={() => setFoc('bio')} onBlur={() => setFoc('')}
          style={{ ...iSx(foc === 'bio'), resize: 'none', fontFamily: 'inherit', lineHeight: 1.65 }} />
      </div>

      {/* Schedule */}
      <div>
        <label style={lbl}>服务时间段</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DAYS.map((day, i) => {
            const s = schedule[i];
            return (
              <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 14, background: s.on ? `rgba(${rgb},0.08)` : 'rgba(255,255,255,0.03)', border: s.on ? `1px solid rgba(${rgb},0.25)` : '1px solid rgba(255,255,255,0.07)', transition: 'all 0.2s' }}>
                <button type="button" onClick={() => toggleDay(i)} style={{
                  width: 36, height: 20, borderRadius: 10, flexShrink: 0,
                  background: s.on ? `linear-gradient(135deg,${accent},${accentM})` : 'rgba(255,255,255,0.1)',
                  border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.28s',
                  boxShadow: s.on ? `0 2px 10px rgba(${rgb},0.4)` : 'none',
                }}>
                  <span style={{ position: 'absolute', top: 2, width: 16, height: 16, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', transition: 'left 0.25s', left: s.on ? 18 : 2 }} />
                </button>
                <span style={{ color: s.on ? '#1A1A1A' : '#9B9B9B', fontWeight: 600, fontSize: 13, width: 28, flexShrink: 0 }}>{day}</span>
                {s.on && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, animation: 'fadeInUp 0.2s ease both' }}>
                    <Clock style={{ width: 13, height: 13, color: '#9B9B9B', flexShrink: 0 }} />
                    <input type="time" value={s.start} onChange={e => setDayTime(i, 'start', e.target.value)}
                      style={{ background: '#F5F4F2', border: '1px solid #E0E0E0', borderRadius: 8, padding: '4px 8px', color: '#1A1A1A', fontSize: 12, outline: 'none', flex: 1 }} />
                    <span style={{ color: '#9B9B9B', fontSize: 12 }}>—</span>
                    <input type="time" value={s.end} onChange={e => setDayTime(i, 'end', e.target.value)}
                      style={{ background: '#F5F4F2', border: '1px solid #E0E0E0', borderRadius: 8, padding: '4px 8px', color: '#1A1A1A', fontSize: 12, outline: 'none', flex: 1 }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Service radius */}
      <div>
        <label style={lbl}>服务半径</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {([3, 5, 10] as const).map(r => (
            <button key={r} type="button" onClick={() => setRadius(r)} style={{
              padding: '16px 8px', borderRadius: 16, cursor: 'pointer',
              background: radius === r ? `rgba(${rgb},0.10)` : '#F5F4F2',
              border: radius === r ? `1.5px solid rgba(${rgb},0.55)` : '1px solid #E0E0E0',
              transition: 'all 0.18s', textAlign: 'center',
            }}>
              <MapPin style={{ width: 18, height: 18, color: radius === r ? accentM : '#9B9B9B', margin: '0 auto 6px' }} />
              <p style={{ color: radius === r ? accent : '#1A1A1A', fontWeight: 700, fontSize: 16 }}>{r} km</p>
              <p style={{ color: '#9B9B9B', fontSize: 11, marginTop: 3 }}>{r === 3 ? '精品服务' : r === 5 ? '推荐范围' : '广域覆盖'}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Pricing slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <label style={{ ...lbl, marginBottom: 0 }}>每小时定价</label>
          <span style={{ fontWeight: 900, fontSize: 20, background: `linear-gradient(135deg,${accent},${accentM})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>¥{price}</span>
        </div>
        <div style={{ position: 'relative', height: 6, borderRadius: 3, background: '#E0E0E0' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', borderRadius: 3, background: `linear-gradient(90deg,${accent},${accentM})`, width: `${((price - 30) / 120) * 100}%` }} />
          <input type="range" min={30} max={150} step={5} value={price} onChange={e => setPrice(+e.target.value)}
            style={{ position: 'absolute', inset: '-6px 0', width: '100%', opacity: 0, cursor: 'pointer', height: 18 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ color: '#A8A29E', fontSize: 11 }}>¥30</span>
          <span style={{ color: '#A8A29E', fontSize: 11 }}>¥150</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {[{ p: 40, l: '新人价' }, { p: 60, l: '均价' }, { p: 80, l: '优选' }, { p: 100, l: '精品' }].map(({ p, l }) => (
            <button key={p} type="button" onClick={() => setPrice(p)} style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: price === p ? `rgba(${rgb},0.10)` : '#F5F4F2', border: price === p ? `1px solid rgba(${rgb},0.45)` : '1px solid #E0E0E0', color: price === p ? accentM : '#78716C' }}>
              {l} ¥{p}
            </button>
          ))}
        </div>
      </div>

      <SubmitBtn label="完成注册，进入主页 🐾" onClick={submit} loading={submitting} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function WalkerRegisterPage() {
  const [step,  setStep]  = useState(1);
  const [phone, setPhone] = useState('');
  const [name,  setName]  = useState('');
  const { login }         = useAuth();
  const nav               = useNavigate();

  const toStep2 = useCallback((ph: string, nm: string) => { setPhone(ph); setName(nm); setStep(2); }, []);
  const toStep3 = useCallback(() => setStep(3), []);
  const toStep4 = useCallback(() => setStep(4), []);
  const toStep5 = useCallback(() => setStep(5), []);
  const done    = useCallback(() => {
    login(`${phone}@walker.com`, 'phone-auth', 'walker');
    setTimeout(() => nav('/walker'), 100);
  }, [phone, login, nav]);

  const titles = ['基本注册', '实名认证', '背景调查', '宠物知识测试', '账号激活与设置'];
  const subs   = ['手机号验证 + 填写姓名', '身份证核验', '无犯罪记录核查', '确认您的专业知识水平', '设置您的服务信息'];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#F9F8F6', paddingBottom: 48 }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.22) 1px,transparent 1px)', backgroundSize: '28px 28px', opacity: 0.05 }} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 50% at 15% 30%,rgba(139,92,246,0.2) 0%,transparent 65%),radial-gradient(ellipse 50% 40% at 85% 75%,rgba(255,60,172,0.1) 0%,transparent 60%)` }} />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px 0' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 46, height: 46, borderRadius: 16, background: `linear-gradient(135deg,${accent},${accentM})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 26px rgba(${rgb},0.38)` }}>
              <PawPrint style={{ width: 22, height: 22, color: 'white' }} />
            </div>
            <span style={{ fontWeight: 900, color: '#1A1A1A', fontSize: 22, letterSpacing: '-0.03em' }}>
              Puppy <span style={{ background: `linear-gradient(135deg,${accent},${accentM})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Paw</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{ ...gc, padding: '24px 24px 28px', animation: 'fadeInUp 0.6s ease-out 0.1s both' }}>
          <StepBar step={step} />

          <div style={{ marginBottom: 22 }}>
            <h2 style={{ fontWeight: 900, color: '#1A1A1A', fontSize: 19, marginBottom: 4 }}>
              Step {step} · {titles[step - 1]}
            </h2>
            <p style={{ color: '#78716C', fontSize: 13 }}>{subs[step - 1]}</p>
          </div>

          {step === 1 && <Step1 onNext={toStep2} />}
          {step === 2 && <Step2 name={name} onNext={toStep3} />}
          {step === 3 && <Step3 onNext={toStep4} />}
          {step === 4 && <Step4 onNext={toStep5} />}
          {step === 5 && <Step5 name={name} onDone={done} />}

          {step > 1 && step < 5 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: '#A8A29E', fontSize: 13, cursor: 'pointer' }}>
              ← 返回上一步
            </button>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#A8A29E', marginTop: 20 }}>
          已有账号？{' '}
          <Link to="/auth" style={{ color: accentM, fontWeight: 700, textDecoration: 'none' }}>直接登录</Link>
        </p>
      </div>

      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </div>
  );
}
