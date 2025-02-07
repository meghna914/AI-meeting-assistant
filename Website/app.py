from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from models import users_collection, meetings_collection
from bson.objectid import ObjectId
from datetime import datetime
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
    return render_template("overview.html", user=session.get('user'))

@app.route('/meetings')
@login_required
def meetings():
    return render_template('meetings.html', user=session.get('user'))

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

if __name__ == "__main__":
    app.run(debug=True)