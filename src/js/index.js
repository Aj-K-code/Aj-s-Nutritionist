// Import CSS
import '../css/styles.css';

// Import JS modules
import './auth.js';
import './app.js';

// Log initialization
console.log('Food Tracker initialized');

// Add debugging information
console.log('Environment variables loaded:');
console.log('CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('API_KEY exists:', !!process.env.GOOGLE_API_KEY);
console.log('SHEET_ID exists:', !!process.env.GOOGLE_SHEET_ID);
console.log('FOLDER_ID exists:', !!process.env.GOOGLE_FOLDER_ID);
