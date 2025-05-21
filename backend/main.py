from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import requests

# ✅ include route import
from should_include import app as include_app

# 환경변수 불러오기 (.env)
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_URL = "https://api.openai.com/v1/chat/completions"

# FastAPI 앱 정의
app = FastAPI()

# ⭐️ CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ /chat 엔드포인트
@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    messages = body.get("messages", [])

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "gpt-3.5-turbo",
        "messages": messages
    }

    response = requests.post(OPENAI_URL, headers=headers, json=payload)
    result = response.json()

    # ✅ usage 로그
    usage = result.get("usage", {})
    prompt_tokens = usage.get("prompt_tokens", 0)
    completion_tokens = usage.get("completion_tokens", 0)
    total_tokens = usage.get("total_tokens", 0)
    cost = (prompt_tokens / 1000 * 0.0015) + (completion_tokens / 1000 * 0.002)  # gpt-3.5-turbo 기준
    print(f"📊 [OpenAI Usage] Prompt: {prompt_tokens}, Completion: {completion_tokens}, Total: {total_tokens}, 💵 Estimated Cost: ${cost:.6f}")

    return result

# ✅ /shouldIncludeVisaData 경로 mount (별도 앱 통합)
app.mount("/shouldIncludeVisaData", include_app)
