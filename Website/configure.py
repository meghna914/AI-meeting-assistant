from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://manusmriti31:ygdpUK8W7SQqXNnO@meetai.31uzo.mongodb.net/?retryWrites=true&w=majority&appName=MeetAI"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

# Access the database
db = client["MeetAI"]  # Replace with your database name