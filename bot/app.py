import time
import subprocess
import os
import json
import datetime
from flask import Flask, request, jsonify

# Selenium imports
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# MongoDB imports
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# Initialize the Flask application
app = Flask(__name__)

# ------------------------------------------------------------------
# Configuration for Meeting Bot and Audio Recording
# ------------------------------------------------------------------
TEST_MEETING_URL = ("https://teams.live.com/v2/#/meet/9317404259413?"
                    "p=k7aSLkjIqraEuhnWY2&anon=true&v=.jlw&launchType=web&"
                    "deeplinkId=dc86d089-ac8b-413e-8f1c-6fbb09899a4b")
RECORD_DURATION = 10  # seconds
AUDIO_OUTPUT_FILENAME_TEMPLATE = "meeting_audio_{}.wav"

# Hardcoded path to token.json file
TOKEN_PATH = "/home/yash/Desktop/code/repo/AI-meeting-assistant/apiendpoint/frontend_server/token.json"

def explain_bot_meeting_access_limitations():
    print("Attempting to join meeting...\n"
          "Note: Automated meeting joins can be affected by authentication requirements, "
          "bot/automation detection, meeting-specific restrictions, or other technical issues.\n"
          "Please wait...")
    time.sleep(4)

def click_if_exists(driver, xpath, description, timeout=30):
    """
    Wait for an element by its XPath to be clickable, then click it.
    """
    try:
        element = WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable((By.XPATH, xpath))
        )
        driver.execute_script("arguments[0].scrollIntoView(true);", element)
        element.click()
        print(f"Clicked {description}")
        return True
    except Exception as e:
        print(f"{description} not found or error: {e}")
        return False

def enter_text_if_exists(driver, xpath, text, description, timeout=30):
    """
    Wait for an input field by its XPath, then enter the provided text.
    """
    try:
        element = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.XPATH, xpath))
        )
        element.clear()
        element.send_keys(text)
        print(f"Entered '{text}' into {description}")
        return True
    except Exception as e:
        print(f"{description} not found or error: {e}")
        return False

def join_meeting(meeting_url):
    """
    Uses Selenium to simulate joining a Microsoft Teams meeting.
    The flow is:
      0. Open the meeting URL.
      1. Click the "Continue without audio or video" button.
      2. Enter the guest name in the field with data-tid="prejoin-display-name-input".
      3. Click the "Join now" button (identified by id="prejoin-join-button").
    """
    chrome_options = Options()
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    # Disable security features that might block automation:
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--allow-running-insecure-content")
    chrome_options.add_argument("--ignore-certificate-errors")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-popup-blocking")
    chrome_options.add_argument("--disable-infobars")
    # Set preferences: disable camera (2=block), allow mic, geolocation, and notifications.
    prefs = {
        "profile.default_content_setting_values.media_stream_camera": 2,
        "profile.default_content_setting_values.media_stream_mic": 1,
        "profile.default_content_setting_values.geolocation": 1,
        "profile.default_content_setting_values.notifications": 1
    }
    chrome_options.add_experimental_option("prefs", prefs)
    
    service_obj = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service_obj, options=chrome_options)
    
    explain_bot_meeting_access_limitations()
    driver.get(meeting_url)
    print(f"Opened Microsoft Teams meeting URL: {meeting_url}")
    time.sleep(3)
    
    # Step 0: Click "Continue without audio or video"
    click_if_exists(driver, "//button[contains(text(),'Continue without audio or video')]", 
                    '"Continue without audio or video" button', timeout=30)
    time.sleep(2)
    
    # Step 1: Enter Guest Name
    if enter_text_if_exists(driver, "//input[@data-tid='prejoin-display-name-input']", "Guest", 
                            "guest name field", timeout=30):
        time.sleep(2)
    else:
        print("Guest name field not found; proceeding without entering a name.")
    
    # Step 2: Click "Join now" button
    click_if_exists(driver, "//button[@id='prejoin-join-button']", '"Join now" button', timeout=30)
    time.sleep(5)  # Allow time for the meeting page to stabilize
    return driver

