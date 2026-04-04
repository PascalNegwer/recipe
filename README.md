# 🍳 Recipe Manager with Dropbox

A Vue.js application that allows you to store and manage recipes as JSON files on Dropbox. Features OAuth 2.0 authentication, offline caching, and automatic syncing.

## ✨ Features

- 🔐 Secure OAuth 2.0 authentication with Dropbox
- 📱 Responsive design for mobile and desktop
- 🔄 Smart syncing (24-hour intervals + on-demand)
- 🏷️ Recipe tagging and search
- 💾 Local caching for offline access
- 🚀 Deployable to GitHub Pages

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js 18+ and npm
- OR Docker and Docker Compose

### Local Development
```bash
# Clone the repository
git clone https://github.com/yourusername/recipe.git
cd recipe

# Install dependencies
npm install

# Start development server
npm run dev
```

### Docker Development
```bash
# Build and run with Docker
docker compose up
```

## 🔧 Dropbox Setup

### 1. Create Dropbox App
1. Visit [Dropbox Developers](https://www.dropbox.com/developers/apps)
2. Click "Create app"
3. Choose "Scoped app" → "Full Dropbox"
4. Name your app (e.g., "Recipe Manager")
5. Click "Create app"

### 2. Configure Permissions
In your app settings:
- Go to **Permissions** tab
- Enable: `files.content.read`, `files.content.write`, `files.metadata.read`

### 3. Set Redirect URI
In **Settings** tab:
- Add redirect URI: `https://yourusername.github.io/recipe/oauth/callback`
- Replace `yourusername` with your GitHub username

### 4. Get App Key
- Copy your **App key** from the Settings tab
- This is your `CLIENT_ID`

## 🌐 GitHub Pages Deployment

### Automatic Deployment (Recommended)
1. Push your code to GitHub
2. Go to your repo → **Settings** → **Pages**
3. Set source to "GitHub Actions"
4. The workflow will automatically deploy on pushes to `main`

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy to gh-pages branch
npm run deploy
```

## 📱 Usage

1. **First Visit**: Enter your Dropbox App Key
2. **Authentication**: Click "Connect to Dropbox" → Authorize the app
3. **Add Recipes**: Fill in name, ingredients, instructions, and tags
4. **Search & Filter**: Use the search bar or click tags to filter
5. **Sync**: Click "Sync with Dropbox" for manual full sync

## 🏗️ Project Structure

```
src/
├── composables/
│   └── useDropboxAPI.js    # Dropbox OAuth & API calls
├── stores/
│   └── recipes.js          # Pinia store for state management
├── App.vue                 # Main application component
└── main.js                 # Vue app entry point

.github/
└── workflows/
    └── deploy.yml         # GitHub Actions deployment
```

## 🔒 Security

- **No credentials in code**: App Key stored locally in browser
- **OAuth 2.0 + PKCE**: Secure authentication flow
- **Scoped permissions**: Only necessary Dropbox access
- **HTTPS only**: GitHub Pages enforces SSL

## 🛠️ Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Environment Variables
Create `.env.local` for development:
```bash
# Optional: Override default Vite config
VITE_APP_TITLE="My Recipe Manager"
```

## 🙏 Acknowledgments

- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Dropbox API](https://www.dropbox.com/developers/documentation) - File storage API
- [Pinia](https://pinia.vuejs.org/) - Vue state management
- [Vite](https://vitejs.dev/) - Fast build tool
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