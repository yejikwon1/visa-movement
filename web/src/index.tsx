import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E3B55', // Rich navy blue
      light: '#465B82',
      dark: '#1A2438',
    },
    secondary: {
      main: '#C3973D', // Elegant gold
      light: '#D4B36A',
      dark: '#9C7A31',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2E3B55',
      secondary: '#465B82',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
      color: '#2E3B55',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.01em',
      color: '#2E3B55',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.01em',
      color: '#2E3B55',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#2E3B55',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#2E3B55',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: '#2E3B55',
    },
    subtitle1: {
      fontSize: '1.1rem',
      lineHeight: 1.5,
      color: '#465B82',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#465B82',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(46, 59, 85, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #2E3B55 30%, #465B82 90%)',
          color: '#FFFFFF',
          '&:hover': {
            background: 'linear-gradient(45deg, #1A2438 30%, #2E3B55 90%)',
            boxShadow: '0 6px 12px rgba(46, 59, 85, 0.2)',
          },
        },
        outlined: {
          borderColor: '#2E3B55',
          color: '#2E3B55',
          '&:hover': {
            borderColor: '#465B82',
            color: '#465B82',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(46, 59, 85, 0.08)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 28px rgba(46, 59, 85, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(46, 59, 85, 0.08)',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F7FA 100%)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 16px rgba(46, 59, 85, 0.12)',
          background: 'linear-gradient(90deg, #2E3B55 0%, #465B82 100%)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: '3px 3px 0 0',
            background: 'linear-gradient(90deg, #C3973D 0%, #D4B36A 100%)',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          padding: '12px 24px',
          transition: 'all 0.2s ease-in-out',
          color: '#465B82',
          '&:hover': {
            color: '#C3973D',
          },
          '&.Mui-selected': {
            color: '#2E3B55',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '16px 20px',
          boxShadow: '0 2px 8px rgba(46, 59, 85, 0.08)',
        },
        standardSuccess: {
          backgroundColor: '#E8F5E9',
          color: '#2E7D32',
        },
        standardError: {
          backgroundColor: '#FDE8E8',
          color: '#C62828',
        },
        standardWarning: {
          backgroundColor: '#FFF3E0',
          color: '#E65100',
        },
        standardInfo: {
          backgroundColor: '#E3F2FD',
          color: '#2E3B55',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(46, 59, 85, 0.12)',
          color: '#465B82',
        },
        head: {
          fontWeight: 600,
          background: 'rgba(46, 59, 85, 0.04)',
          color: '#2E3B55',
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
