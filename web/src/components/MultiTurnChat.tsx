import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

import { fetchVisaJson } from '../services/fetchVisaJson';
import { generateSystemPrompt } from '../services/generateSystemPrompt';
import { fetchChatViaBackend } from '../services/openaiService';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

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

    const updatedHistory = [...chatHistory, { role: 'user' as const, content: input }];
    setChatHistory(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      const visaData = await fetchVisaJson();
      const systemPrompt = generateSystemPrompt(visaData);

      const messagesToSend = [
        { role: 'system', content: systemPrompt },
        ...updatedHistory,
      ];

      const responseContent = await fetchChatViaBackend(messagesToSend);

      const newMessage: ChatMessage = {
        role: 'assistant',
        content: responseContent,
      };

      setChatHistory([...updatedHistory, newMessage]);
    } catch (err) {
      console.error('❌ GPT error:', err);
      setChatHistory([
        ...updatedHistory,
        { role: 'assistant', content: '❌ Failed to get a response.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper
        elevation={6}
        sx={{
          height: '65vh',
          overflowY: 'auto',
          p: 3,
          mb: 3,
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#ffffff',
          borderRadius: 4,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
        }}
      >
        {chatHistory.map((msg, idx) => (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Box
              sx={{
                maxWidth: '75%',
                p: 2,
                borderRadius: 3,
                bgcolor: msg.role === 'user' ? '#e3f2fd' : '#f1f8e9',
                color: '#333',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                border: '1px solid #ddd',
              }}
            >
              <Typography variant="caption" fontWeight="bold" color="textSecondary">
                {msg.role === 'user' ? '👤 You' : '🤖 VisaBot'}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>
                {msg.content}
              </Typography>
            </Box>
          </Box>
        ))}

        {loading && (
          <Box sx={{ alignSelf: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <div ref={bottomRef} />
      </Paper>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          gap: 2,
          backgroundColor: '#fafafa',
          p: 2,
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask about your visa category, priority date..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          size="small"
          sx={{ borderRadius: 2 }}
        />
        <Button
          variant="contained"
          type="submit"
          disabled={loading || !input.trim()}
          sx={{ textTransform: 'none', fontWeight: 'bold', px: 3, py: 1 }}
        >
          Send
        </Button>
      </Box>
    </Container>
  );
};

export default MultiTurnChat;
