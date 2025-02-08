import time
import subprocess
import os
from datetime import datetime, timezone

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ------------------------------------------------------------------
# Configuration
# ------------------------------------------------------------------
# Direct meeting link to join (Microsoft Teams in this case) with parameters that bypass initial alerts
TEST_MEETING_URL = ("https://teams.live.com/v2/#/meet/9317404259413?"
                    "p=k7aSLkjIqraEuhnWY2&anon=true&v=.jlw&launchType=web&"
                    "deeplinkId=dc86d089-ac8b-413e-8f1c-6fbb09899a4b")

# Duration (in seconds) for audio recording (adjust as needed)
RECORD_DURATION = 10

# Template for output filename (one per meeting)
AUDIO_OUTPUT_FILENAME_TEMPLATE = "meeting_audio_{}.wav"


# ------------------------------------------------------------------
# Helper: Explain Bot Meeting Access Limitations
# ------------------------------------------------------------------
def explain_bot_meeting_access_limitations():
    print("Attempting to join meeting...\n"
          "Note: Automated meeting joins can be affected by authentication requirements, "
          "bot/automation detection, meeting-specific restrictions, or other technical issues.\n"
          "Please wait...")
    time.sleep(4)


# ------------------------------------------------------------------
# Helper: Click Element If Found
# ------------------------------------------------------------------
def click_if_exists(driver, xpath, description, timeout=30):
    """
    Waits for an element identified by its XPath to be clickable, then clicks it.
    Returns True if clicked, or False otherwise.
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


# ------------------------------------------------------------------
# Helper: Enter Text in Field If Found
# ------------------------------------------------------------------
def enter_text_if_exists(driver, xpath, text, description, timeout=30):
    """
    Waits for an input field to be present and enters the specified text.
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


# ------------------------------------------------------------------
# Function: Join Meeting (Starting from Prejoin Page)
# ------------------------------------------------------------------
def join_meeting(meeting_url):
    """
    Uses Selenium to simulate joining a Microsoft Teams meeting.
    With the provided URL parameters, we expect to bypass the initial alerts
    and land directly on the prejoin page. This function:
      0. Clicks the "Continue without audio or video" button.
      1. Waits for the guest name input (using its data-tid attribute) and enters "Guest".
      2. Clicks the "Join now" button (using its id).
    """
    chrome_options = Options()
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    
    # Disable various security features
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--allow-running-insecure-content")
    chrome_options.add_argument("--ignore-certificate-errors")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-popup-blocking")
    chrome_options.add_argument("--disable-infobars")
    
    # Set preferences:
    #   - Disable the camera by setting its content setting to 2 (block)
    #   - Allow microphone, geolocation, and notifications (set to 1 = allow)
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
    
    # Open the meeting URL
    driver.get(meeting_url)
    print(f"Opened Microsoft Teams meeting URL: {meeting_url}")
    time.sleep(3)
    
    # --- Step 0: Click "Continue without audio or video" ---
    click_if_exists(driver, "//button[contains(text(),'Continue without audio or video')]", 
                    '"Continue without audio or video" button', timeout=30)
    time.sleep(2)
    
    # --- Step 1: Enter Guest Name ---
    # Using the input element with data-tid="prejoin-display-name-input"
    if enter_text_if_exists(driver, "//input[@data-tid='prejoin-display-name-input']", "Guest", 
                            "guest name field", timeout=30):
        time.sleep(2)
    else:
        print("Guest name field not found; proceeding without entering a name.")
    
    # --- Step 2: Click the "Join now" button ---
    # Using the button with id="prejoin-join-button"
    click_if_exists(driver, "//button[@id='prejoin-join-button']", '"Join now" button', timeout=30)
    time.sleep(5)  # Allow time for the meeting page to stabilize
    
    return driver


# ------------------------------------------------------------------
# Function: Record Audio Using FFmpeg
# ------------------------------------------------------------------
def record_audio(duration, output_filename):
    """
    Uses FFmpeg to record audio from the default input.
    Adjust the input format ('alsa' for Linux, 'dshow' for Windows, 'avfoundation' for macOS)
    as required for your operating system.
    """
    command = [
        "ffmpeg",
        "-y",                # Overwrite the output file if it exists
        "-f", "alsa",        # Change this if not on Linux (e.g., 'dshow' for Windows)
        "-ac", "2",          # 2 channels (stereo)
        "-i", "default",     # Default audio input device
        "-t", str(duration), # Duration in seconds
        output_filename
    ]
    print(f"Recording audio for {duration} seconds to {output_filename}...")
    subprocess.run(command, check=True)
    print(f"Audio recorded to {output_filename}")
    return output_filename


# ------------------------------------------------------------------
# Function: Transcribe and Summarize (Stubs)
# ------------------------------------------------------------------
def transcribe_audio(audio_filename):
    # Replace this stub with your chosen speech-to-text engine
    transcript = "Transcription of the meeting audio would appear here."
    return transcript


def summarize_text(text):
    # Replace this stub with your chosen summarization engine
    summary = "Summary of the meeting transcript would appear here."
    return summary


# ------------------------------------------------------------------
# Main Function: Directly Join the Meeting and Run a Test
# ------------------------------------------------------------------
def main():
    meeting_id = 1
    meeting_url = TEST_MEETING_URL
    print(f"Directly joining meeting: {meeting_url}")
    
    # Attempt to join the meeting (starting from the prejoin page)
    driver = join_meeting(meeting_url)
    
    # Wait for the meeting to stabilize (adjust this sleep time as needed)
    time.sleep(10)
    
    # Record a short audio snippet as a test run
    audio_filename = AUDIO_OUTPUT_FILENAME_TEMPLATE.format(meeting_id)
    record_audio(RECORD_DURATION, audio_filename)
    
    # Close the browser session
    driver.quit()
    print(f"Meeting processing complete. Audio saved to {audio_filename}")
    
    # Process transcription and summarization (using stub functions)
    transcript = transcribe_audio(audio_filename)
    print("Transcript:")
    print(transcript)
    
    summary = summarize_text(transcript)
    print("Summary:")
    print(summary)
    
    # Optionally, save the transcript and summary to text files
    with open(f"meeting_transcript_{meeting_id}.txt", "w") as f:
        f.write(transcript)
    with open(f"meeting_summary_{meeting_id}.txt", "w") as f:
        f.write(summary)


if __name__ == '__main__':
    main()
