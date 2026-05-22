import { Outlet } from 'react-router';
import { AppHeader } from '../components/AppHeader';

export function RootLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />
      <Outlet />
    </div>
  );
}
