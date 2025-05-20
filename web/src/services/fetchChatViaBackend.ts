const BACKEND_URL = "https://visa-movement-backend.onrender.com"; // 배포 시 Render URL로 바꿔야 함

export async function fetchChatViaBackend(messages: { role: "user" | "assistant" | "system"; content: string }[]) {
  const response = await fetch(`${BACKEND_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "❌ No response";
}
