import React, { useState } from 'react';
import { fetchChatCompletion } from '../services/openaiService';

const SingleTurnChat = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const reply = await fetchChatCompletion(input);
    setResponse(reply);
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          style={{ width: '300px', marginRight: '1rem' }}
        />
        <button type="submit">Send</button>
      </form>
      <div style={{ marginTop: '1rem' }}>
        {loading ? 'Loading...' : response}
      </div>
    </div>
  );
};

export default SingleTurnChat;
