from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from models import users_collection, meetings_collection
from bson.objectid import ObjectId
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Add a secret key for sessions

app_settings = {
    'colors': {
        'primary': '#3B82F6',   # Blue-500
        'secondary': '#6B7280',  # Gray-500
        'accent': '#8B5CF6'      # Purple-500
    },
    'favicon': '/static/favicon.ico',
    'fonts': {
        'primary': 'Inter',
        'secondary': 'Poppins'
    }
}

# Login required decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    return render_template('landing.html', 
                         settings=app_settings,
                         fontLink="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
                         secondaryFontLink="https://fonts.googleapis.com/css2?family=Poppins:wght@100..900&display=swap")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email")
        password = request.form.get("password")
        user = users_collection.find_one({"email": email, "password": password})
        if user:
            session['user'] = {
                'username': user['username'],
                'email': user['email']
            }
            return redirect(url_for("dashboard"))
        else:
            return "Invalid credentials", 401
    return render_template("login.html")

@app.route("/signup", methods=["POST"])
def signup():
    data = request.form
    user = {
        "username": data.get("username"),
        "email": data.get("email"),
        "password": data.get("password"),
        "meetings": [],
    }
    users_collection.insert_one(user)
    return redirect(url_for("login"))

@app.route("/logout")
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))

@app.route("/dashboard")
@login_required
def dashboard():
    # Get current user's meetings
    user_email = session.get('user')['email']
    user_data = users_collection.find_one({"email": user_email})
    
    # Get current time for comparison
    current_time = datetime.now()
    
    # Get all meetings for the user
    user_meetings = list(meetings_collection.find({
        "meeting_id": {"$in": user_data.get("meetings", [])}
    }).sort("meeting_time", 1))
    
    # Process meetings
    today_meetings = []
    completed_meetings = []
    colors = ['blue', 'purple', 'green', 'indigo']
    
    for meeting in user_meetings:
        meeting['color'] = colors[hash(meeting['meeting_id']) % len(colors)]
        
        # Check if meeting is today
        if meeting['meeting_time'].date() == current_time.date():
            today_meetings.append(meeting)
        # Changed condition: Check if meeting time is in the past
        if meeting['meeting_time'] < current_time:
            completed_meetings.append(meeting)
    
    # Get last 5 completed meetings with their tasks
    recent_activities = []
    for meeting in completed_meetings[:5]:
        if meeting.get('meeting_tasks'):
            for task in meeting['meeting_tasks']:
                recent_activities.append({
                    'type': 'task',
                    'description': task,
                    'meeting_name': meeting['meeting_name'],
                    'timestamp': meeting['meeting_time']
                })
    
    print("Debug - Today's Meetings:", len(today_meetings))
    print("Debug - Completed Meetings:", len(completed_meetings))
    print("Debug - Recent Activities:", len(recent_activities))

    return render_template(
        "overview.html",
        user=session.get('user'),
        meetings=today_meetings,
        activities=recent_activities[:5]
    )

@app.route('/meetings')
@login_required
def meetings():
    # Get current user's meetings
    user_email = session.get('user')['email']
    user_data = users_collection.find_one({"email": user_email})
    current_time = datetime.now()

    # Get all meetings for the user
    user_meetings = list(meetings_collection.find({
        "meeting_id": {"$in": user_data.get("meetings", [])}
    }).sort("meeting_time", 1))

    # Separate meetings into today and tomorrow
    today_meetings = []
    tomorrow_meetings = []
    colors = ['blue', 'purple', 'green', 'indigo']

    for meeting in user_meetings:
        meeting['color'] = colors[hash(meeting['meeting_id']) % len(colors)]
        meeting_date = meeting['meeting_time'].date()
        
        if meeting_date == current_time.date():
            today_meetings.append(meeting)
        elif meeting_date == (current_time.date() + timedelta(days=1)):
            tomorrow_meetings.append(meeting)

    return render_template(
        'meetings.html',
        user=session.get('user'),
        today_meetings=today_meetings,
        tomorrow_meetings=tomorrow_meetings,
        current_time=datetime.now(),
        timedelta=timedelta  # Pass timedelta to template
    )

@app.route('/recordings')
@login_required
def recordings():
    return render_template('recordings.html', user=session.get('user'))

@app.route('/analytics')
@login_required
def analytics():
    return render_template('analytics.html', user=session.get('user'))

@app.route('/decisions')
@login_required
def decisions():
    return render_template('decisions.html', user=session.get('user'))

@app.route('/tasks')
@login_required
def tasks():
    return render_template('tasks.html', user=session.get('user'))

@app.route('/settings')
@login_required
def settings_page():
    return render_template('settings.html', user=session.get('user'))

@app.route('/schedule_meeting', methods=['POST'])
@login_required
def schedule_meeting():
    try:
        data = request.json
        user_email = session.get('user')['email']
        
        # Generate a unique meeting ID
        meeting_id = str(ObjectId())
        
        # Create new meeting document
        new_meeting = {
            "meeting_id": meeting_id,
            "meeting_name": data['meeting_name'],
            "meeting_time": datetime.fromisoformat(data['meeting_time'].replace('Z', '+00:00')),
            "meeting_url": data['meeting_url'],
            "meeting_platform": data['meeting_platform'],
            "meeting_tasks": []
        }
        
        # Insert meeting into meetings collection
        result = meetings_collection.insert_one(new_meeting)
        
        # Add meeting ID to user's meetings array
        users_collection.update_one(
            {"email": user_email},
            {"$addToSet": {"meetings": meeting_id}}
        )
        
        return jsonify({"success": True, "message": "Meeting scheduled successfully"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)})

if __name__ == "__main__":
    app.run(debug=True)