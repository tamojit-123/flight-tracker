import { createTheme, rem } from '@mantine/core';

export const aeroTheme = createTheme({
  colorScheme: 'dark',

  colors: {
    void: ['#1a2030','#151c2a','#111623','#0d1220','#0a0e1a','#080C14','#060910','#03050D','#02040a','#010207'],
    cyan: ['#e0faff','#b3f3ff','#80ebff','#4de3ff','#1adaff','#00D4FF','#00a8cc','#007d99','#005266','#002633'],
    amber: ['#fff8e0','#ffedb3','#ffe280','#ffd64d','#ffca1a','#FFB800','#cc9300','#996e00','#664900','#332500'],
    crimson: ['#ffe0e6','#ffb3bf','#ff8099','#ff4d73','#ff1a4d','#FF3A5C','#cc1733','#99001f','#66000f','#330005'],
    matrix: ['#e0fff2','#b3ffdf','#80ffcc','#4dffb9','#1affa6','#00FF88','#00cc6d','#009951','#006636','#00331b'],
  },

  primaryColor: 'cyan',
  primaryShade: 5,

  fontFamily: '"Space Grotesk", "Segoe UI", sans-serif',
  fontFamilyMonospace: '"JetBrains Mono", "Fira Code", monospace',
  headings: {
    fontFamily: '"Orbitron", "Rajdhani", sans-serif',
    fontWeight: '700',
  },

  defaultRadius: 'md',

  components: {
    Paper: {
      defaultProps: { bg: 'void.5' },
      styles: {
        root: {
          backdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(0, 212, 255, 0.12)',
        }
      }
    },
    Badge: {
      styles: { root: { fontFamily: '"JetBrains Mono", monospace', letterSpacing: '0.1em' } }
    },
    Button: {
      styles: {
        root: { fontFamily: '"Orbitron", sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }
      }
    },
    Drawer: {
      styles: {
        content: {
          background: 'rgba(8, 12, 20, 0.85)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(0, 212, 255, 0.15)',
        },
        header: { background: 'transparent' }
      }
    },
    Modal: {
      styles: {
        content: {
          background: 'rgba(8, 12, 20, 0.9)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(0, 212, 255, 0.15)',
        }
      }
    },
    Notification: {
      styles: {
        root: {
          background: 'rgba(8, 12, 20, 0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
        }
      }
    },
    TextInput: {
      styles: {
        input: {
          background: 'rgba(8, 12, 20, 0.6)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          color: '#E8F4FF',
          fontFamily: '"JetBrains Mono", monospace',
          '&:focus': { borderColor: '#00D4FF', boxShadow: '0 0 20px rgba(0,212,255,0.25)' }
        }
      }
    },
    Autocomplete: {
      styles: {
        input: {
          background: 'rgba(8, 12, 20, 0.6)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          color: '#E8F4FF',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: rem(16),
          '&:focus': { borderColor: '#00D4FF', boxShadow: '0 0 0 2px rgba(0,212,255,0.2), 0 0 30px rgba(0,212,255,0.15)' }
        },
        dropdown: {
          background: 'rgba(8, 12, 20, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 212, 255, 0.15)',
        }
      }
    },
    Slider: {
      styles: {
        track: { '&::before': { background: 'rgba(0,212,255,0.15)' } },
        bar: { background: 'linear-gradient(90deg, #00D4FF, #00FF88)' },
        thumb: { borderColor: '#00D4FF', background: '#080C14', boxShadow: '0 0 8px #00D4FF' }
      }
    }
  },

  other: {
    glowCyan:  '0 0 8px rgba(0,212,255,0.6), 0 0 24px rgba(0,212,255,0.3), 0 0 60px rgba(0,212,255,0.1)',
    glowAmber: '0 0 8px rgba(255,184,0,0.6), 0 0 24px rgba(255,184,0,0.3)',
    glowGreen: '0 0 8px rgba(0,255,136,0.6), 0 0 24px rgba(0,255,136,0.3)',
    glowRed:   '0 0 8px rgba(255,58,92,0.6), 0 0 24px rgba(255,58,92,0.3)',
  }
});