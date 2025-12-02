/**
 * Script to get Google Drive refresh token
 * Run this once to get your refresh token for the .env file
 */

const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const open = require('open');
const readline = require('readline');

// INSTRUCTIONS:
// 1. Go to Google Cloud Console: https://console.cloud.google.com/
// 2. Create OAuth 2.0 credentials
// 3. Add http://localhost:3000/oauth2callback as redirect URI
// 4. Copy your Client ID and Client Secret below

const CLIENT_ID = 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';

// Scopes for Google Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

async function getRefreshToken() {
  console.log('\n🔐 Google Drive Refresh Token Generator\n');
  console.log('═══════════════════════════════════════════════════\n');

  // Check if credentials are set
  if (CLIENT_ID === 'YOUR_CLIENT_ID_HERE' || CLIENT_SECRET === 'YOUR_CLIENT_SECRET_HERE') {
    console.log('❌ Error: Please update CLIENT_ID and CLIENT_SECRET in this script\n');
    console.log('Steps:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Create OAuth 2.0 credentials');
    console.log('3. Add http://localhost:3000/oauth2callback as redirect URI');
    console.log('4. Copy your Client ID and Client Secret');
    console.log('5. Update them in this script (lines 14-15)');
    console.log('6. Run this script again\n');
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force consent screen to get refresh token
  });

  console.log('📋 Step 1: Authorize this app\n');
  console.log('Opening browser to authorize...\n');
  console.log('If browser doesn\'t open, visit this URL:\n');
  console.log(authUrl);
  console.log('\n');

  // Open browser
  try {
    await open(authUrl);
  } catch (error) {
    console.log('Could not open browser automatically. Please open the URL manually.\n');
  }

  // Create server to receive callback
  const server = http.createServer(async (req, res) => {
    try {
      if (req.url.indexOf('/oauth2callback') > -1) {
        const qs = new url.URL(req.url, 'http://localhost:3000').searchParams;
        const code = qs.get('code');

        res.end('✅ Authorization successful! You can close this window and return to the terminal.');

        server.close();

        // Get tokens
        const { tokens } = await oauth2Client.getToken(code);
        
        console.log('\n✅ Success! Here is your refresh token:\n');
        console.log('═══════════════════════════════════════════════════\n');
        console.log(tokens.refresh_token);
        console.log('\n═══════════════════════════════════════════════════\n');
        console.log('📋 Add this to your backend/.env file:\n');
        console.log(`GOOGLE_DRIVE_CLIENT_ID=${CLIENT_ID}`);
        console.log(`GOOGLE_DRIVE_CLIENT_SECRET=${CLIENT_SECRET}`);
        console.log(`GOOGLE_DRIVE_REDIRECT_URI=${REDIRECT_URI}`);
        console.log(`GOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log('\n✅ Setup complete!\n');

        process.exit(0);
      }
    } catch (error) {
      console.error('❌ Error getting tokens:', error.message);
      res.end('❌ Error during authorization. Check the terminal for details.');
      process.exit(1);
    }
  });

  server.listen(3000, () => {
    console.log('📡 Waiting for authorization...\n');
  });
}

getRefreshToken().catch(console.error);
