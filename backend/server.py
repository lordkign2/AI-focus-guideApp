import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
import uuid

app = FastAPI(title="AI Personal Assistant Backend", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class Note(BaseModel):
    id: str
    content: str
    created_at: str
    ai_enhanced: bool = False

class Task(BaseModel):
    id: str
    content: str
    completed: bool = False
    created_at: str
    priority: str = "medium"

class UserData(BaseModel):
    notes: List[Note] = []
    tasks: List[Task] = []

# In-memory storage for demonstration
# In production, this would be connected to MongoDB
user_data_store = {}

@app.get("/")
async def root():
    return {"message": "AI Personal Assistant Backend is running!", "status": "healthy"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/backup/notes")
async def backup_notes(notes: List[Note]):
    """Backup notes to server (optional sync with Puter.js)"""
    try:
        user_id = "default_user"  # In production, get from auth
        
        if user_id not in user_data_store:
            user_data_store[user_id] = UserData()
        
        user_data_store[user_id].notes = notes
        
        return {"message": "Notes backed up successfully", "count": len(notes)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/backup/tasks")
async def backup_tasks(tasks: List[Task]):
    """Backup tasks to server (optional sync with Puter.js)"""
    try:
        user_id = "default_user"  # In production, get from auth
        
        if user_id not in user_data_store:
            user_data_store[user_id] = UserData()
        
        user_data_store[user_id].tasks = tasks
        
        return {"message": "Tasks backed up successfully", "count": len(tasks)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics")
async def get_analytics():
    """Get analytics data for the dashboard"""
    try:
        user_id = "default_user"  # In production, get from auth
        
        if user_id not in user_data_store:
            return {
                "total_notes": 0,
                "total_tasks": 0,
                "completed_tasks": 0,
                "active_tasks": 0,
                "productivity_score": 0
            }
        
        user_data = user_data_store[user_id]
        total_tasks = len(user_data.tasks)
        completed_tasks = len([t for t in user_data.tasks if t.completed])
        
        productivity_score = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0
        
        return {
            "total_notes": len(user_data.notes),
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "active_tasks": total_tasks - completed_tasks,
            "productivity_score": round(productivity_score, 1)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/enhance-note")
async def enhance_note(note_content: str):
    """Enhance a note with AI insights (placeholder for future AI integration)"""
    try:
        # This would integrate with AI service in production
        # For now, return a simple enhancement
        enhanced_content = f"Enhanced: {note_content} - Consider organizing this into actionable items."
        
        return {
            "original": note_content,
            "enhanced": enhanced_content,
            "suggestions": [
                "Add deadline if time-sensitive",
                "Break down into smaller tasks",
                "Add priority level"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/task-suggestions")
async def get_task_suggestions(context: str):
    """Get AI-powered task suggestions based on context"""
    try:
        # This would integrate with AI service in production
        # For now, return some sample suggestions
        suggestions = [
            "Review and prioritize your current tasks",
            "Set specific time blocks for deep work",
            "Take breaks every 45-60 minutes",
            "Plan tomorrow's priorities before ending today"
        ]
        
        return {
            "context": context,
            "suggestions": suggestions,
            "motivation": "You're doing great! Every small step counts towards your goals."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/profile")
async def get_user_profile():
    """Get user profile information"""
    try:
        # This would fetch from database in production
        return {
            "user_id": "default_user",
            "name": "Assistant User",
            "preferences": {
                "theme": "dark",
                "ai_suggestions": True,
                "daily_reminders": True
            },
            "stats": {
                "days_active": 1,
                "total_notes": len(user_data_store.get("default_user", UserData()).notes),
                "total_tasks": len(user_data_store.get("default_user", UserData()).tasks)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/daily-summary")
async def generate_daily_summary():
    """Generate a daily summary of activities"""
    try:
        user_id = "default_user"
        
        if user_id not in user_data_store:
            return {"summary": "No activities to summarize yet. Start by adding some notes and tasks!"}
        
        user_data = user_data_store[user_id]
        notes_count = len(user_data.notes)
        tasks_count = len(user_data.tasks)
        completed_count = len([t for t in user_data.tasks if t.completed])
        
        summary = f"""
Today's Summary:
📝 {notes_count} notes captured
✅ {completed_count} tasks completed out of {tasks_count}
🎯 Keep up the great work!

Tomorrow's focus: Complete remaining tasks and add new goals.
        """.strip()
        
        return {
            "summary": summary,
            "metrics": {
                "notes": notes_count,
                "tasks": tasks_count,
                "completed": completed_count
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)