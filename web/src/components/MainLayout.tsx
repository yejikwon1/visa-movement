import React from 'react';
import { Box, Container, Paper, Fade, Slide } from '@mui/material';
import PriorityDateChecker from './PriorityDateChecker';

const MainLayout: React.FC = () => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
        minHeight: 'calc(100vh - 70px)',
        py: { xs: 2, md: 4 },
      }}
    >
      <Container maxWidth="xl" sx={{ height: '100%' }}>
        <Fade in timeout={800}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              minHeight: 'inherit',
            }}
          >
            <Slide direction="up" in mountOnEnter timeout={600}>
              <Paper
                elevation={0}
                sx={{
                  width: '80%',
                  maxWidth: '1000px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #1E3A8A, #3B82F6, #7C3AED)',
                  },
                }}
              >
                <Box sx={{ p: { xs: 3, md: 4 } }}>
                  <PriorityDateChecker />
                </Box>
              </Paper>
            </Slide>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default MainLayout; 