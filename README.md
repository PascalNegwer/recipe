# Vue.js Recipe Manager with Google Drive

This is a Vue.js application that allows you to store and manage recipes as JSON files on Google Drive.

## Prerequisites

- Docker and Docker Compose installed on your system.
- A Google Cloud project with Google Drive API enabled.

## Setup Google Drive API

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Enable the Google Drive API.
4. Create OAuth 2.0 credentials (Client ID for web application).
5. Add your domain (e.g., `http://localhost:5173`) to authorized origins.
6. Create an API key.

## Configuration

Update `src/App.vue` with your actual `CLIENT_ID` and `API_KEY`:

```javascript
const CLIENT_ID = 'your-client-id.apps.googleusercontent.com'
const API_KEY = 'your-api-key'
```

## Getting Started

1. Clone or navigate to the project directory.

2. Build and run the application:
   ```
   docker-compose up
   ```

3. Open your browser and navigate to `http://localhost:5173`.

4. Sign in with your Google account to access Google Drive.

## Features

- Add new recipes with name, ingredients, and instructions.
- Save recipes as JSON files to Google Drive.
- Load and view existing recipes from Google Drive.

## Building for Production

To build the project for production:
```
docker-compose exec vue-app npm run build
```

## Project Structure

- `src/App.vue`: Main Vue component with recipe management
- `src/main.js`: Application entry point
- `package.json`: Dependencies and scripts
- `vite.config.js`: Vite configuration
- `Dockerfile`: Docker image definition
- `docker-compose.yml`: Docker Compose configuration