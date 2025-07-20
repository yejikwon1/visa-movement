import React, { useState, useRef, useEffect, ReactNode } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Collapse,
  Tooltip,
} from '@mui/material';
import {
  Close,
  Minimize,
  MaximizeRounded,
  DragIndicator,
  ChatBubble,
} from '@mui/icons-material';

interface PiPContainerProps {
  children: ReactNode;
  title: string;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  defaultSize?: { width: number; height: number };
}

const PiPContainer: React.FC<PiPContainerProps> = ({
  children,
  title,
  onClose,
  initialPosition = { x: window.innerWidth - 420, y: 100 },
  minSize = { width: 320, height: 200 },
  maxSize = { width: 600, height: 800 },
  defaultSize = { width: 400, height: 600 },
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Handle resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.y));
        setPosition({ x: newX, y: newY });
      }
      
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(minSize.width, Math.min(maxSize.width, resizeStart.width + deltaX));
        const newHeight = Math.max(minSize.height, Math.min(maxSize.height, resizeStart.height + deltaY));
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDragging ? 'grabbing' : 'nw-resize';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, size, minSize, maxSize]);

  return (
    <Paper
      ref={containerRef}
      elevation={8}
      sx={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: size.width,
        height: isMinimized ? 'auto' : size.height,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.24)',
        border: '1px solid rgba(46, 59, 85, 0.1)',
        background: 'white',
      }}
    >
      {/* Title Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1,
          bgcolor: '#2E3B55',
          color: 'white',
          cursor: 'grab',
          userSelect: 'none',
          '&:active': {
            cursor: 'grabbing',
          },
        }}
        onMouseDown={handleMouseDown}
      >
        <DragIndicator sx={{ mr: 1, fontSize: 18 }} />
        <ChatBubble sx={{ mr: 1, fontSize: 18 }} />
        <Typography variant="subtitle2" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          {title}
        </Typography>
        
        <Tooltip title="Minimize">
          <IconButton
            size="small"
            onClick={() => setIsMinimized(!isMinimized)}
            sx={{ color: 'white', p: 0.5 }}
          >
            {isMinimized ? <MaximizeRounded /> : <Minimize />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Close PiP">
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: 'white', p: 0.5, ml: 0.5 }}
          >
            <Close />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Content */}
      <Collapse in={!isMinimized}>
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: size.height - 48, // Subtract title bar height
          }}
        >
          {children}
        </Box>
      </Collapse>

      {/* Resize Handle */}
      {!isMinimized && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 16,
            height: 16,
            cursor: 'nw-resize',
            bgcolor: 'rgba(46, 59, 85, 0.1)',
            borderTopLeftRadius: 1,
            '&:hover': {
              bgcolor: 'rgba(46, 59, 85, 0.2)',
            },
          }}
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </Paper>
  );
};

export default PiPContainer; 