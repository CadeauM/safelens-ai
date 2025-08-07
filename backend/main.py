"""
main.py - The API Server

This file defines the web server and its endpoints.
"""
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from logic.analyze_text import analyze_text
from logic.analyze_voice import analyze_voice
from logic.send_alert import send_alert
from logic.get_mock_location import get_mock_location

# App Setup 
app = FastAPI(title="SafeLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Endpoints
@app.get("/")
def get_status():
    return {"status": "SafeLens API is running"}

@app.post("/analyze-text")
async def handle_text_analysis(text: str = Form(...)):
    analysis_result = analyze_text(text)
    return {"analysis": analysis_result}

@app.post("/analyze-voice")
async def handle_voice_analysis(audio_file: UploadFile = File(...)):
    analysis_result = analyze_voice(audio_file.filename)
    return {"analysis": analysis_result}

@app.post("/send-alert")
async def handle_alert(contact_phone: str = Form(...), trigger_message: str = Form(...)):
    location_url = get_mock_location()
    
    full_message = f"URGENT SafeLens Alert: {trigger_message}. Location: {location_url}"
    
    alert_result = send_alert(contact_phone, full_message)
    return alert_result

# Run the server
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)