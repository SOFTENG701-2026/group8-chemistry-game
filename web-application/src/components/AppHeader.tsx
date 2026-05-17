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
      borderBottom: '1.5px solid #1A2E3B', 
      backgroundColor: 'transparent', 
      padding: '24px 0 20px',
      marginBottom: '28px'
    }}>
      <Container size="xl">
        <Group justify="space-between">
          <Text 
            component={RouterNavLink} 
            to="/"
            style={{ 
              fontFamily: '"Fraunces", Georgia, serif', 
              fontWeight: 700, 
              fontSize: '2rem', 
              letterSpacing: '-0.02em', 
              color: '#1A2E3B',
              textDecoration: 'none'
            }} 
          >
            WROPPY
          </Text>

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
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '1.1rem',
                    color: isActive ? '#E2603F' : '#1A2E3B',
                    borderBottom: isActive ? '2px solid #E2603F' : '2px solid transparent',
                    paddingBottom: '4px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {link.label}
                </UnstyledButton>
              );
            })}
          </Group>

          <Avatar radius="xl" color="orange" />
        </Group>
      </Container>
    </header>
  );
}
