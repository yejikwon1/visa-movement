

export async function fetchChatCompletion(userInput: string) {

    console.log('✅ OPENAI API KEY:', process.env.REACT_APP_OPENAI_API_KEY);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful and knowledgeable U.S. immigration lawyer' },
          { role: 'user', content: userInput },
        ],
      }),
    });
  
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response';
  }
  