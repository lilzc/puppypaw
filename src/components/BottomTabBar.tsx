import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, ClipboardList, MessageCircle, User } from 'lucide-react';

const TABS = [
  { to: '/home',    icon: Home,          label: '首页' },
  { to: '/walkers', icon: MapPin,        label: '附近' },
  { to: '/owner',   icon: ClipboardList, label: '订单' },
  { to: '/profile', icon: MessageCircle, label: '消息' },
  { to: '/profile', icon: User,          label: '我的' },
];

export default function BottomTabBar() {
  const { pathname } = useLocation();

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'white',
      borderTop: '1px solid #F0EFED',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      display: 'flex', alignItems: 'stretch',
      height: 64,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map(({ to, icon: Icon, label }) => {
        const active = pathname === to || (to === '/home' && pathname === '/home');
        return (
          <Link key={label} to={to} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 3, textDecoration: 'none',
            color: active ? '#FF6B35' : '#A8A29E',
            transition: 'color 0.15s',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? 'rgba(255,107,53,0.1)' : 'transparent',
              transition: 'background 0.15s',
            }}>
              <Icon style={{ width: 20, height: 20 }} />
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
