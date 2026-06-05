import { useState } from 'react';
import { Group, Text, UnstyledButton, ActionIcon } from '@mantine/core';
import { NavLink as RouterNavLink, useLocation } from 'react-router';
import { IconAtom, IconHelp, IconContrast2 } from '@tabler/icons-react';
import { HowToPlayModal } from './HowToPlayModal';

export function AppHeader({
  highContrast,
  onToggleHighContrast,
}: {
  highContrast: boolean;
  onToggleHighContrast: () => void;
}) {
  const location = useLocation();
  const [helpOpen, setHelpOpen] = useState(false);

  const links = [
    { label: 'Lessons', path: '/lessons' },
    { label: 'Sandbox', path: '/sandbox' },
    { label: 'My progress', path: '/progress' },
  ];

  return (
    <header style={{
      borderBottom: '1.5px solid var(--panel-border)',
      backgroundColor: 'transparent',
      padding: '18px 0 16px',
      marginBottom: '32px',
    }}>
      <div style={{ padding: '0 24px' }}>
        <Group justify="space-between" align="center">
          <RouterNavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconAtom size={22} stroke={1.5} color="var(--text)" style={{ flexShrink: 0 }} />
            <Text style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontStyle: 'italic',
              fontSize: '1.15rem',
              letterSpacing: '-0.01em',
              color: 'var(--text)',
            }}>
              Lewis Lab
            </Text>
          </RouterNavLink>

          <Group gap="xl" align="center">
            {links.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <UnstyledButton
                  key={link.label}
                  component={RouterNavLink}
                  to={link.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.95rem',
                    color: isActive ? 'var(--text)' : 'var(--muted)',
                    borderBottom: isActive ? '2px solid var(--text)' : '2px solid transparent',
                    paddingBottom: '2px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {link.label}
                </UnstyledButton>
              );
            })}

            <ActionIcon
              variant="subtle"
              color="gray"
              size={36}
              radius="xl"
              aria-label={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
              aria-pressed={highContrast}
              onClick={onToggleHighContrast}
              title={highContrast ? 'High contrast: on' : 'High contrast: off'}
            >
              <IconContrast2 size={22} stroke={1.5} color="var(--muted)" />
            </ActionIcon>

            <ActionIcon
              variant="subtle"
              color="gray"
              size={36}
              radius="xl"
              aria-label="How to play"
              onClick={() => setHelpOpen(true)}
            >
              <IconHelp size={22} stroke={1.5} color="var(--muted)" />
            </ActionIcon>
          </Group>
        </Group>
      </div>

      <HowToPlayModal opened={helpOpen} onClose={() => setHelpOpen(false)} />
    </header>
  );
}
