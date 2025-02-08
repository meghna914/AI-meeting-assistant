https://meetai.onrender.com/

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

##architecture diagram 
![Diagram](https://github.com/user-attachments/assets/10c7097d-eb9c-439b-8274-062d18cfffa8)


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

# MeetAI Setup and Installation Guide

## Overview

MeetAI is a powerful meeting assistant solution consisting of four servers working together:

1. **Frontend Server:**
   - This server serves the main user interface of MeetAI.
   
2. **Python Flask Frontend Server:**
   - A Flask-based backend that handles API requests, such as fetching Google Calendar events, and serves frontend content.
   - **Default Port:** 8080

3. **Node Server for LLM Transcribing:**
   - A Node.js server that performs transcribing tasks using a Large Language Model (LLM).
   - **Default Port:** (Check your Node server configuration; e.g., `3000` or `5000`)

4. **Bot Server:**
   - A server responsible for automating meeting tasks, such as joining Microsoft Teams meetings, recording audio, transcribing the meeting, and storing meeting details in MongoDB.
   - **Default Port:** (Configured separately, e.g., `8081`)

Each server operates on a different port and has its own unique setup requirements.

## Prerequisites

Before proceeding with the installation, ensure that you have the following tools and software installed:

- **Git:** Version control software.
  - [Download Git](https://git-scm.com/)

- **Python 3.8+:** Programming language required for the backend Flask server.
  - [Download Python](https://www.python.org/downloads/)

- **Node.js and npm:** Required for the Node.js servers (LLM Transcribing & Frontend Server).
  - [Download Node.js](https://nodejs.org/)

- **MongoDB Atlas Account** or **local MongoDB instance:** For storing meeting-related data.
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or install MongoDB locally [here](https://www.mongodb.com/try/download/community).

- **FFmpeg:** For handling video/audio tasks.
  - **Ubuntu/Debian:**
    ```bash
    sudo apt-get install ffmpeg
    ```
  - **Windows:**
    [Download FFmpeg](https://ffmpeg.org/download.html) and add it to your system’s PATH.

- **Google Chrome:** Required for Selenium automation tasks.
  - [Download Google Chrome](https://www.google.com/chrome/)

- **ChromeDriver:** Managed automatically through `webdriver-manager` used by Selenium.

## Architecture Diagram

![Architecture Diagram](path/to/your/architecture-diagram.png)

## Project Structure

The project follows a modular structure with each component residing in its own directory:


Virtual Environment:
Always activate your Python virtual environment before running Python-based servers.

Environment Variables:
For production, consider using environment variables or a secrets management solution for sensitive configuration (Google OAuth credentials, MongoDB connection strings, etc.).
