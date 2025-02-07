from configure import db
from bson.objectid import ObjectId
from datetime import datetime

# Collections
users_collection = db["users"]
meetings_collection = db["meetings"]

# User Schema
user_schema = {
    "username": str,
    "email": str,
    "password": str,  # Store hashed passwords
    "meetings": list,  # Array of meeting IDs
}

# Meeting Schema
meeting_schema = {
    "meeting_id": str,  # Unique ID for the meeting
    "meeting_name": str,
    "meeting_time": datetime,
    "meeting_url": str,
    "meeting_platform": str,  # Optional, limited to 4 types
    "meeting_audio": bytes,  # Binary data for audio files
    "meeting_audio_text": str,
    "meeting_summary": str,
    "meeting_tasks": list,  # Array of tasks (strings)
}