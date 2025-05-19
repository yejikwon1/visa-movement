const BACKEND_URL = "https://visa-movement-backend.onrender.com"; // Render 배포 주소

export async function fetchChatViaBackend(messages: { role: string; content: string }[]) {
  const response = await fetch(`${BACKEND_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '❌ No response';
}
