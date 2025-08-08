import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# --- 1. Initialize the FastAPI Application ---
app = FastAPI(title="SafeLens API")

# --- 2. Configure CORS Middleware ---
# This is important for allowing the web browser (frontend) to be served correctly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET"], # We only need GET since the app is fully client-side
    allow_headers=["*"],
)

# --- 3. Mount the Frontend Directory ---
# This is the core function of our server. It tells FastAPI:
# "When someone visits the main URL ('/'), serve them the files from the
# '../frontend' directory, and make sure to serve 'index.html' by default."
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")


# --- 4. Main Entry Point ---
# This block allows the server to be run directly with `python main.py`.
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)