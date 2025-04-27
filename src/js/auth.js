// Client ID, Client Secret and API key from GitHub Secrets (loaded via environment variables)
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const API_KEY = process.env.GOOGLE_API_KEY || '';

// Discovery docs and scopes for Google APIs
const DISCOVERY_DOCS = [
    'https://sheets.googleapis.com/$discovery/rest?version=v4',
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';

// Google Sheet ID and Drive folder ID from GitHub Secrets
const SHEET_ID = process.env.GOOGLE_SHEET_ID || '';
const FOLDER_ID = process.env.GOOGLE_FOLDER_ID || '';

// Authentication state
let isAuthorized = false;
let tokenClient;

/**
 * Initialize the Google API client
 */
function initClient() {
    console.log('Initializing Google API client...');
    
    // First, initialize the gapi client
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS,
    }).then(() => {
        console.log('GAPI client initialized');
        
        // Now initialize the token client
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: handleTokenResponse
        });
        
        console.log('Token client initialized');
        
        // Check if user is already signed in
        if (gapi.client.getToken() !== null) {
            isAuthorized = true;
            updateUIAfterAuth();
            loadAPIs();
        }
    }).catch(error => {
        console.error('Error initializing GAPI client:', error);
        document.getElementById('auth-message').textContent = 'Failed to initialize Google API. Please try again later.';
    });
}

/**
 * Handle the token response from Google
 */
function handleTokenResponse(tokenResponse) {
    console.log('Token response received:', tokenResponse);
    
    if (tokenResponse && !tokenResponse.error) {
        isAuthorized = true;
        updateUIAfterAuth();
        loadAPIs();
    } else {
        isAuthorized = false;
        console.error('Error authenticating:', tokenResponse ? tokenResponse.error : 'No response');
        document.getElementById('auth-message').textContent = 'Authentication failed. Please try again.';
    }
}

/**
 * Load both APIs after authentication
 */
function loadAPIs() {
    console.log('Loading APIs...');
    Promise.all([
        gapi.client.load('sheets', 'v4'),
        gapi.client.load('drive', 'v3')
    ]).then(() => {
        console.log('APIs loaded successfully');
    }).catch(error => {
        console.error('Error loading APIs:', error);
    });
}

/**
 * Handle the auth button click
 */
function handleAuthClick() {
    console.log('Auth button clicked');
    
    if (!isAuthorized) {
        if (tokenClient) {
            console.log('Requesting access token...');
            tokenClient.requestAccessToken({
                prompt: 'consent'
            });
        } else {
            console.error('Token client not initialized');
            document.getElementById('auth-message').textContent = 'Authentication not ready. Please try again later.';
        }
    } else {
        console.log('User is already authorized');
    }
}

/**
 * Update UI after successful authentication
 */
function updateUIAfterAuth() {
    console.log('Updating UI after auth');
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('form-section').classList.remove('hidden');
    document.getElementById('form-section').classList.add('animate__fadeIn');
}

/**
 * Initialize the auth process when the page loads
 */
function initAuth() {
    console.log('Initializing auth...');
    
    // Add event listener to the authorize button
    const authorizeButton = document.getElementById('authorize-button');
    if (authorizeButton) {
        authorizeButton.addEventListener('click', handleAuthClick);
        console.log('Auth button event listener added');
    } else {
        console.error('Authorize button not found');
    }
    
    // Load the auth2 library
    gapi.load('client', initClient);
}

// Initialize auth when the page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded, initializing auth...');
    setTimeout(initAuth, 1000); // Slight delay to ensure Google APIs are loaded
});

// Export functions for use in other modules
export { isAuthorized, SHEET_ID, FOLDER_ID };
