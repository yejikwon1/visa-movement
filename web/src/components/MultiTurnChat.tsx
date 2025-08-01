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
import { fetchVisaJson } from '../services/fetchVisaJson';
import { generateSystemPrompt } from '../services/generateSystemPrompt';
import { callOpenAI, classifyMessage } from '../services/directOpenAI';

// Custom theme colors
const themeColors = {
  primary: '#2E3B55', // Rich navy blue
  primaryDark: '#1A2438',
  secondary: '#F5F7FA', // Light background
  userMessage: '#465B82', // Light navy blue
  assistantMessage: '#2E3B55', // Navy blue
  userMessageBg: '#F5F7FA', // Light background
  assistantMessageBg: '#FFFFFF', // White
  backgroundMain: '#F5F7FA', // Light background
  accent: '#C3973D', // Elegant gold
  accentLight: '#D4B36A', // Light gold
};

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ApiMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const WelcomeMessage = () => (
  <Fade in timeout={1000}>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        p: 3,
        textAlign: 'center'
      }}
    >
      <Avatar
        sx={{
          width: 80,
          height: 80,
          bgcolor: themeColors.primary,
          mb: 2,
          boxShadow: '0 4px 12px rgba(46, 59, 85, 0.15)'
        }}
      >
        <SupportAgentIcon sx={{ fontSize: 45, color: 'white' }} />
      </Avatar>
      <Typography variant="h5" fontWeight="bold" sx={{ color: themeColors.primary }}>
        Hello! I'm Summer.AI
      </Typography>
      <Typography variant="body1" sx={{ color: themeColors.userMessage, maxWidth: '80%' }}>
        I can help you with visa-related questions and provide information about the immigration process.
        Feel free to ask me anything!
      </Typography>
    </Box>
  </Fade>
);

const MultiTurnChat = () => {
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

    // Check if OpenAI API key is configured
    if (!process.env.REACT_APP_OPENAI_API_KEY) {
      setChatHistory([
        ...chatHistory,
        { role: 'user', content: input },
        { role: 'assistant', content: '❌ OpenAI API key not configured. Please set REACT_APP_OPENAI_API_KEY in your environment variables.' }
      ]);
      setInput('');
      return;
    }

    const updatedHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', content: input },
    ];
    setChatHistory(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      const includeVisaData = await classifyMessage(input, chatHistory);
      let systemPrompt = '';
      
      if (includeVisaData === 'yes') {
        const visaData = await fetchVisaJson();
        systemPrompt = generateSystemPrompt(visaData);
      } else {
        systemPrompt = `You are Summer.AI, a helpful immigration assistant. Answer concisely without referring to visa bulletin cutoff dates.`;
      }

      const messagesToSend: ApiMessage[] = [
        { role: 'system', content: systemPrompt },
        ...updatedHistory,
      ];

      const responseText = await callOpenAI(messagesToSend);

      setChatHistory([
        ...updatedHistory,
        { role: 'assistant', content: responseText },
      ]);
    } catch (err) {
      console.error('❌ Chat error:', err);
      let errorMessage = '❌ Failed to get a response.';
      
      if (err instanceof Error) {
        if (err.message.includes('401') || err.message.includes('unauthorized')) {
          errorMessage = '❌ Invalid OpenAI API key. Please check your REACT_APP_OPENAI_API_KEY environment variable.';
        } else if (err.message.includes('429')) {
          errorMessage = '❌ Rate limit exceeded. Please try again later.';
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = '❌ Network error. Please check your internet connection and try again.';
        }
      }
      
      setChatHistory([
        ...updatedHistory,
        { role: 'assistant', content: errorMessage },
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
        borderRadius: 2,
        boxShadow: '0 0 20px rgba(0,0,0,0.05)'
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'rgba(46, 59, 85, 0.1)', 
          bgcolor: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Avatar sx={{ bgcolor: themeColors.primary, width: 32, height: 32 }}>
          <SupportAgentIcon sx={{ fontSize: 20 }} />
        </Avatar>
        <Typography variant="h6" fontWeight="bold" sx={{ color: themeColors.primary }}>
          Summer.AI
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
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
                px: 2,
                py: 1.5,
                borderRadius: 2,
                maxWidth: '85%',
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
                  width: 28, 
                  height: 28,
                  bgcolor: msg.role === 'user' ? themeColors.userMessage : themeColors.assistantMessage
                }}
              >
                {msg.role === 'user' ? (
                  <PersonIcon sx={{ fontSize: 18 }} />
                ) : (
                  <SupportAgentIcon sx={{ fontSize: 18 }} />
                )}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="bold" sx={{ color: msg.role === 'user' ? themeColors.userMessage : themeColors.assistantMessage }}>
                  {msg.role === 'user' ? 'You' : 'Assistant'}
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5, color: themeColors.userMessage }}>{msg.content}</Typography>
              </Box>
            </Box>
          ))
        )}

        {loading && (
          <Box sx={{ alignSelf: 'center', mt: 1 }}>
            <CircularProgress size={24} sx={{ color: themeColors.primary }} />
          </Box>
        )}

        <div ref={bottomRef} />
      </Paper>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'rgba(46, 59, 85, 0.1)',
          bgcolor: 'white',
          display: 'flex',
          gap: 1,
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask me anything about immigration..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
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
          sx={{ 
            minWidth: 'auto', 
            px: 2,
            bgcolor: themeColors.primary,
            '&:hover': {
              bgcolor: themeColors.primaryDark,
            },
            '&:disabled': {
              bgcolor: 'rgba(46, 59, 85, 0.12)',
            }
          }}
        >
          <SendIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default MultiTurnChat;
