import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  Button,
  Fade,
  alpha,
} from '@mui/material';
import {
  SupportAgent,
  AutoAwesome,
  Close,
} from '@mui/icons-material';

interface WelcomeNotificationProps {
  onStartChat: () => void;
}

const WelcomeNotification: React.FC<WelcomeNotificationProps> = ({ onStartChat }) => {
  const [open, setOpen] = useState(false);
  const [hasSeenNotification, setHasSeenNotification] = useState(false);

  useEffect(() => {
    // Check if user has seen the notification before
    const hasSeen = localStorage.getItem('hasSeenWelcomeNotification');
    if (!hasSeen) {
      // Show notification after 2 seconds
      const timer = setTimeout(() => {
        setOpen(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    setHasSeenNotification(true);
    localStorage.setItem('hasSeenWelcomeNotification', 'true');
  };

  const handleStartChat = () => {
    onStartChat();
    handleClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={8000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbar-root': {
          bottom: 100,
        },
      }}
    >
      <Fade in={open} timeout={500}>
        <Alert
          severity="info"
          icon={<SupportAgent />}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                color="inherit"
                size="small"
                onClick={handleStartChat}
                startIcon={<AutoAwesome />}
                sx={{
                  backgroundColor: alpha('#3B82F6', 0.1),
                  color: '#1E3A8A',
                  '&:hover': {
                    backgroundColor: alpha('#3B82F6', 0.2),
                  },
                }}
              >
                Try AI
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={handleClose}
                sx={{ minWidth: 'auto' }}
              >
                <Close />
              </Button>
            </Box>
          }
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            '& .MuiAlert-message': {
              color: '#1E293B',
            },
            '& .MuiAlert-icon': {
              color: '#3B82F6',
            },
          }}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              👋 Welcome! Meet Summer.AI
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Your AI immigration assistant is ready to help. Ask questions about priority dates, processes, and more!
            </Typography>
          </Box>
        </Alert>
      </Fade>
    </Snackbar>
  );
};

export default WelcomeNotification; 