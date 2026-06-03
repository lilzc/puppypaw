import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PawPrint, ChevronRight, Check, AlertTriangle, Upload, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Constants ───────────────────────────────────────────────── */
const BREEDS = ['柴犬','金毛','拉布拉多','泰迪','比熊','博美','哈士奇','萨摩耶','法牛','柯基','边牧','德牧','其他'];
const VACCINES = ['狂犬疫苗','六联疫苗','犬瘟热'];
const PERSONALITIES = ['温顺亲人','怕生胆小','活泼好动','有攻击性'];

const rgb = '255,107,44';
const accent = '#FF6B2C';
const accentMid = '#FF9245';

/* ── Shared styles ───────────────────────────────────────────── */
const gc: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #E8E5E0',
  borderRadius: 28,
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
};

const labelSx: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: '#78716C', marginBottom: 8,
  letterSpacing: '0.08em', textTransform: 'uppercase',
};

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%', padding: '14px 16px', boxSizing: 'border-box',
    background: focused ? '#FFFFFF' : '#F5F4F2',
    border: focused ? `1px solid rgba(${rgb},0.65)` : '1px solid #E0E0E0',
    boxShadow: focused ? `0 0 0 3px rgba(${rgb},0.10)` : 'none',
    borderRadius: 14, color: '#1A1A1A', fontSize: 14, outline: 'none',
    transition: 'border-color 0.25s, box-shadow 0.25s',
  };
}

