import os
import openai
import requests
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY
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

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "gpt-3.5-turbo",  # 비용 효율적인 모델 사용
        "messages": messages
    }

    response = requests.post(OPENAI_URL, headers=headers, json=payload)
    result = response.json()

    # ✅ 비용 로깅
    usage = result.get("usage", {})
    prompt_tokens = usage.get("prompt_tokens", 0)
    completion_tokens = usage.get("completion_tokens", 0)
    total_tokens = usage.get("total_tokens", 0)
    cost = (prompt_tokens / 1000 * 0.0015) + (completion_tokens / 1000 * 0.002)
    print(f"📊 [OpenAI Usage] Prompt: {prompt_tokens}, Completion: {completion_tokens}, Total: {total_tokens}, 💵 Estimated Cost: ${cost:.6f}")

    return result

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

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0,
            max_tokens=5
        )
        reply = response.choices[0].message["content"].strip().lower()
        return { "includeVisaData": reply }

    except Exception as e:
        return { "error": str(e) }