def record_audio(duration, output_filename):
    """
    Uses FFmpeg to record audio from the default input.
    Adjust the input format (e.g., 'alsa' for Linux, 'dshow' for Windows, or 'avfoundation' for macOS)
    as required for your operating system.
    """
    command = [
        "ffmpeg",
        "-y",  # Overwrite output file if it exists
        "-f", "alsa",  # Change to 'dshow' on Windows or 'avfoundation' on macOS
        "-ac", "2",  # Stereo
        "-i", "default",  # Default audio input
        "-t", str(duration),
        output_filename
    ]
    print(f"Recording audio for {duration} seconds to {output_filename}...")
    subprocess.run(command, check=True)
    print(f"Audio recorded to {output_filename}")
    return output_filename

def transcribe_audio(audio_filename):
    # Replace this stub with your actual speech-to-text processing.
    transcript = "Transcription of the meeting audio would appear here."
    return transcript

def summarize_text(text):
    # Replace this stub with your actual summarization logic.
    summary = "Summary of the meeting transcript would appear here."
    return summary

# ------------------------------------------------------------------
# Google Calendar API Endpoint (/api/calendar)
# ------------------------------------------------------------------
@app.route('/api/calendar', methods=['GET'])
def get_calendar_events():
    """
    Loads the token from the specified TOKEN_PATH, then uses the token data
    to create credentials and fetch the upcoming 10 events from the primary Google Calendar.
    """
    try:
        with open(TOKEN_PATH, 'r') as f:
            token_data = json.load(f)
    except Exception as e:
        return jsonify({"error": "token.json not found or invalid", "message": str(e)}), 500

    from google.oauth2.credentials import Credentials
    from googleapiclient.discovery import build
    creds = Credentials(
        token_data['access_token'],
        refresh_token=token_data.get('refresh_token'),
        token_uri="https://oauth2.googleapis.com/token",
        client_id="413622896411-f1jb1jvu08ajjrbic7t54lnjlkl4pgkg",
        client_secret="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"
    )
    service = build('calendar', 'v3', credentials=creds)
    now = datetime.datetime.utcnow().isoformat() + 'Z'
    events_result = service.events().list(
        calendarId='primary', timeMin=now, maxResults=10, singleEvents=True, orderBy='startTime'
    ).execute()
    events = events_result.get('items', [])
    return jsonify(events)

# ------------------------------------------------------------------
# MongoDB Connection and Collection
# ------------------------------------------------------------------
uri = "mongodb+srv://manusmriti31:ygdpUK8W7SQqXNnO@meetai.31uzo.mongodb.net/?retryWrites=true&w=majority&appName=MeetAI"
client = MongoClient(uri, server_api=ServerApi('1'))
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)
db = client["MeetAI"]
meetings_collection = db["meetings"]

# ------------------------------------------------------------------
# Meeting API Endpoint (/api/meeting)
# ------------------------------------------------------------------
@app.route('/api/meeting', methods=['POST'])
def process_meeting():
    """
    Expects a JSON payload with a "meeting_link" field.
    The bot will:
      1. Join the provided meeting link (using Microsoft Teams functionality).
      2. Record a short audio snippet.
      3. (Stub) Transcribe and summarize the audio.
      4. Store the meeting details in MongoDB.
    """
    data = request.get_json()
    meeting_link = data.get('meeting_link')
    if not meeting_link:
        return jsonify({"error": "Missing meeting_link parameter"}), 400

    meeting_id = int(time.time())
    audio_filename = AUDIO_OUTPUT_FILENAME_TEMPLATE.format(meeting_id)
    driver = join_meeting(meeting_link)
    time.sleep(10)  # Allow the meeting to stabilize
    record_audio(RECORD_DURATION, audio_filename)
    driver.quit()

    transcript = transcribe_audio(audio_filename)
    summary = summarize_text(transcript)

    meeting_doc = {
        "meeting_link": meeting_link,
        "timestamp": datetime.datetime.utcnow(),
        "audio_filename": audio_filename,
        "transcript": transcript,
        "summary": summary
    }
    result = meetings_collection.insert_one(meeting_doc)

    return jsonify({
        "message": "Meeting processed and data stored",
        "meeting_id": str(result.inserted_id),
        "transcript": transcript,
        "summary": summary
    })

# ------------------------------------------------------------------
# Main: Run the Flask App on Port 8080
# ------------------------------------------------------------------
if __name__ == '__main__':
    app.run(port=8080, debug=True)
