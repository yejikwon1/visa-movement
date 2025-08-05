import React, { useState, useEffect } from 'react';
import {
  Fab,
  Badge,
  Tooltip,
  Box,
  Typography,
  Fade,
  Slide,
  alpha,
} from '@mui/material';
import { 
  SupportAgent, 
  Close, 
  AutoAwesome,
  ChatBubbleOutline 
} from '@mui/icons-material';

interface FloatingChatButtonProps {
  onChatClick: () => void;
  isChatOpen: boolean;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ 
  onChatClick, 
  isChatOpen 
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Show tooltip after 3 seconds for first-time visitors
    const timer = setTimeout(() => {
      if (!hasInteracted && !isChatOpen) {
        setShowTooltip(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasInteracted, isChatOpen]);

  const handleClick = () => {
    setHasInteracted(true);
    setShowTooltip(false);
    onChatClick();
  };

  const handleMouseEnter = () => {
    if (!hasInteracted) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}
    >
      {/* Animated notification dot */}
      {!hasInteracted && !isChatOpen && (
        <Fade in timeout={1000}>
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              width: 16,
              height: 16,
              backgroundColor: '#EF4444',
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
                '50%': {
                  transform: 'scale(1.2)',
                  opacity: 0.7,
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
              },
            }}
          />
        </Fade>
      )}

      {/* Tooltip */}
      <Fade in={showTooltip} timeout={300}>
        <Box
          sx={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            mb: 2,
            width: 280,
            background: 'rgba(30, 58, 138, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            p: 2,
            color: 'white',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AutoAwesome sx={{ fontSize: 20, mr: 1, color: '#FCD34D' }} />
            <Typography variant="subtitle2" fontWeight={600}>
              AI Assistant Available
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
            Get instant answers to all your immigration questions!
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Box
              sx={{
                px: 1,
                py: 0.5,
                backgroundColor: alpha('#ffffff', 0.1),
                borderRadius: 1,
                fontSize: '0.75rem',
              }}
            >
              Priority Dates
            </Box>
            <Box
              sx={{
                px: 1,
                py: 0.5,
                backgroundColor: alpha('#ffffff', 0.1),
                borderRadius: 1,
                fontSize: '0.75rem',
              }}
            >
              Process Help
            </Box>
            <Box
              sx={{
                px: 1,
                py: 0.5,
                backgroundColor: alpha('#ffffff', 0.1),
                borderRadius: 1,
                fontSize: '0.75rem',
              }}
            >
              Timeline Estimates
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* Main floating button */}
      <Slide direction="up" in timeout={500}>
        <Tooltip 
          title={isChatOpen ? "Close Chat" : "Ask AI Assistant"}
          placement="left"
          arrow
        >
          <Fab
            color="primary"
            size="large"
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{
              backgroundColor: isChatOpen ? '#EF4444' : '#1E3A8A',
              color: 'white',
              width: 64,
              height: 64,
              boxShadow: '0 8px 25px rgba(30, 58, 138, 0.3)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: isChatOpen ? '#DC2626' : '#1E40AF',
                transform: 'scale(1.1)',
                boxShadow: '0 12px 35px rgba(30, 58, 138, 0.4)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
            }}
          >
            {isChatOpen ? <Close /> : <SupportAgent />}
          </Fab>
        </Tooltip>
      </Slide>

      {/* Secondary floating button for mobile */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          bottom: 100,
          right: 24,
          zIndex: 999,
        }}
      >
        <Slide direction="up" in timeout={700}>
          <Fab
            size="medium"
            onClick={handleClick}
            sx={{
              backgroundColor: alpha('#1E3A8A', 0.9),
              color: 'white',
              width: 48,
              height: 48,
              boxShadow: '0 4px 15px rgba(30, 58, 138, 0.2)',
              '&:hover': {
                backgroundColor: '#1E40AF',
                transform: 'scale(1.05)',
              },
            }}
          >
            <ChatBubbleOutline />
          </Fab>
        </Slide>
      </Box>
    </Box>
  );
};

export default FloatingChatButton; 