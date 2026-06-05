import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { AppHeader } from '../components/AppHeader';

export function RootLayout() {
  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem('lewislab-high-contrast');
    if (stored === 'true') return true;
    if (stored === 'false') return false;
    return window.matchMedia?.('(prefers-contrast: more)').matches ?? false;
  });

  useEffect(() => {
    document.body.dataset.contrast = highContrast ? 'high' : 'normal';
    window.localStorage.setItem('lewislab-high-contrast', String(highContrast));
  }, [highContrast]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast((current) => !current)}
      />
      <Outlet />
    </div>
  );
}
