from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from db.database import init_db, get_db
from db import queries
from models.schemas import MeetingCreate, ProcessResponse, ActionItem
from agents.extractor import run_extractor
from agents.email_drafter import run_email_drafter
from agents.summarizer import run_summarizer
import json

app = FastAPI(title="Meeting Summarizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/meetings/process")
def process_meeting(meeting: MeetingCreate, db: Session = Depends(get_db)):
    if len(meeting.transcript.strip()) < 50:
        raise HTTPException(status_code=400, detail="Transcript too short. Please provide at least 50 characters.")

    result = run_extractor(meeting.transcript)
    action_items_data = result.get("action_items", [])
    title = result.get("title", "Untitled Meeting")

    summary = run_summarizer(meeting.transcript)

    db_meeting = queries.create_meeting(db, title=title, transcript=meeting.transcript)
    db_items = queries.create_action_items(db, meeting_id=db_meeting.id, items=action_items_data)

    email_draft = run_email_drafter(action_items_data)

    return {
        "meeting": {
            "id": db_meeting.id,
            "title": db_meeting.title,
            "created_at": db_meeting.created_at.isoformat(),
        },
        "summary": summary,
        "action_items": [
            {
                "id": item.id,
                "text": item.text,
                "assignee": item.assignee,
                "status": item.status,
            }
            for item in db_items
        ],
        "email_draft": email_draft
    }

@app.get("/meetings")
def get_meetings(db: Session = Depends(get_db)):
    meetings = queries.get_all_meetings(db)
    return [
        {
            "id": m.id,
            "title": m.title,
            "created_at": m.created_at.isoformat(),
            "action_items": queries.get_action_items_by_meeting(db, m.id)
        }
        for m in meetings
    ]

@app.patch("/action-items/{item_id}")
def update_action_item(item_id: int, text: str = None, status: str = None, db: Session = Depends(get_db)):
    item = queries.update_action_item(db, item_id=item_id, text=text, status=status)
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")
    return {
        "id": item.id,
        "text": item.text,
        "assignee": item.assignee,
        "status": item.status
    }