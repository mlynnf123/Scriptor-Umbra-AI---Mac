# Deploying Scriptor Umbra AI to Railway

## Overview
This guide helps you deploy Scriptor Umbra AI as a web application on Railway.

## Prerequisites
- Railway account (https://railway.app)
- GitHub account (for easy deployment)
- Node.js installed locally

## Deployment Methods

### Method 1: Deploy from GitHub (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Connect to Railway**:
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will automatically detect the configuration

### Method 2: Deploy from CLI

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**:
   ```bash
   # Login to Railway
   railway login

   # Initialize new project
   railway init

   # Deploy
   railway up
   ```

## Environment Variables

While the app stores API keys client-side, you can optionally set these in Railway:
- `PORT` - Auto-set by Railway
- `NODE_ENV` - Set to "production"

## Build Configuration

The project includes:
- `railway.json` - Railway-specific configuration
- `server.js` - Express server for Railway
- Build command: `npm run build:renderer`
- Start command: `node server.js`

## Post-Deployment

1. **Access Your App**:
   - Railway will provide a URL like `https://your-app.railway.app`

2. **Configure API Keys**:
   - Visit your deployed app
   - Go to "API Keys" section
   - Add your AI provider API keys
   - Keys are stored in browser localStorage

## Features in Web Version

✅ **Supported**:
- All AI providers (OpenAI, Claude, DeepSeek, Llama, Gemini)
- Conversation management
- Author style selection
- Web-based storage

❌ **Not Supported**:
- Desktop menu bar
- Encrypted storage (uses localStorage)
- Native file system access

## Troubleshooting

1. **Build Fails**:
   ```bash
   # Ensure dependencies are installed
   npm install
   
   # Build locally to test
   npm run build:renderer
   ```

2. **App Not Loading**:
   - Check Railway logs
   - Ensure build directory exists
   - Verify server.js is running

3. **CORS Issues**:
   - Some AI APIs may have CORS restrictions
   - Consider using a proxy server if needed

## Security Notes

- API keys are stored in browser localStorage
- Users must provide their own API keys
- Never commit API keys to the repository
- Consider implementing additional security measures for production use

## Monitoring

Railway provides:
- Automatic HTTPS
- Deploy logs
- Runtime logs
- Resource usage metrics

Access these in your Railway dashboard.