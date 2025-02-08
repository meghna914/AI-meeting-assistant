const express = require('express');
const session = require('express-session');
const fs = require('fs'); // Required for writing token.json
const { google } = require('googleapis');

const app = express();

// Configure Express-session for state management
app.use(
  session({
    secret: 'your_secret_key', // Change this to a secure random string
    resave: false,
    saveUninitialized: true,
  })
);

// Your Google OAuth credentials (replace these with your actual values)
const CLIENT_ID = '413622896411-f1jb1jvu08ajjrbic7t54lnjlkl4pgkg.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/auth/google/callback';

// Create an OAuth2 client with the given credentials
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Define the scopes for Google Calendar (and optionally OpenID for profile info)
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly'
  // You can add other scopes if needed, e.g. 'openid', 'https://www.googleapis.com/auth/userinfo.email'
];

// Home route: Provide a link to start the authentication
app.get('/', (req, res) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>');
});

// Route to start OAuth2 authentication
app.get('/auth/google', (req, res) => {
  // Generate a random state string for CSRF protection (here we use a static value for simplicity)
  const state = 'some_random_state_string';
  req.session.oauthState = state;

  // Generate the URL for Google OAuth consent page
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // will return a refresh token
    scope: SCOPES,
    state: state,
    prompt: 'consent', // forces the consent screen to show
  });

  res.redirect(authUrl);
});

// OAuth callback endpoint (must match the Authorized Redirect URI in your Google Console)
app.get('/auth/google/callback', async (req, res) => {
  const { code, state } = req.query;
  const sessionState = req.session.oauthState;

  // Verify state for CSRF protection
  if (!state || state !== sessionState) {
    return res.status(400).send('State mismatch error! CSRF detected.');
  }

  try {
    // Exchange the authorization code for access tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Optionally store tokens in session if needed
    req.session.tokens = tokens;

    // Write tokens to token.json (formatted for readability)
    fs.writeFileSync('token.json', JSON.stringify(tokens, null, 2));
    console.log('Tokens saved to token.json');

    // Log before redirecting
    console.log('Authentication successful. Redirecting to dashboard...');
    
    // Redirect to localhost:5000/dashboard after authentication
    res.redirect('http://localhost:5000/dashboard');
  } catch (error) {
    console.error('Error during OAuth callback processing:', error);
    res.status(500).send('Authentication error.');
  }
});


// Start the Express server on port 3000
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
