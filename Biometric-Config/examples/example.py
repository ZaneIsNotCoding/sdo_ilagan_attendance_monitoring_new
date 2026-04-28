from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pyzkfp import ZKFP2
import mysql.connector
import logging
import sys

from .register import register_fingerprint
from .login import login_with_fingerprint
from .test import test_fingerprint
from .fingerprint_choice import fingerprint_choice

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FingerprintService")

app = FastAPI()

origins = ["http://127.0.0.1:8000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RegisterRequest(BaseModel):
    employee_id: int

# ----- INIT SERVICE -----
class FingerprintService:
    def __init__(self):
        self.zkfp2 = ZKFP2()
        self.zkfp2.Init()

        if self.zkfp2.GetDeviceCount() == 0:
            raise RuntimeError("No fingerprint devices found")
        if not self.zkfp2.OpenDevice(0):
            raise RuntimeError("Failed to open fingerprint device")

        self.conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="sdo_ilagan_attendance_new"
        )
            
        self.cursor = self.conn.cursor()

    def get_next_finger_id(self):
        self.cursor.execute("SELECT MAX(id) FROM biometrics")
        max_id = self.cursor.fetchone()[0]
        return (max_id + 1) if max_id else 1

    def close(self):
        try:
            self.zkfp2.Terminate()
        except Exception:
            pass
        self.cursor.close()
        self.conn.close()

# Initialize service
service = FingerprintService()

# ----- ENDPOINTS -----
@app.get("/bioRegisterSSE/{emp_id}")
async def bio_register_sse(emp_id: int, request: Request):
    """SSE endpoint for fingerprint registration"""
    async def event_stream():
        async for event in register_fingerprint(emp_id, service):
            yield event

    return StreamingResponse(event_stream(), media_type="text/event-stream")


    
@app.get("/bioLogin")
async def bio_login():
    """SSE endpoint for fingerprint login"""
    async def event_stream():
        async for msg in login_with_fingerprint(service):
            yield msg
            # No need for sys.stdout.flush() here; StreamingResponse handles it

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/bioTestSSE")
async def bio_test_sse():
    """SSE endpoint to test a fingerprint and return employee details."""
    async def event_stream():
        async for msg in test_fingerprint(service):
            yield msg
    return StreamingResponse(event_stream(), media_type="text/event-stream")

@app.get("/bioFingerprintChoice/{employee_id}/{choice}")
async def bio_fingerprint_choice_sse(employee_id: int, choice: str):
    """SSE endpoint for recording AM Time-Out or PM Time-In choice"""
    async def event_stream():
        async for msg in fingerprint_choice(service, employee_id, choice):
            yield msg
    return StreamingResponse(event_stream(), media_type="text/event-stream")
