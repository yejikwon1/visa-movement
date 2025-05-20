from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import requests

# 환경변수 불러오기 (.env)
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_URL = "https://api.openai.com/v1/chat/completions"

app = FastAPI()

# ⭐️ CORS 설정: 모든 origin 허용 (개발 중에는 이렇게!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # <- 여기에서 모든 origin 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat(request: Request):
    body = await request.json()
    messages = body.get("messages", [])

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "gpt-4",
        "messages": messages
    }

    response = requests.post(OPENAI_URL, headers=headers, json=payload)
    return response.json()
