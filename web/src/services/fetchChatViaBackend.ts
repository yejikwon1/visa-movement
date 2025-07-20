// Use localhost for development, deployed URL for production
const BACKEND_URL = process.env.NODE_ENV === 'development' 
  ? "http://localhost:8000" 
  : "https://visa-movement-backend.onrender.com";

export async function fetchChatViaBackend(messages: { role: "user" | "assistant" | "system"; content: string }[]) {
  try {
    const response = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.choices?.[0]?.message?.content || "❌ No response received";
  } catch (error) {
    console.error("❌ Backend chat error:", error);
    
    // If backend fails, provide a helpful fallback message
    if (error instanceof Error && error.message.includes('fetch')) {
      return "❌ Unable to connect to the chat service. Please make sure the backend is running on localhost:8000 or try again later.";
    }
    
    return "❌ Failed to get a response. Please try again.";
  }
}
