from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
from bson.objectid import ObjectId  # Import ObjectId

# MongoDB connection URI
uri = "mongodb+srv://manusmriti31:ygdpUK8W7SQqXNnO@meetai.31uzo.mongodb.net/?retryWrites=true&w=majority&appName=MeetAI"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Access the database
db = client["MeetAI"]

# Access the collections
users_collection = db["users"]
meetings_collection = db["meetings"]

# Dummy meetings data
dummy_meetings = [
    {
        "meeting_id": "1",
        "meeting_name": "Team Sync",
        "meeting_time": datetime.now(),
        "meeting_url": "https://meet.example.com/team-sync",
        "meeting_platform": "Zoom",
        "meeting_audio": b"dummy_audio_data",
        "meeting_audio_text": "This is a dummy audio text.",
        "meeting_summary": "Discussed project updates.",
        "meeting_tasks": ["Decide who is going to do the database", "Decide who is going to do the frontend"]
    },
    {
        "meeting_id": "2",
        "meeting_name": "Project Review",
        "meeting_time": datetime.now(),
        "meeting_url": "https://meet.example.com/project-review",
        "meeting_platform": "Google Meet",
        "meeting_audio": b"dummy_audio_data",
        "meeting_audio_text": "This is another dummy audio text.",
        "meeting_summary": "Reviewed project milestones.",
        "meeting_tasks": ["Is the work on alex enough or we need to do more", "Review the new details which ramesh has put forward"]
    },
    {
        "meeting_id": "3",
        "meeting_name": "Client Meeting",
        "meeting_time": datetime.now(),
        "meeting_url": "https://meet.example.com/client-meeting",
        "meeting_platform": "Microsoft Teams",
        "meeting_audio": b"dummy_audio_data",
        "meeting_audio_text": "This is yet another dummy audio text.",
        "meeting_summary": "Discussed client requirements.",
        "meeting_tasks": ["Finalize the price for the new requirments", "provide the client with a follow up mail for the payment"]
    }
]

# Insert dummy meetings into the meetings collection
meetings_collection.insert_many(dummy_meetings)

# Get the meeting IDs
meeting_ids = [meeting["meeting_id"] for meeting in dummy_meetings]

# Update the user document to include the new meeting IDs
user_id = ObjectId("67a690fe3d9bfd5d29ec077e")  # Convert the string to ObjectId
users_collection.update_one(
    {"_id": user_id},  # Use the ObjectId in the query
    {"$push": {"meetings": {"$each": meeting_ids}}}
)

print("Dummy meetings inserted and user updated successfully.")