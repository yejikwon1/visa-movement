import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Fade,
  Avatar,
} from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import { optimizedChatCall } from '../services/optimizedChatService';

// Custom theme colors
const themeColors = {
  primary: '#2E3B55',
  primaryDark: '#1A2438',
  secondary: '#F5F7FA',
  userMessage: '#465B82',
  assistantMessage: '#2E3B55',
  userMessageBg: '#F5F7FA',
  assistantMessageBg: '#FFFFFF',
  backgroundMain: '#F5F7FA',
  accent: '#C3973D',
  accentLight: '#D4B36A',
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const WelcomeMessage = () => (
  <Fade in timeout={1000}>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        p: 2,
        textAlign: 'center'
      }}
    >
      <Avatar
        sx={{
          width: 50,
          height: 50,
          bgcolor: themeColors.primary,
          mb: 1,
          boxShadow: '0 4px 12px rgba(46, 59, 85, 0.15)'
        }}
      >
        <SupportAgentIcon sx={{ fontSize: 30, color: 'white' }} />
      </Avatar>
      <Typography variant="h6" fontWeight="bold" sx={{ color: themeColors.primary }}>
        Summer.AI
      </Typography>
      <Typography variant="body2" sx={{ color: themeColors.userMessage, fontSize: '0.85rem' }}>
        Ask me anything about visa and immigration processes.
      </Typography>
    </Box>
  </Fade>
);

const MultiTurnChatPiP = () => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const updatedHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', content: input },
    ];
    setChatHistory(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      console.log('💬 사용자 입력:', input);
      
      // Single optimized API call
      const result = await optimizedChatCall(updatedHistory);
      
      console.log(`⚡ 처리 완료: ${result.metadata.processingTime}ms, Visa데이터 사용: ${result.metadata.usedVisaData}`);

      setChatHistory([
        ...updatedHistory,
        { role: 'assistant', content: result.response },
      ]);
    } catch (err) {
      console.error('❌ Chat error:', err);
      setChatHistory([
        ...updatedHistory,
        { role: 'assistant', content: '❌ Failed to get a response.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: themeColors.backgroundMain,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          bgcolor: 'transparent',
        }}
      >
        {chatHistory.length === 0 ? (
          <WelcomeMessage />
        ) : (
          chatHistory.map((msg, idx) => (
            <Box
              key={idx}
              sx={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                bgcolor: msg.role === 'user' ? themeColors.userMessageBg : themeColors.assistantMessageBg,
                px: 1.5,
                py: 1,
                borderRadius: 2,
                maxWidth: '90%',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                boxShadow: '0 2px 4px rgba(46, 59, 85, 0.08)',
                display: 'flex',
                gap: 1,
                alignItems: 'flex-start',
                border: msg.role === 'assistant' ? '1px solid rgba(46, 59, 85, 0.1)' : 'none',
              }}
            >
              <Avatar 
                sx={{ 
                  width: 24, 
                  height: 24,
                  bgcolor: msg.role === 'user' ? themeColors.userMessage : themeColors.assistantMessage,
                  flexShrink: 0,
                }}
              >
                {msg.role === 'user' ? (
                  <PersonIcon sx={{ fontSize: 14 }} />
                ) : (
                  <SupportAgentIcon sx={{ fontSize: 14 }} />
                )}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" fontWeight="bold" sx={{ color: msg.role === 'user' ? themeColors.userMessage : themeColors.assistantMessage }}>
                  {msg.role === 'user' ? 'You' : 'Assistant'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: themeColors.userMessage, fontSize: '0.85rem' }}>
                  {msg.content}
                </Typography>
              </Box>
            </Box>
          ))
        )}

        {loading && (
          <Box sx={{ alignSelf: 'center', mt: 1 }}>
            <CircularProgress size={20} sx={{ color: themeColors.primary }} />
          </Box>
        )}

        <div ref={bottomRef} />
      </Paper>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 1,
          borderTop: 1,
          borderColor: 'rgba(46, 59, 85, 0.1)',
          bgcolor: 'white',
          display: 'flex',
          gap: 1,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '0.85rem',
              '&.Mui-focused fieldset': {
                borderColor: themeColors.primary,
              },
              '& fieldset': {
                borderColor: 'rgba(46, 59, 85, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(46, 59, 85, 0.3)',
              },
            },
            '& .MuiInputBase-input': {
              color: themeColors.userMessage,
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!input.trim() || loading}
          size="small"
          sx={{ 
            minWidth: 'auto', 
            px: 1.5,
            bgcolor: themeColors.primary,
            '&:hover': {
              bgcolor: themeColors.primaryDark,
            },
            '&:disabled': {
              bgcolor: 'rgba(46, 59, 85, 0.12)',
            }
          }}
        >
          <SendIcon sx={{ fontSize: 18 }} />
        </Button>
      </Box>
    </Box>
  );
};

export default MultiTurnChatPiP; 