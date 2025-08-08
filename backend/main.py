"""
main.py - The API Server
"""
import os
import time
import uvicorn
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from logic.analyze_text import analyze_text
from logic.analyze_voice import analyze_voice
from logic.send_alert import send_alert

app = FastAPI(title="SafeLens API")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

UPLOADS_DIR = "uploads"
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount(f"/{UPLOADS_DIR}", StaticFiles(directory=UPLOADS_DIR), name="uploads")
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")


@app.get("/status")
def get_status(): return {"status": "SafeLens API is running"}

@app.post("/analyze-text")
async def handle_text_analysis(text: str = Form(...)):
    return {"analysis": analyze_text(text)}

@app.post("/analyze-voice")
async def handle_voice_analysis(audio_file: UploadFile = File(...)):
    file_path = os.path.join(UPLOADS_DIR, audio_file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await audio_file.read())
    return {"analysis": analyze_voice(audio_file.filename)}


@app.post("/upload-emergency-audio")
async def handle_emergency_audio_upload(audio_file: UploadFile = File(...)):
    unique_filename = f"emergency_audio_{int(time.time())}.wav"
    file_path = os.path.join(UPLOADS_DIR, unique_filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await audio_file.read())
    print(f"Successfully saved emergency recording to the 'vault': {unique_filename}")
    return {"status": "success", "filename": unique_filename}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)