/* ── Step indicator ──────────────────────────────────────────── */
function StepBar({ step }: { step: number }) {
  const labels = ['手机验证', '实名认证', '宠物档案'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 28 }}>
      {labels.map((label, i) => {
        const idx = i + 1;
        const done = step > idx;
        const active = step === idx;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? accent : active ? `rgba(${rgb},0.12)` : '#F0F0F0',
                border: active ? `2px solid ${accent}` : done ? 'none' : '1px solid #E0E0E0',
                fontSize: 13, fontWeight: 700,
                color: done ? 'white' : active ? accent : '#9B9B9B',
                transition: 'all 0.3s ease',
              }}>
                {done ? <Check style={{ width: 15, height: 15 }} /> : idx}
              </div>
              <span style={{ fontSize: 11, color: active ? accentMid : done ? '#78716C' : '#9B9B9B', fontWeight: active ? 700 : 400 }}>{label}</span>
            </div>
            {i < 2 && (
              <div style={{ width: 60, height: 1, margin: '0 4px', marginBottom: 18, background: step > idx ? accent : '#E0E0E0', transition: 'background 0.4s ease' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Submit button ───────────────────────────────────────────── */
function SubmitBtn({ label, onClick, loading, disabled }: { label: string; onClick?: () => void; loading?: boolean; disabled?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      onClick={onClick}
      disabled={loading || disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', padding: '15px 24px', marginTop: 8,
        background: `linear-gradient(135deg, ${accent}, ${accentMid})`,
        border: 'none', borderRadius: 16, color: 'white',
        fontSize: 15, fontWeight: 700, cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
        opacity: (loading || disabled) ? 0.55 : 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transform: hover && !loading && !disabled ? 'translateX(4px)' : 'none',
        boxShadow: hover && !loading && !disabled ? `0 12px 36px rgba(${rgb},0.5)` : `0 6px 22px rgba(${rgb},0.28)`,
        transition: 'transform 0.2s, box-shadow 0.2s, opacity 0.2s',
      }}
    >
      {loading
        ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
        : <>{label} <ChevronRight style={{ width: 17, height: 17 }} /></>}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 1 — 手机号 + OTP
═══════════════════════════════════════════════════════════════ */
function Step1({ onNext }: { onNext: (phone: string) => void }) {
  const [phone, setPhone]       = useState('');
  const [code, setCode]         = useState(['', '', '', '', '', '']);
  const [sent, setSent]         = useState(false);
  const [mockCode, setMock]     = useState('');
  const [countdown, setDown]    = useState(0);
  const [error, setError]       = useState('');
  const [focusedP, setFP]       = useState(false);
  const [verified, setVerified] = useState(false);
  const boxRefs                 = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef                = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendCode = () => {
    if (phone.length !== 11 || !/^1[3-9]\d{9}$/.test(phone)) { setError('请输入有效的11位手机号'); return; }
    setError('');
    const c = String(Math.floor(100000 + Math.random() * 900000));
    setMock(c);
    setSent(true);
    setDown(60);
    setCode(['', '', '', '', '', '']);
    timerRef.current = setInterval(() => setDown(d => { if (d <= 1) { clearInterval(timerRef.current!); return 0; } return d - 1; }), 1000);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const onBoxChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...code]; next[i] = digit;
    setCode(next);
    if (digit && i < 5) setTimeout(() => boxRefs.current[i + 1]?.focus(), 10);
    if (next.every(d => d) && next.join('') === mockCode) {
      setVerified(true); setError('');
    } else if (next.every(d => d)) {
      setError('验证码错误，请重新输入');
      setTimeout(() => { setCode(['','','','','','']); boxRefs.current[0]?.focus(); }, 600);
    }
  };

  const onBoxKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) {
      const next = [...code]; next[i - 1] = ''; setCode(next);
      setTimeout(() => boxRefs.current[i - 1]?.focus(), 10);
    }
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (digits.length === 6) {
      const next = digits.split(''); setCode(next);
      if (next.join('') === mockCode) setVerified(true);
      else setError('验证码错误');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={labelSx}>手机号码</label>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#78716C', fontSize: 14 }}>+86</span>
            <input
              type="tel" maxLength={11} value={phone}
              onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
              placeholder="138 0000 0000"
              onFocus={() => setFP(true)} onBlur={() => setFP(false)}
              style={{ ...inputStyle(focusedP), paddingLeft: 48 }}
            />
          </div>
          <button
            type="button" onClick={sendCode} disabled={countdown > 0 || verified}
            style={{
              flexShrink: 0, padding: '0 16px', borderRadius: 14,
              background: countdown > 0 || verified ? '#F0F0F0' : `linear-gradient(135deg,${accent},${accentMid})`,
              border: 'none', color: countdown > 0 || verified ? '#9B9B9B' : 'white',
              fontSize: 13, fontWeight: 700, cursor: countdown > 0 || verified ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap', transition: 'all 0.2s',
            }}
          >
            {verified ? '✓ 已验证' : countdown > 0 ? `${countdown}s` : sent ? '重新发送' : '发送验证码'}
          </button>
        </div>
      </div>

      {sent && !verified && (
        <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
          {/* Mock code hint */}
          <div style={{ padding: '10px 14px', borderRadius: 12, background: 'rgba(255,107,44,0.08)', border: '1px solid rgba(255,107,44,0.2)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📱</span>
            <span style={{ color: '#4A4A4A', fontSize: 13 }}>
              模拟验证码：<strong style={{ color: accentMid, letterSpacing: 3 }}>{mockCode}</strong>
            </span>
          </div>
          <label style={labelSx}>输入验证码</label>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }} onPaste={onPaste}>
            {code.map((d, i) => (
              <input
                key={i}
                ref={el => { boxRefs.current[i] = el; }}
                type="text" inputMode="numeric" maxLength={2} value={d}
                onChange={e => onBoxChange(i, e.target.value)}
                onKeyDown={e => onBoxKey(i, e)}
                style={{
                  width: 46, height: 56, textAlign: 'center', fontSize: 22, fontWeight: 800,
                  background: d ? '#FFFFFF' : '#F5F4F2',
                  border: d ? `2px solid rgba(${rgb},0.65)` : '1px solid #E0E0E0',
                  borderRadius: 14, color: '#1A1A1A', outline: 'none',
                  boxShadow: d ? `0 0 0 3px rgba(${rgb},0.08)` : 'none',
                  transition: 'all 0.15s',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {verified && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 14, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', animation: 'fadeInUp 0.3s ease both' }}>
          <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Check style={{ width: 13, height: 13, color: 'white' }} />
          </div>
          <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 14 }}>手机号验证成功！</span>
        </div>
      )}

      {error && <p style={{ color: '#F87171', fontSize: 13, textAlign: 'center' }}>{error}</p>}

      <SubmitBtn label="下一步：实名认证" disabled={!verified} onClick={() => onNext(phone)} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 2 — 实名认证
═══════════════════════════════════════════════════════════════ */
function Step2({ onNext }: { onNext: (name: string, idCard: string) => void }) {
  const [realName, setRealName] = useState('');
  const [idCard,   setIdCard]   = useState('');
  const [frontImg, setFront]    = useState<string | null>(null);
  const [backImg,  setBack]     = useState<string | null>(null);
  const [status, setStatus]     = useState<'idle' | 'reviewing' | 'passed'>('idle');
  const [focusedN, setFN]       = useState(false);
  const [focusedI, setFI]       = useState(false);
  const [error, setError]       = useState('');
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef  = useRef<HTMLInputElement>(null);

  const loadImg = (setter: (s: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = ev => setter(ev.target?.result as string); r.readAsDataURL(f);
    e.target.value = '';
  };

  const submit = () => {
    if (!realName.trim()) { setError('请输入真实姓名'); return; }
    const id = idCard.replace(/\s/g, '');
    if (!/^\d{17}[\dX]$/i.test(id)) { setError('请输入有效的18位身份证号'); return; }
    if (!frontImg || !backImg) { setError('请上传身份证正反面照片'); return; }
    setError('');
    setStatus('reviewing');
    setTimeout(() => setStatus('passed'), 2000);
  };

  function IdUpload({ side, img, inputRef, onLoad }: { side: string; img: string | null; inputRef: React.RefObject<HTMLInputElement | null>; onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          flex: 1, minHeight: 110, borderRadius: 16, cursor: 'pointer',
          border: img ? '1.5px solid rgba(255,107,44,0.4)' : '1.5px dashed rgba(255,255,255,0.15)',
          background: img ? 'transparent' : 'rgba(255,255,255,0.04)',
          overflow: 'hidden', position: 'relative', transition: 'border-color 0.2s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = img ? 'rgba(255,107,44,0.65)' : 'rgba(255,255,255,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = img ? 'rgba(255,107,44,0.4)' : 'rgba(255,255,255,0.15)'; }}
      >
        {img ? (
          <>
            <img src={img} alt={side} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '0'; }}>
              <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>点击更换</span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <Upload style={{ width: 22, height: 22, color: 'rgba(255,255,255,0.25)', margin: '0 auto 8px' }} />
            <p style={{ color: '#78716C', fontSize: 12, fontWeight: 600 }}>身份证{side}</p>
            <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11, marginTop: 4 }}>点击上传</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" onChange={onLoad} style={{ display: 'none' }} />
      </div>
    );
  }

  if (status === 'reviewing') return (
    <div style={{ textAlign: 'center', padding: '32px 0', animation: 'fadeInUp 0.35s ease both' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,107,44,0.12)', border: `2px solid rgba(${rgb},0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <span style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.15)', borderTopColor: accent, borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
      </div>
      <h3 style={{ color: '#1A1A1A', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>审核中…</h3>
      <p style={{ color: '#78716C', fontSize: 14 }}>正在核验您的身份信息，请稍候</p>
    </div>
  );

  if (status === 'passed') return (
    <div style={{ textAlign: 'center', padding: '28px 0', animation: 'fadeInUp 0.35s ease both' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(34,197,94,0.14)', border: '2px solid rgba(34,197,94,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <Check style={{ width: 32, height: 32, color: '#4ade80' }} />
      </div>
      <h3 style={{ color: '#1A1A1A', fontWeight: 800, fontSize: 18, marginBottom: 8 }}>实名认证通过！</h3>
      <p style={{ color: '#78716C', fontSize: 14, marginBottom: 28 }}>身份信息已核验，信用体系已激活</p>
      <SubmitBtn label="下一步：登记宠物" onClick={() => onNext(realName, idCard)} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <label style={labelSx}>真实姓名</label>
        <input type="text" value={realName} onChange={e => setRealName(e.target.value)} placeholder="请输入与证件一致的姓名"
          onFocus={() => setFN(true)} onBlur={() => setFN(false)} style={inputStyle(focusedN)} />
      </div>
      <div>
        <label style={labelSx}>身份证号码</label>
        <input type="text" value={idCard} maxLength={18}
          onChange={e => setIdCard(e.target.value.toUpperCase().replace(/[^0-9X]/gi, ''))}
          placeholder="18位身份证号码" onFocus={() => setFI(true)} onBlur={() => setFI(false)} style={inputStyle(focusedI)} />
      </div>
      <div>
        <label style={labelSx}>身份证照片</label>
        <div style={{ display: 'flex', gap: 12 }}>
          <IdUpload side="正面" img={frontImg} inputRef={frontRef} onLoad={loadImg(setFront)} />
          <IdUpload side="反面" img={backImg}  inputRef={backRef}  onLoad={loadImg(setBack)}  />
        </div>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 8 }}>🔒 证件信息加密存储，仅用于平台实名核验</p>
      </div>
      {error && <p style={{ color: '#F87171', fontSize: 13 }}>⚠ {error}</p>}
      <SubmitBtn label="提交认证" onClick={submit} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP 3 — 宠物档案
═══════════════════════════════════════════════════════════════ */
function Step3({ onDone }: { onDone: () => void }) {
  const [petName,     setPetName]     = useState('');
  const [breed,       setBreed]       = useState('');
  const [age,         setAge]         = useState('');
  const [weight,      setWeight]      = useState('');
  const [vaccines,    setVaccines]    = useState<string[]>([]);
  const [personality, setPersonality] = useState<string[]>([]);
  const [health,      setHealth]      = useState('');
  const [notes,       setNotes]       = useState('');
  const [submitting,  setSub]         = useState(false);
  const [error,       setError]       = useState('');
  const [foc,         setFoc]         = useState('');

  const toggleArr = (arr: string[], val: string, set: (a: string[]) => void) =>
    set(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const isAggressive = personality.includes('有攻击性');

  const submit = () => {
    if (!petName.trim()) { setError('请输入宠物名字'); return; }
    if (!breed) { setError('请选择犬种'); return; }
    if (!age || !weight) { setError('请填写年龄和体重'); return; }
    setError(''); setSub(true);
    setTimeout(() => onDone(), 1400);
  };

  function TagPill({ label, active, color, onClick }: { label: string; active: boolean; color?: string; onClick: () => void }) {
    const c = color || rgb;
    return (
      <button type="button" onClick={onClick} style={{
        padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        background: active ? `rgba(${c},0.18)` : 'rgba(255,255,255,0.05)',
        border: active ? `1.5px solid rgba(${c},0.6)` : '1px solid rgba(255,255,255,0.1)',
        color: active ? `rgb(${c})` : 'rgba(255,255,255,0.45)',
        transition: 'all 0.18s',
      }}>
        {active ? '✓ ' : ''}{label}
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Name + breed row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelSx}>宠物名字</label>
          <input type="text" value={petName} onChange={e => setPetName(e.target.value)} placeholder="豆豆"
            onFocus={() => setFoc('name')} onBlur={() => setFoc('')} style={inputStyle(foc === 'name')} />
        </div>
        <div>
          <label style={labelSx}>犬种</label>
          <select value={breed} onChange={e => setBreed(e.target.value)}
            style={{ ...inputStyle(foc === 'breed'), appearance: 'none', WebkitAppearance: 'none' }}
            onFocus={() => setFoc('breed')} onBlur={() => setFoc('')}>
            <option value="" style={{ background: '#1a1a2e' }}>请选择</option>
            {BREEDS.map(b => <option key={b} value={b} style={{ background: '#1a1a2e' }}>{b}</option>)}
          </select>
        </div>
      </div>

      {/* Age + weight row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={labelSx}>年龄（岁）</label>
          <input type="number" min="0" max="25" value={age} onChange={e => setAge(e.target.value)} placeholder="3"
            onFocus={() => setFoc('age')} onBlur={() => setFoc('')} style={inputStyle(foc === 'age')} />
        </div>
        <div>
          <label style={labelSx}>体重（kg）</label>
          <input type="number" min="0" max="100" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} placeholder="12"
            onFocus={() => setFoc('weight')} onBlur={() => setFoc('')} style={inputStyle(foc === 'weight')} />
        </div>
      </div>

      {/* Vaccines */}
      <div>
        <label style={labelSx}>疫苗情况（可多选）</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {VACCINES.map(v => (
            <TagPill key={v} label={v} active={vaccines.includes(v)} onClick={() => toggleArr(vaccines, v, setVaccines)} />
          ))}
          <TagPill label="暂未接种" active={vaccines.includes('暂未接种')} color="239,68,68" onClick={() => toggleArr(vaccines, '暂未接种', setVaccines)} />
        </div>
      </div>

      {/* Personality */}
      <div>
        <label style={labelSx}>性格特征（可多选）</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PERSONALITIES.map(p => (
            <TagPill
              key={p} label={p} active={personality.includes(p)}
              color={p === '有攻击性' ? '249,115,22' : rgb}
              onClick={() => toggleArr(personality, p, setPersonality)}
            />
          ))}
        </div>
        {isAggressive && (
          <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 14, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.35)', display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'fadeInUp 0.25s ease both' }}>
            <AlertTriangle style={{ width: 18, height: 18, color: '#FB923C', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ color: '#FB923C', fontWeight: 700, fontSize: 13, marginBottom: 3 }}>注意：已标记攻击倾向</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.6 }}>遛狗师将收到警示提醒，建议在备注中说明情况，以便提前做好防护准备。</p>
            </div>
          </div>
        )}
      </div>

      {/* Health + notes */}
      <div>
        <label style={labelSx}>健康状况</label>
        <textarea value={health} onChange={e => setHealth(e.target.value)} placeholder={'如：骨折恢复期、心脏病、关节炎，或填写"健康"…'} rows={2}
          onFocus={() => setFoc('health')} onBlur={() => setFoc('')}
          style={{ ...inputStyle(foc === 'health'), resize: 'none', fontFamily: 'inherit', lineHeight: 1.6 }} />
      </div>
      <div>
        <label style={labelSx}>特殊注意事项</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="如：不能跑太快、需要每隔20分钟喂水、遇到其他狗要注意…" rows={3}
          onFocus={() => setFoc('notes')} onBlur={() => setFoc('')}
          style={{ ...inputStyle(foc === 'notes'), resize: 'none', fontFamily: 'inherit', lineHeight: 1.6 }} />
      </div>

      {error && <p style={{ color: '#F87171', fontSize: 13 }}>⚠ {error}</p>}
      <SubmitBtn label="完成注册，进入主页" onClick={submit} loading={submitting} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function OwnerRegisterPage() {
  const [step, setStep] = useState(1);
  const { login }       = useAuth();
  const nav             = useNavigate();
  const [phone, setPhone]   = useState('');
  const [name,  setName]    = useState('');

  const toStep2 = useCallback((ph: string) => { setPhone(ph); setStep(2); }, []);
  const toStep3 = useCallback((nm: string) => { setName(nm); setStep(3); }, []);
  const done    = useCallback(() => {
    login(`${phone}@phone.com`, 'phone-auth', 'owner');
    setTimeout(() => nav('/owner'), 100);
  }, [phone, login, nav]);

  const titles = ['手机号注册', '实名认证', '登记宠物档案'];
  const subs   = ['输入手机号并验证身份', '提交证件完成实名认证', '让遛狗师了解你的爱犬'];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: '#F9F8F6' }}>
      {/* Subtle tint */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 40% at 20% 30%, rgba(255,107,44,0.05) 0%, transparent 65%)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28, animation: 'logoReveal 0.65s ease-out both' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 46, height: 46, borderRadius: 16, background: `linear-gradient(135deg,${accent},${accentMid})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 26px rgba(${rgb},0.4)` }}>
              <PawPrint style={{ width: 22, height: 22, color: 'white' }} />
            </div>
            <span style={{ fontWeight: 900, color: '#1A1A1A', fontSize: 22, letterSpacing: '-0.03em' }}>
              Puppy <span style={{ background: `linear-gradient(135deg,${accent},${accentMid})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Paw</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{ ...gc, padding: 28, animation: 'fadeInUp 0.65s ease-out 0.1s both' }}>
          <StepBar step={step} />

          {/* Step heading */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontWeight: 900, color: '#1A1A1A', fontSize: 20, marginBottom: 4 }}>
              Step {step} · {titles[step - 1]}
            </h2>
            <p style={{ color: '#78716C', fontSize: 13 }}>{subs[step - 1]}</p>
          </div>

          {step === 1 && <Step1 onNext={toStep2} />}
          {step === 2 && <Step2 onNext={toStep3} />}
          {step === 3 && <Step3 onDone={done} />}

          {/* Back link */}
          {step > 1 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: '#9B9B9B', fontSize: 13, cursor: 'pointer' }}>
              ← 返回上一步
            </button>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.25)', marginTop: 20 }}>
          已有账号？{' '}
          <Link to="/auth" style={{ color: accentMid, fontWeight: 700, textDecoration: 'none' }}>直接登录</Link>
        </p>
      </div>
    </div>
  );
}
