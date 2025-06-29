# Deploying Scriptor Umbra AI to Vercel

## Important Notes

1. **API Keys Security**: 
   - API keys are stored in browser's localStorage (not encrypted like in Electron version)
   - Users must add their own API keys through the UI
   - Never commit API keys to the repository

2. **Deployment Steps**:
   ```bash
   # Install dependencies
   npm install

   # Build the project
   npm run build:renderer

   # Deploy to Vercel
   vercel

   # Or for production deployment
   vercel --prod
   ```

3. **Environment Variables**:
   - No environment variables needed for Vercel deployment
   - All API keys are managed client-side

4. **Features in Web Version**:
   - ✅ All AI providers (OpenAI, Claude, DeepSeek, Llama, Gemini)
   - ✅ Conversation management
   - ✅ Author style selection
   - ❌ Desktop menu bar functionality
   - ❌ Encrypted storage (uses browser localStorage)

5. **CORS Considerations**:
   - The app makes direct API calls from the browser
   - Some AI providers may have CORS restrictions
   - If you encounter CORS issues, you may need to set up a proxy server

## Vercel Configuration

The project includes:
- `vercel.json` - Configures static build and routing
- `vercel-build` script in package.json - Builds the web version

## After Deployment

1. Visit your Vercel URL
2. Go to "API Keys" section
3. Add your AI provider API keys
4. Start using Scriptor Umbra AI in your browser!