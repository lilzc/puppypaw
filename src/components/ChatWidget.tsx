import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, ImagePlus } from 'lucide-react';

interface Msg {
  id: string;
  from: 'me' | 'other';
  text?: string;
  imgUrl?: string;
  time: string;
}

const now = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });

const INIT: Msg[] = [
  { id: '1', from: 'other', text: '您好！我是张大伟，已在您楼下等候 🐾', time: '09:01' },
  { id: '2', from: 'me',    text: '好的，马上下来！',                      time: '09:02' },
  { id: '3', from: 'other', text: '豆豆今天状态超棒，很活泼！',            time: '09:15' },
  { id: '4', from: 'other', imgUrl: '__mock__',                             time: '09:22' },
];

interface Props {
  partnerName:  string;
  partnerEmoji: string;
}

export default function ChatWidget({ partnerName, partnerEmoji }: Props) {
  const [open,   setOpen]   = useState(false);
  const [msgs,   setMsgs]   = useState<Msg[]>(INIT);
  const [input,  setInput]  = useState('');
  const [unread, setUnread] = useState(1);

  const fileRef   = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  }, [open, msgs.length]);

  const send = () => {
    if (!input.trim()) return;
    const msg: Msg = { id: Date.now().toString(), from: 'me', text: input.trim(), time: now() };
    setMsgs(p => [...p, msg]);
    setInput('');
    setTimeout(() => {
      const reply: Msg = { id: Date.now() + 'r', from: 'other', text: '好的！👍', time: now() };
      setMsgs(p => [...p, reply]);
      if (!open) setUnread(n => n + 1);
    }, 1800);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const imgUrl = ev.target?.result as string;
      setMsgs(p => [...p, { id: Date.now().toString(), from: 'me', imgUrl, time: now() }]);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 500 }}>

      {/* Chat panel */}
      {open && (
        <div
          className="mb-3 rounded-3xl overflow-hidden anim-fade-sc"
          style={{
            width: 320, height: 480,
            display: 'flex', flexDirection: 'column',
            background: 'rgba(10,16,34,0.97)',
            backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.75)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#FF6B2C,#FF9245)' }}>
              {partnerEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-sm leading-none">{partnerName}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>服务中</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {msgs.map(msg => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                {msg.from !== 'me' && (
                  <div className="rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', marginBottom: 16 }}>
                    {partnerEmoji}
                  </div>
                )}
                <div style={{ maxWidth: 200 }}>
                  {/* Mock photo placeholder */}
                  {msg.imgUrl === '__mock__' ? (
                    <div className="rounded-2xl flex items-center justify-center"
                      style={{ width: 120, height: 90, background: 'rgba(255,107,44,0.12)', border: '1px solid rgba(255,107,44,0.22)' }}>
                      <span style={{ fontSize: 36 }}>🐕</span>
                    </div>
                  ) : msg.imgUrl ? (
                    <img src={msg.imgUrl} alt="" className="rounded-2xl" style={{ maxWidth: 180, display: 'block' }} />
                  ) : (
                    <div className="px-3 py-2 text-sm text-white"
                      style={{
                        background: msg.from === 'me' ? 'linear-gradient(135deg,#FF6B2C,#FF9245)' : 'rgba(255,255,255,0.1)',
                        borderRadius: msg.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        wordBreak: 'break-word',
                      }}>
                      {msg.text}
                    </div>
                  )}
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.22)', textAlign: msg.from === 'me' ? 'right' : 'left' }}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button onClick={() => fileRef.current?.click()}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', padding: 6, display: 'flex', flexShrink: 0 }}>
                <ImagePlus style={{ width: 18, height: 18 }} />
              </button>
              <input type="file" ref={fileRef} accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="发送消息…"
                className="auth-input"
                style={{ flex: 1, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '9px 14px', color: 'white', fontSize: 13, outline: 'none' }}
                onFocus={e => { e.target.style.borderColor = 'rgba(255,107,44,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              />
              <button onClick={send} className="btn-glow flex items-center justify-center flex-shrink-0"
                style={{ width: 34, height: 34, borderRadius: 10, border: 'none', cursor: 'pointer' }}>
                <Send style={{ width: 15, height: 15, color: 'white' }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="btn-glow flex items-center justify-center"
        style={{ width: 52, height: 52, borderRadius: 16, border: 'none', cursor: 'pointer', position: 'relative', boxShadow: '0 8px 24px rgba(255,107,44,0.45)' }}
      >
        {open
          ? <X style={{ width: 22, height: 22, color: 'white' }} />
          : <MessageSquare style={{ width: 22, height: 22, color: 'white' }} />}
        {!open && unread > 0 && (
          <div style={{
            position: 'absolute', top: -5, right: -5,
            width: 19, height: 19, borderRadius: '50%',
            background: '#EF4444', border: '2px solid #070E1C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: 'white',
          }}>{unread}</div>
        )}
      </button>
    </div>
  );
}
