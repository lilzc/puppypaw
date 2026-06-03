import { Link, useNavigate } from 'react-router-dom';
import { PawPrint, LogOut, LayoutDashboard, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: '#FFFFFF',
      borderBottom: '1px solid #E8E5E0',
      boxShadow: '0 1px 0 #E8E5E0',
    }}>
      <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg,#FF6B2C,#FF9245)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PawPrint style={{ width: 18, height: 18, color: 'white' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#1C1917', letterSpacing: '-0.02em' }}>
            Puppy <span style={{ background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Paw</span>
          </span>
        </Link>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isAuthenticated ? (
            <>
              <Link to={user?.role === 'owner' ? '/owner' : '/walker'}
                style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', padding: '6px 12px', borderRadius: 10, color: '#44403C', fontSize: 14, fontWeight: 500, transition: 'background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F5F4F2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <LayoutDashboard style={{ width: 16, height: 16 }} />
                <span>{user?.name}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#FFF4EF', color: '#FF6B2C', fontWeight: 600, border: '1px solid rgba(255,107,44,0.2)' }}>
                  {user?.role === 'owner' ? '宠物主' : '遛狗师'}
                </span>
              </Link>
              <Link to="/profile"
                style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, color: '#78716C', transition: 'all 0.15s', textDecoration: 'none' }}
                title="个人中心"
                onMouseEnter={e => { e.currentTarget.style.background = '#F5F4F2'; e.currentTarget.style.color = '#1C1917'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#78716C'; }}>
                <UserCircle style={{ width: 18, height: 18 }} />
              </Link>
              <button onClick={handleLogout}
                style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, color: '#78716C', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#78716C'; }}>
                <LogOut style={{ width: 16, height: 16 }} />
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" style={{ textDecoration: 'none', fontSize: 14, color: '#44403C', padding: '6px 12px', borderRadius: 10, transition: 'background 0.15s', fontWeight: 500 }}
                onMouseEnter={e => { e.currentTarget.style.background = '#F5F4F2'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                登录
              </Link>
              <Link to="/owner-register" style={{ textDecoration: 'none', background: 'linear-gradient(135deg,#FF6B2C,#FF9245)', color: 'white', fontSize: 14, fontWeight: 600, padding: '8px 20px', borderRadius: 22, boxShadow: '0 2px 8px rgba(255,107,44,0.3)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,107,44,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(255,107,44,0.3)'; e.currentTarget.style.transform = 'none'; }}>
                免费注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
