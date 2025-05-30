import React from 'react';
import { Box } from '@mui/material';
import PriorityDateChecker from './PriorityDateChecker';
import MultiTurnChat from './MultiTurnChat';

const MainLayout: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        px: 2,
        mt: 2,
        height: 'calc(100vh - 120px)', // Reduced overall container height
        overflow: 'hidden'
      }}
    >
      {/* Priority Checker Section - Takes 60% of the width */}
      <Box sx={{ 
        flex: '0 0 60%', 
        overflow: 'auto', 
        minWidth: '800px',
        height: 'calc(100vh - 140px)' // Slightly shorter than container
      }}>
        <PriorityDateChecker />
      </Box>

      {/* Chatbot Section - Takes 40% of the width */}
      <Box 
        sx={{ 
          flex: '0 0 40%',
          position: 'sticky',
          top: 0,
          height: 'calc(100vh - 140px)', // Match Priority Checker height
          overflow: 'auto',
          minWidth: '500px'
        }}
      >
        <MultiTurnChat />
      </Box>
    </Box>
  );
};

export default MainLayout; 