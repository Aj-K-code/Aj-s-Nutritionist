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
    // Initialize the tokenClient with proper configuration
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        prompt: 'consent',
        callback: (tokenResponse) => {
            if (tokenResponse && !tokenResponse.error) {
                isAuthorized = true;
                updateUIAfterAuth();
                // Load the API clients after successful authentication
                loadSheetsAPI();
                loadDriveAPI();
            } else {
                isAuthorized = false;
                console.error('Error authenticating:', tokenResponse ? tokenResponse.error : 'No response');
                document.getElementById('auth-message').textContent = 'Authentication failed. Please try again.';
            }
        }
    });

    // Initialize the API client
    gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: DISCOVERY_DOCS
    }).then(() => {
        // Check if user is already signed in
        const token = gapi.client.getToken();
        if (token) {
            isAuthorized = true;
            updateUIAfterAuth();
            loadSheetsAPI();
            loadDriveAPI();
        }
    }).catch(error => {
        console.error('Error initializing GAPI client:', error);
        document.getElementById('auth-message').textContent = 'Failed to initialize Google API. Please try again later.';
    });
}

/**
 * Exchange authorization code for tokens
 * This uses the client secret which should only be used server-side
 * For GitHub Pages, this would typically be handled by a separate backend
 */
function exchangeCodeForToken(code) {
    // Note: In a production environment, this should be done server-side
    // This is a simplified example for demonstration purposes
    const tokenEndpoint = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('redirect_uri', window.location.origin + window.location.pathname);
    params.append('grant_type', 'authorization_code');

    return fetch(tokenEndpoint, {
        method: 'POST',
        body: params
    })
    .then(response => response.json())
    .then(data => {
        if (data.access_token) {
            gapi.client.setToken({
                access_token: data.access_token
            });
            isAuthorized = true;
            updateUIAfterAuth();
            loadSheetsAPI();
            loadDriveAPI();
            return data;
        } else {
            throw new Error('Failed to exchange code for token');
        }
    });
}

/**
 * Load the Google Sheets API
 */
function loadSheetsAPI() {
    return gapi.client.load('sheets', 'v4');
}

/**
 * Load the Google Drive API
 */
function loadDriveAPI() {
    return gapi.client.load('drive', 'v3');
}

/**
 * Handle the auth button click
 */
function handleAuthClick() {
    if (!isAuthorized) {
        // Request access token with proper configuration
        tokenClient.requestAccessToken({
            prompt: 'consent',
            hint: '',
            state: 'food-tracker-auth'
        });
    }
}

/**
 * Check for authorization code in URL after redirect
 */
function checkAuthCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        // Remove the code from the URL to prevent issues on refresh
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
        
        // Show loading state
        document.getElementById('auth-message').textContent = 'Completing authentication...';
        
        // Exchange the code for tokens
        exchangeCodeForToken(code)
            .catch(error => {
                console.error('Error exchanging code for token:', error);
                document.getElementById('auth-message').textContent = 'Authentication failed. Please try again.';
            });
    }
}

/**
 * Update UI after successful authentication
 */
function updateUIAfterAuth() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('form-section').classList.remove('hidden');
    document.getElementById('form-section').classList.add('animate__fadeIn');
}

/**
 * Initialize the auth process when the page loads
 */
function initAuth() {
    document.getElementById('authorize-button').addEventListener('click', handleAuthClick);
    
    // Check for auth code in URL (after redirect)
    checkAuthCode();
    
    // Load the auth2 library
    gapi.load('client:auth2', initClient);
}

// Initialize auth when the page loads
window.addEventListener('load', initAuth);
