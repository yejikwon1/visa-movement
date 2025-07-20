import os
import requests
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_URL = "https://api.openai.com/v1/chat/completions"

app = FastAPI()

# ✅ CORS 허용 도메인
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://visa-movement.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ /chat endpoint: 메인 챗봇 응답
@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    messages = body.get("messages", [])

    if not OPENAI_API_KEY:
        return {
            "choices": [
                {
                    "message": {
                        "content": "❌ OpenAI API key not configured. Please set OPENAI_API_KEY in your environment.",
                        "role": "assistant"
                    }
                }
            ],
            "error": "API key not configured"
        }

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "gpt-3.5-turbo",
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1000
    }

    try:
        response = requests.post(OPENAI_URL, headers=headers, json=payload, timeout=30)
        
        if response.status_code != 200:
            error_msg = f"OpenAI API error: {response.status_code}"
            if response.text:
                error_msg += f" - {response.text}"
            print(f"❌ {error_msg}")
            return {
                "choices": [
                    {
                        "message": {
                            "content": "Sorry, I'm having trouble connecting to the AI service. Please try again later.",
                            "role": "assistant"
                        }
                    }
                ],
                "error": error_msg
            }
        
        result = response.json()
        
        # ✅ 비용 로깅
        usage = result.get("usage", {})
        prompt_tokens = usage.get("prompt_tokens", 0)
        completion_tokens = usage.get("completion_tokens", 0)
        total_tokens = usage.get("total_tokens", 0)
        cost = (prompt_tokens / 1000 * 0.0015) + (completion_tokens / 1000 * 0.002)
        print(f"📊 [OpenAI Usage] Prompt: {prompt_tokens}, Completion: {completion_tokens}, Total: {total_tokens}, 💵 Estimated Cost: ${cost:.6f}")

        return result

    except requests.exceptions.Timeout:
        return {
            "choices": [
                {
                    "message": {
                        "content": "❌ Request timed out. Please try again.",
                        "role": "assistant"
                    }
                }
            ],
            "error": "Request timeout"
        }
    except Exception as e:
        print(f"❌ OpenAI API Error: {e}")
        return {
            "choices": [
                {
                    "message": {
                        "content": "Sorry, I'm having trouble connecting to the AI service. Please try again later.",
                        "role": "assistant"
                    }
                }
            ],
            "error": str(e)
        }

# ✅ 타입 정의 for 분류기
class MessageInput(BaseModel):
    message: str

# ✅ /shouldIncludeVisaData (슬래시 유무 모두 대응)
@app.post("/shouldIncludeVisaData")
@app.post("/shouldIncludeVisaData/")
async def should_include_data(payload: MessageInput):
    messages = [
        {
            "role": "system",
            "content": (
                "You are a classifier. Respond ONLY with 'Yes' or 'No'. "
                "Does this message require visa bulletin data?\n\n"
                "Examples:\n"
                "- 'Is my EB3 current?' → Yes\n"
                "- 'What does F2A mean?' → No"
            )
        },
        {
            "role": "user",
            "content": payload.message
        }
    ]

    if not OPENAI_API_KEY:
        return {"error": "API key not configured", "includeVisaData": "no"}

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    payload_data = {
        "model": "gpt-3.5-turbo",
        "messages": messages,
        "temperature": 0,
        "max_tokens": 5
    }

    try:
        response = requests.post(OPENAI_URL, headers=headers, json=payload_data, timeout=10)
        
        if response.status_code != 200:
            print(f"❌ Classification Error: {response.status_code} - {response.text}")
            return {"error": f"API error: {response.status_code}", "includeVisaData": "no"}
        
        result = response.json()
        reply = result.get("choices", [{}])[0].get("message", {}).get("content", "no").strip().lower()
        return {"includeVisaData": reply}

    except Exception as e:
        print(f"❌ Classification Error: {e}")
        return {"error": str(e), "includeVisaData": "no"}

# ✅ Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "visa-movement-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)