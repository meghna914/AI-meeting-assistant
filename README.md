# MeetAI Server Setup and Installation

## Overview

MeetAI is composed of four separate servers that work together to provide a complete meeting assistant solution:

1. **Frontend Server:**  
   Serves the main user interface for MeetAI.

2. **Python Flask Frontend Server:**  
   A Flask-based backend that handles API requests (e.g., fetching Google Calendar events) and serves frontend content.  
   **Default Port:** 8080

3. **Node Server for LLM Transcribing:**  
   A Node.js server that handles transcribing tasks using an LLM (Large Language Model).  
   **Default Port:** (Check your Node server configuration; e.g., 3000 or 5000)

4. **Bot Server:**  
   A server that automates meeting interactions (e.g., joining Microsoft Teams meetings, recording audio, transcribing, and storing meeting details in MongoDB).  
   **Default Port:** (Configured separately, e.g., 8081)

Each server runs on a different port and has its own setup requirements.

---

## Prerequisites

- **Git:** [Download Git](https://git-scm.com/downloads)
- **Python 3.8+**: [Download Python](https://www.python.org/downloads/)
- **Node.js and npm:** [Download Node.js](https://nodejs.org/)
- **MongoDB Atlas Account** (or a local MongoDB instance)
- **FFmpeg:**  
  - Ubuntu/Debian: `sudo apt-get install ffmpeg`  
  - Windows: [Download FFmpeg](https://ffmpeg.org/download.html) and add it to your PATH
- **Google Chrome:** (for Selenium automation)
- **ChromeDriver:** Managed automatically via `webdriver-manager`

---

## Project Structure

```
/MeetAI
├── /frontend_server          # Frontend server (Node.js/static files)
├── /python_frontend_server    # Python Flask server (serves API and frontend)
├── /node_transcribe_server   # Node server for LLM transcribing
├── /bot_server               # Bot server (Selenium-based meeting automation)
├── README.md
├── requirements.txt         # Python dependencies for Python servers
├── package.json             # Node.js dependencies for Node servers
```

Setup Instructions
1. Clone the Repository
bash
Copy
git clone https://github.com/yourusername/MeetAI.git
cd MeetAI
2. Python Environment Setup (For Python Flask Frontend and Bot Server)
Create a Virtual Environment:

bash
Copy
python3 -m venv venv
Activate the Virtual Environment:

Linux/Mac:

bash
Copy
source venv/bin/activate
Windows:

bash
Copy
venv\Scripts\activate
Install Python Dependencies:

bash
Copy
pip install -r requirements.txt
Ensure that your requirements.txt includes packages such as:

Flask
selenium
webdriver-manager
google-api-python-client
pymongo
3. Node.js Environment Setup (For Node Transcribe Server and Frontend Server)
Navigate to the Node server directory:

bash
Copy
cd node_transcribe_server
Install Node Dependencies:

bash
Copy
npm install
Repeat similar steps for the frontend_server if it is a Node-based server:

bash
Copy
cd ../frontend_server
npm install
4. Configuration
Google OAuth Token:
Place your token.json file at the hardcoded path:
/home/yash/Desktop/code/repo/AI-meeting-assistant/apiendpoint/frontend_server/token.json
This file should contain your Google OAuth token object (access token, refresh token, etc.).

MongoDB Connection:
The MongoDB connection string is hardcoded in the Python code. Verify and update it if necessary.

Default Teams Parameters:
The bot server automatically appends default Microsoft Teams parameters to any meeting link to bypass browser alerts.

Ports:

Python Flask frontend server runs on port 8080.
Adjust the Node server and bot server port settings in their respective code/configuration files if needed.
5. Starting the Servers
Python Flask Frontend Server
Navigate to the Python server directory (if separate) or from the project root, then run:

bash
Copy
python app.py
This will start the Flask server on port 8080 (as configured in the code).

Bot Server
If your bot server is a separate Flask application (or part of the Python server), start it similarly:

bash
Copy
python bot_app.py
(Ensure its port is configured appropriately, e.g., 8081.)

Node Transcription Server
Navigate to the Node server directory and start it:

bash
Copy
cd node_transcribe_server
npm start
This will start the Node server on its configured port (e.g., 3000 or 5000).

Frontend Server
If your frontend server is Node-based or serves static files, navigate to its directory and run:

bash
Copy
cd frontend_server
npm start
Alternatively, you can serve static files using a static file server (e.g., npx serve .).

Testing the Setup
1. Test the Google Calendar API
Via Browser:
Open your browser and navigate to:
http://localhost:8080/api/calendar

Via curl:

bash
Copy
curl http://localhost:8080/api/calendar
This should return a JSON array of your upcoming Google Calendar events.

2. Test the Meeting Processing API
Use a tool like Postman or curl to send a POST request to the meeting API endpoint.

Example using curl:

bash
Copy
curl -X POST http://localhost:8080/api/meeting \
     -H "Content-Type: application/json" \
     -d '{"meeting_link": "https://teams.live.com/v2/#/meet/your-meeting-link"}'
The bot will join the meeting (with default parameters appended), record a short audio snippet, generate stubbed transcript and summary data, and store the details in MongoDB. The response will include the meeting ID, transcript, and summary.

3. Test the Node Transcription Server
Follow the API documentation provided in the Node server (if available) to test its endpoints.

4. Test the Frontend
Access your frontend via the URL configured (e.g., http://localhost:3000).

Additional Notes
FFmpeg:
Ensure that FFmpeg is installed and available in your system’s PATH.

Selenium and ChromeDriver:
The bot server uses Selenium with webdriver-manager to handle ChromeDriver automatically. Ensure your Chrome browser is up-to-date.

Virtual Environment:
Always activate your Python virtual environment before running Python-based servers.

Environment Variables:
For production, consider using environment variables or a secrets management solution for sensitive configuration (Google OAuth credentials, MongoDB connection strings, etc.).
