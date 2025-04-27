# Food Tracker

A modern, polished web application that allows authenticated users to track their meals with photos and descriptions. The app uses Google OAuth for authentication and stores data in Google Sheets and Google Drive.

## Features

- **Google OAuth Authentication**: Only authorized users can submit entries
- **Image Upload**: Food photos are stored in Google Drive
- **Data Storage**: Meal details are saved in Google Sheets
- **Modern UI**: Clean, responsive design with animations
- **GitHub Pages Ready**: Easy to deploy on GitHub Pages with GitHub Actions
- **Secure**: Uses GitHub Secrets for sensitive information

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on "Select a project" at the top of the page, then click "New Project"
3. Enter a project name and click "Create"
4. Once created, select your new project from the project selector

### 2. Enable Required APIs

1. In your Google Cloud project, go to "APIs & Services" > "Library"
2. Search for and enable the following APIs:
   - Google Sheets API
   - Google Drive API

### 3. Create OAuth Credentials

1. In your Google Cloud project, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. If prompted to configure the consent screen, click "Configure Consent Screen"
   - Select "External" user type (unless you have a Google Workspace)
   - Fill in the required information (App name, User support email, Developer contact information)
   - Add the necessary scopes:
     - `https://www.googleapis.com/auth/spreadsheets`
     - `https://www.googleapis.com/auth/drive.file`
   - Add test users (your email and any other users who need access)
   - Complete the consent screen setup
4. Return to "Credentials" and click "Create Credentials" > "OAuth client ID"
5. Set the application type to "Web application"
6. Add authorized JavaScript origins:
   - For local testing: `http://localhost:8080`
   - For GitHub Pages: `https://yourusername.github.io`
7. Add authorized redirect URIs:
   - For local testing: `http://localhost:8080`
   - For GitHub Pages: `https://yourusername.github.io/food-tracker`
8. Click "Create"
9. You will see a popup with your **Client ID** and **Client Secret**. Save these values.

### 4. Create API Key

1. In your Google Cloud project, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Your **API Key** will be displayed. Save this value.
4. (Optional but recommended) Click "Restrict Key" to limit which APIs can use this key

### 5. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/) and create a new spreadsheet
2. Rename the first sheet to "Sheet1"
3. Add the following headers in the first row:
   - Timestamp
   - Food Name
   - Description
   - Meal Time
   - Image URL
4. Note the **Sheet ID** from the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`

### 6. Create a Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/) and create a new folder for food images
2. Right-click on the folder and select "Get link"
3. The link will look like: `https://drive.google.com/drive/folders/FOLDER_ID`
4. Extract the **Folder ID** from this URL

### 7. Set Up GitHub Repository and Secrets

1. Create a new GitHub repository
2. Push the code to the repository
3. Go to repository settings > Secrets and variables > Actions
4. Add the following repository secrets:
   - `GOOGLE_CLIENT_ID`: Your OAuth client ID (from step 3)
   - `GOOGLE_CLIENT_SECRET`: Your OAuth client secret (from step 3)
   - `GOOGLE_API_KEY`: Your API key (from step 4)
   - `GOOGLE_SHEET_ID`: Your Google Sheet ID (from step 5)
   - `GOOGLE_FOLDER_ID`: Your Google Drive folder ID (from step 6)

### 8. Deploy to GitHub Pages

The repository includes a GitHub Actions workflow that will automatically build and deploy the site to GitHub Pages when you push to the main branch.

1. Push your code to the main branch
2. GitHub Actions will build the project and deploy it to the gh-pages branch
3. Go to repository settings > Pages
4. Set the source to "Deploy from a branch" and select the "gh-pages" branch
5. Your site will be published at `https://yourusername.github.io/repository-name`

## Local Development

To test the application locally:

1. Create a `.env` file in the project root with the following variables:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_API_KEY=your_api_key
   GOOGLE_SHEET_ID=your_sheet_id
   GOOGLE_FOLDER_ID=your_folder_id
   ```

2. Install dependencies and start the development server:
   ```bash
   npm install
   npm start
   ```

3. Visit `http://localhost:8080` in your browser

## Project Structure

```
food-tracker/
├── .github/
│   └── workflows/
│       └── deploy.yml    # GitHub Actions workflow
├── src/
│   ├── css/
│   │   └── styles.css    # Application styles
│   ├── js/
│   │   ├── app.js        # Main application logic
│   │   ├── auth.js       # Google OAuth authentication
│   │   └── index.js      # Entry point for webpack
│   ├── images/           # Static images
│   └── index.html        # Main HTML file
├── .gitignore
├── package.json          # NPM dependencies and scripts
├── webpack.config.js     # Webpack configuration
└── README.md             # Documentation
```

## License

MIT

## Credits

Created with ❤️ using modern web technologies.
