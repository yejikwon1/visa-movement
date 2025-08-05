import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  useMediaQuery,
  Fade,
  Slide,
  alpha
} from '@mui/material';
import { AccountBalance, TableChart, Info, SupportAgent } from '@mui/icons-material';

import MainLayout from './components/MainLayout';
import VisaTablePage from './pages/VisaTablePage';
import About from './pages/About';
import ChatSidePanel from './components/ChatSidePanel';
import FloatingChatButton from './components/FloatingChatButton';
import WelcomeNotification from './components/WelcomeNotification';
import PerformanceOptimizer from './components/PerformanceOptimizer';

import { fetchVisaBulletinData, fetchPermDays } from './services/visaService';
import { VisaBulletinData } from './types/visa';

// Create a sophisticated theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1E3A8A',
      light: '#3B82F6',
      dark: '#1E40AF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7C3AED',
      light: '#A78BFA',
      dark: '#5B21B6',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    warning: {
      main: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.025em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      letterSpacing: '-0.025em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      letterSpacing: '-0.025em',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 20px rgba(30, 58, 138, 0.15)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

const AppContent = () => {
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  const [vbData, setVbData] = useState<VisaBulletinData | null>(null);
  const [permDays, setPermDays] = useState<number | null>(null);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchData = async () => {
      const vbData = await fetchVisaBulletinData();
      const permDays = await fetchPermDays();
      setVbData(vbData);
      setPermDays(permDays);
    };
    fetchData();
  }, []);

  // Handle chatbot tab click
  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setChatOpen(!chatOpen);
  };

  // Close chat panel when navigating to other routes
  useEffect(() => {
    setChatOpen(false);
  }, [location.pathname]);

  const navigationItems = [
    { path: '/', label: 'Priority Checker', icon: <AccountBalance /> },
    { path: '/table', label: 'Visa Table', icon: <TableChart /> },
    { path: '/about', label: 'About', icon: <Info /> },
  ];

  return (
    <Fade in timeout={600}>
      <Box>
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <AccountBalance sx={{ mr: 2, fontSize: '1.5rem' }} />
              <Typography 
                variant="h5" 
                sx={{ 
                  flexGrow: 1, 
                  color: 'white',
                  fontWeight: 700,
                  letterSpacing: '-0.025em',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' }
                }}
              >
                VISA TRACKER
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isMobile && navigationItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: alpha('#ffffff', 0.1),
                      transform: 'translateY(-1px)',
                    },
                    ...(location.pathname === item.path && {
                      backgroundColor: alpha('#ffffff', 0.15),
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    }),
                  }}
                >
                  {item.label}
                </Button>
              ))}
              
              <Button
                color="inherit"
                onClick={handleChatClick}
                startIcon={<SupportAgent />}
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  transition: 'all 0.2s ease-in-out',
                  backgroundColor: chatOpen ? alpha('#ffffff', 0.15) : 'transparent',
                  '&:hover': {
                    backgroundColor: alpha('#ffffff', chatOpen ? 0.2 : 0.1),
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {isMobile ? 'Chat' : 'Assistant'}
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ minHeight: 'calc(100vh - 70px)' }}>
          <Slide direction="up" in mountOnEnter unmountOnExit timeout={400}>
            <Box>
              <Routes>
                <Route path="/" element={<MainLayout />} />
                <Route path="/table" element={<VisaTablePage />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </Box>
          </Slide>
        </Box>

        {/* Chat Side Panel */}
        <ChatSidePanel 
          open={chatOpen} 
          onClose={() => setChatOpen(false)} 
        />
        
        {/* Floating Chat Button */}
        <FloatingChatButton 
          onChatClick={() => setChatOpen(!chatOpen)}
          isChatOpen={chatOpen}
        />
        
        {/* Welcome Notification */}
        <WelcomeNotification 
          onStartChat={() => setChatOpen(true)}
        />
      </Box>
    </Fade>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <PerformanceOptimizer>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AppContent />
          </Router>
        </ThemeProvider>
      </PerformanceOptimizer>
    </HelmetProvider>
  );
};

export default App;
