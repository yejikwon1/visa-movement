import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { fetchVisaJson } from '../services/fetchVisaJson';
import { generateSystemPrompt } from '../services/generateSystemPrompt';
import { fetchChatViaBackend } from '../services/fetchChatViaBackend';
import { checkIfVisaDataNeeded } from '../services/checkIfVisaDataNeeded';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ApiMessage = {
  role: 'user' | 'assistant' | 'system';
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

    const updatedHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', content: input },
    ];
    setChatHistory(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      // STEP 1: Classify whether visa bulletin data is needed
      const includeVisaData = await checkIfVisaDataNeeded(input);

      // STEP 2: Choose appropriate prompt
      let systemPrompt = '';
      if (includeVisaData === 'yes') {
        const visaData = await fetchVisaJson();
        systemPrompt = generateSystemPrompt(visaData); // Full prompt with data
      } else {
        systemPrompt = `You are a helpful immigration assistant. Answer concisely without referring to visa bulletin cutoff dates.`; // Lightweight
      }

      const messagesToSend: ApiMessage[] = [
        { role: 'system', content: systemPrompt },
        ...updatedHistory,
      ];

      const responseText = await fetchChatViaBackend(messagesToSend);

      setChatHistory([
        ...updatedHistory,
        { role: 'assistant', content: responseText },
      ]);
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
        elevation={3}
        sx={{
          height: '60vh',
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          bgcolor: '#f5f5f5',
          borderRadius: 2,
        }}
      >
        {chatHistory.map((msg, idx) => (
          <Box
            key={idx}
            sx={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              bgcolor: msg.role === 'user' ? '#d1ecf1' : '#d4edda',
              px: 2,
              py: 1,
              borderRadius: 2,
              maxWidth: '75%',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              {msg.role === 'user' ? '🧑 You' : '🤖 Bot'}
            </Typography>
            <Typography variant="body1">{msg.content}</Typography>
          </Box>
        ))}

        {loading && (
          <Box sx={{ alignSelf: 'center', mt: 1 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        <div ref={bottomRef} />
      </Paper>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: 'flex', mt: 2, gap: 2 }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask about your visa status..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          size="small"
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!input.trim() || loading}
        >
          Send
        </Button>
      </Box>
    </Container>
  );
};

export default MultiTurnChat;
