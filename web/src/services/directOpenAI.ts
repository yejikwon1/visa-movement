// Direct OpenAI API service
export async function callOpenAI(messages: { role: "user" | "assistant" | "system"; content: string }[]) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response received';
  } catch (error) {
    console.error('❌ OpenAI API Error:', error);
    throw error;
  }
}

export async function classifyMessage(message: string, recentHistory?: { role: "user" | "assistant"; content: string }[]): Promise<'yes' | 'no'> {
  try {
    let contextString = "";
    if (recentHistory && recentHistory.length > 0) {
      // Get the last few messages for context
      const lastFewMessages = recentHistory.slice(-4); // Last 4 messages for context
      contextString = "\n\nRecent conversation context:\n" + 
        lastFewMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    }

    const messages = [
      {
        role: "system" as const,
        content: (
          "You are a classifier. Respond ONLY with 'Yes' or 'No'. " +
          "Does this message require visa bulletin data?\n\n" +
          "Consider the conversation context - if this is a follow-up question " +
          "to a previous visa-related query, it likely needs visa data.\n\n" +
          "Examples:\n" +
          "- 'Is my EB3 current?' → Yes\n" +
          "- 'What does F2A mean?' → No\n" +
          "- 'for korean' (after visa question) → Yes\n" +
          "- 'what about china?' (after visa question) → Yes" +
          contextString
        )
      },
      {
        role: "user" as const,
        content: message
      }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0,
        max_tokens: 5,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.toLowerCase().trim();
    return reply === 'yes' ? 'yes' : 'no';
  } catch (error) {
    console.error('❌ Classification Error:', error);
    return 'no'; // Default to no visa data needed if classification fails
  }
} 