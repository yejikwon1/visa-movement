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
        model: 'gpt-4o',
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
  console.log('🔍 Visa Data Classification Request (OpenAI):');
  console.log('📝 Question:', message);
  
  try {
    let contextString = "";
    if (recentHistory && recentHistory.length > 0) {
      // Get the last few messages for context
      const lastFewMessages = recentHistory.slice(-4); // Last 4 messages for context
      contextString = "\n\nRecent conversation context:\n" + 
        lastFewMessages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      console.log('🔄 Using conversation context for classification');
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
        model: 'gpt-4o',
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
    const finalResult = reply === 'yes' ? 'yes' : 'no';
    
    console.log('🤖 OpenAI Classification Response:', reply);
    
    // Log the final decision with clear formatting
    if (finalResult === 'yes') {
      console.log('✅ VISA BULLETIN REQUIRED: YES');
      console.log('📅 OpenAI determined visa bulletin data is needed');
    } else {
      console.log('❌ VISA BULLETIN REQUIRED: NO');
      console.log('💬 OpenAI determined this is a general immigration question');
    }
    
    console.log('==========================================');
    return finalResult;
  } catch (error) {
    console.error('❌ Classification Error:', error);
    console.log('❌ VISA BULLETIN REQUIRED: NO (due to OpenAI classification error)');
    console.log('==========================================');
    return 'no'; // Default to no visa data needed if classification fails
  }
} 