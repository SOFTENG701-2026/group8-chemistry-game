import { Group, Text, Avatar, UnstyledButton, Container } from '@mantine/core';
import { NavLink as RouterNavLink, useLocation } from 'react-router';

export function AppHeader() {
  const location = useLocation();

  const links = [
    { label: 'Lessons', path: '/levels' },
    { label: 'Sandbox', path: '/sandbox' },
    { label: 'My progress', path: '/progress' },
  ];

  return (
    <header style={{
      borderBottom: '1.5px solid rgba(26,46,59,0.15)',
      backgroundColor: 'transparent',
      padding: '18px 0 16px',
      marginBottom: '32px',
    }}>
      <Container size="xl">
        <Group justify="space-between" align="center">
          <RouterNavLink to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 22,
              height: 22,
              border: '1.5px solid #1A2E3B',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              color: '#1A2E3B',
              flexShrink: 0,
            }}>
              ⊙
            </div>
            <Text style={{
              fontFamily: '"Fraunces", Georgia, serif',
              fontWeight: 600,
              fontStyle: 'italic',
              fontSize: '1.15rem',
              letterSpacing: '-0.01em',
              color: '#1A2E3B',
            }}>
              Untitled Chemistry Game
            </Text>
          </RouterNavLink>

          <Group gap="xl">
            {links.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <UnstyledButton
                  key={link.label}
                  component={RouterNavLink}
                  to={link.path}
                  style={{
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.95rem',
                    color: isActive ? '#1A2E3B' : '#4A6275',
                    borderBottom: isActive ? '2px solid #1A2E3B' : '2px solid transparent',
                    paddingBottom: '2px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {link.label}
                </UnstyledButton>
              );
            })}
          </Group>

          <Avatar radius="xl" size={36} style={{ backgroundColor: '#E2603F', color: 'white', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.8rem' }}>
            AN
          </Avatar>
        </Group>
      </Container>
    </header>
  );
}
