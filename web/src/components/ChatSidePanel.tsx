import React from 'react';
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  Fade,
  alpha,
} from '@mui/material';
import { ChevronRight, SupportAgent, AutoAwesome } from '@mui/icons-material';
import MultiTurnChat from './MultiTurnChat';

interface ChatSidePanelProps {
  open: boolean;
  onClose: () => void;
}

const ChatSidePanel: React.FC<ChatSidePanelProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawerWidth = isMobile ? '100%' : 480;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          height: '100vh',
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        },
      }}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
            borderRadius: 0,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.3), transparent)',
            },
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              mr: 2,
              color: '#1E293B',
              backgroundColor: alpha('#1E293B', 0.05),
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: alpha('#1E293B', 0.1),
                transform: 'translateX(2px)',
              },
            }}
          >
            <ChevronRight />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box 
              sx={{ 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                mr: 2,
              }}
            >
              <SupportAgent 
                sx={{ 
                  color: '#3B82F6',
                  fontSize: '1.5rem',
                  zIndex: 1,
                }} 
              />
              <AutoAwesome 
                sx={{ 
                  color: '#7C3AED',
                  fontSize: '1rem',
                  position: 'absolute',
                  top: -2,
                  right: -2,
                  animation: 'sparkle 2s ease-in-out infinite',
                  '@keyframes sparkle': {
                    '0%, 100%': {
                      opacity: 0.5,
                      transform: 'scale(0.8)',
                    },
                    '50%': {
                      opacity: 1,
                      transform: 'scale(1)',
                    },
                  },
                }} 
              />
            </Box>
            
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: '#1E293B',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  mb: 0.5,
                  background: 'linear-gradient(135deg, #1E3A8A, #7C3AED)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Summer.AI
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748B',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                Immigration help & guidance
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Chat Content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <Fade in={open} timeout={600}>
            <Box sx={{ height: '100%' }}>
              <MultiTurnChat />
            </Box>
          </Fade>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ChatSidePanel; 