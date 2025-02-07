from flask import Flask, render_template, request, redirect, url_for


app = Flask(__name__)

# Rename settings to app_settings
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

@app.route('/')
def index():
    # Pass app_settings instead of settings
    return render_template('landing.html', 
                         settings=app_settings,
                         fontLink="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap",
                         secondaryFontLink="https://fonts.googleapis.com/css2?family=Poppins:wght@100..900&display=swap")

@app.route('/overview')
def overview():
    return render_template('overview.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        # Here you would typically verify the credentials
        # For now, we'll just redirect to overview
        return redirect(url_for('overview'))
    return render_template('login.html')

@app.route('/meetings')
def meetings():
    return render_template('meetings.html')

@app.route('/recordings')
def recordings():
    return render_template('recordings.html')

@app.route('/analytics')
def analytics():
    return render_template('analytics.html')

@app.route('/decisions')
def decisions():
    return render_template('decisions.html')

@app.route('/tasks')
def tasks():
    return render_template('tasks.html')

@app.route('/settings')
def settings_page():  # Rename this function to avoid conflict
    return render_template('settings.html')

if __name__ == '__main__':
    app.run(debug=True)
