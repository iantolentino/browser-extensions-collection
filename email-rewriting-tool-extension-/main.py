from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import google.generativeai as genai

# ✅ Initialize FastAPI
app = FastAPI()

# ✅ CORS (allow Chrome extension frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise Exception("❌ Missing Gemini API key. Set GEMINI_API_KEY as an environment variable.")

genai.configure(api_key=API_KEY)

# ✅ Data model
class RewriteRequest(BaseModel):
    text: str
    tone: str

@app.get("/")
def root():
    return {"message": "✅ Backend running"}

@app.post("/rewrite/")
def rewrite_text(req: RewriteRequest):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"Rewrite this email in a {req.tone} tone:\n\n{req.text}"
        response = model.generate_content(prompt)
        return {"rewritten": response.text}
    except Exception as e:
        return {"error": str(e)}
