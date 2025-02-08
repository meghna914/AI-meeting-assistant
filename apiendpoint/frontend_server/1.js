const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Use the stealth plugin to help avoid detection.
puppeteer.use(StealthPlugin());

// ----- Configuration -----
const GOOGLE_EMAIL = 'jujutsupizzasenpai@gmail.com';
const GOOGLE_PASSWORD = 'yourpassword';
const MEET_URL = 'https://meet.google.com/xyz-abc-def'; // Replace with your meeting URL

// ----- Helper Functions -----

/**
 * Logs into Google via Stack Overflow.
 * This function navigates to Stack Overflow's login page,
 * clicks the "Log in with Google" button, and then completes
 * the Google login flow.
 * @param {puppeteer.Page} page
 * @param {string} username
 * @param {string} password
 */
async function loginViaStackOverflow(page, username, password) {
  console.log("Navigating to Stack Overflow login page...");
  await page.goto('https://stackoverflow.com/users/login', { waitUntil: 'networkidle2' });
  
  // Wait for and click the "Log in with Google" button.
  // (The selector below uses a data-provider attribute—adjust if needed.)
  await page.waitForSelector('a[data-provider="google"]', { visible: true });
  await page.click('a[data-provider="google"]');
  console.log("Clicked 'Log in with Google' on Stack Overflow.");

  // Wait for the Google login page to load.
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  
  // Now perform the Google login flow.
  console.log("Entering Google credentials...");
  
  // Wait for the email field, then type the email.
  await page.waitForSelector('input[type="email"]', { visible: true });
  await page.click('input[type="email"]');
  await page.type('input[type="email"]', username, { delay: 50 });
  await page.waitForSelector('#identifierNext', { visible: true });
  await page.click('#identifierNext');

  // Wait for password field to appear.
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await page.waitForSelector('input[type="password"]', { visible: true });
  await page.click('input[type="password"]');
  await page.type('input[type="password"]', password, { delay: 50 });
  await page.waitForSelector('#passwordNext', { visible: true });
  await page.click('#passwordNext');

  // Wait for login to complete.
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  console.log("Logged into Google successfully via Stack Overflow.");
}

/**
 * Joins a Google Meet by navigating to the meeting URL and clicking "Join now" if present.
 * @param {puppeteer.Page} page
 * @param {string} meetingUrl
 */
async function joinMeeting(page, meetingUrl) {
  console.log("Navigating to Google Meet...");
  await page.goto(meetingUrl, { waitUntil: 'networkidle2' });
  
  // Optionally, wait for the "Join now" button and click it.
  try {
    // The selector below may need adjustment depending on the current Meet UI.
    await page.waitForSelector('button[jsname="LgbsSe"]', { visible: true, timeout: 15000 });
    await page.click('button[jsname="LgbsSe"]');
    console.log("Clicked 'Join now' button.");
  } catch (e) {
    console.log("Could not find 'Join now' button or an error occurred:", e);
  }
}

// ----- Main Function -----
(async () => {
  // Launch Puppeteer with headful mode and the additional arguments.
  const browser = await puppeteer.launch({
    headless: false, 
    args: [
      '--start-maximized',
      '--disable-web-security',
      // Provide a path to a user data directory (this can be any writable directory)
      '--user-data-dir=/tmp/puppeteer_data',
      '--allow-running-insecure-content'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  
  // Perform the Google login via Stack Overflow.
  try {
    await loginViaStackOverflow(page, GOOGLE_EMAIL, GOOGLE_PASSWORD);
  } catch (e) {
    console.error("Error during login via Stack Overflow:", e);
    await browser.close();
    return;
  }
  
  // Join the specified Google Meet.
  try {
    await joinMeeting(page, MEET_URL);
  } catch (e) {
    console.error("Error while joining the meeting:", e);
  }
  
  // Keep the browser open for 20 seconds so you can observe the result.
  console.log("Waiting for 20 seconds before closing...");
  await page.waitForTimeout(20000);
  
  await browser.close();
  console.log("Browser closed.");
})();
