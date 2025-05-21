import os
import openai
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://visa-movement.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageInput(BaseModel):
    message: str

@app.post("/shouldIncludeVisaData")
async def should_include_data(payload: MessageInput):
    prompt_messages = [
        {
            "role": "system",
            "content": (
                "You are a classifier. Respond ONLY with 'Yes' or 'No'. "
                "Does this message require current visa bulletin data?\n\n"
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
            messages=prompt_messages,
            temperature=0,
            max_tokens=5
        )
        reply = response.choices[0].message["content"].strip().lower()
        return { "includeVisaData": reply }
    except Exception as e:
        return { "error": str(e) }
