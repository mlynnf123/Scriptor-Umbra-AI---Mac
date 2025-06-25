# Scriptor Umbra AI - Development Environment

A comprehensive development package for the Scriptor Umbra AI desktop application built with Electron.

## 🚀 Quick Start

### Prerequisites
- Node.js 16 or higher
- npm or yarn
- Git (optional)

### Setup
1. Extract this development package
2. Open terminal in the project directory
3. Run the setup script:
   ```bash
   ./setup-dev.sh
   ```
   Or manually:
   ```bash
   npm install
   npm run build:dev
   ```

### Development
```bash
npm run dev          # Start in development mode
npm run watch        # Watch files and auto-rebuild
```

### Building
```bash
npm run build        # Production build
npm run dist:mac     # macOS distribution
npm run dist:win     # Windows distribution
npm run dist:linux   # Linux distribution
```

## 📁 Project Structure

```
scriptor-umbra-dev/
├── src/                    # Source code
│   ├── js/                # JavaScript modules
│   │   ├── app.js         # Main application logic
│   │   ├── chat.js        # Chat functionality (FIXED)
│   │   ├── dashboard.js   # Dashboard features
│   │   ├── api-keys.js    # API key management
│   │   ├── conversations.js # Conversation handling
│   │   └── settings.js    # Application settings
│   ├── css/               # Stylesheets
│   │   ├── styles.css     # Main styles
│   │   └── components.css # Component styles
│   └── index.html         # Main HTML template
├── assets/                # Static assets
│   ├── icon.png          # App icon (PNG)
│   ├── icon.icns         # macOS icon
│   ├── icon.ico          # Windows icon
│   └── dmg-background.png # DMG installer background
├── scripts/               # Build scripts
│   ├── build-mac.sh      # macOS build script
│   ├── build-win.bat     # Windows build script
│   └── build-linux.sh    # Linux build script
├── .vscode/               # VS Code configuration
│   ├── settings.json     # Editor settings
│   ├── launch.json       # Debug configuration
│   ├── tasks.json        # Build tasks
│   └── extensions.json   # Recommended extensions
├── build/                 # Build output (generated)
├── dist/                  # Distribution packages (generated)
├── main.js               # Electron main process
├── preload.js            # Preload script
├── package.json          # Dependencies and scripts
├── webpack.config.js     # Webpack configuration
├── .eslintrc.json        # ESLint configuration
├── .babelrc              # Babel configuration
└── setup-dev.sh          # Development setup script
```

## 🛠️ Development Tools

### VS Code Integration
This project includes comprehensive VS Code configuration:

- **Settings**: Optimized editor settings for JavaScript development
- **Tasks**: Pre-configured build and development tasks
- **Launch**: Debug configurations for main and renderer processes
- **Extensions**: Recommended extensions for optimal development experience

#### Recommended VS Code Extensions
- ESLint - Code linting
- Prettier - Code formatting
- Path Intellisense - File path autocompletion
- Auto Rename Tag - HTML tag renaming
- JavaScript Debugger - Enhanced debugging

### Available NPM Scripts

#### Development
- `npm start` - Start the application
- `npm run dev` - Start in development mode with debugging
- `npm run watch` - Watch files and auto-rebuild

#### Building
- `npm run build` - Production build
- `npm run build:dev` - Development build
- `npm run build:main` - Build main process only
- `npm run build:renderer` - Build renderer process only

#### Distribution
- `npm run pack` - Package app (no installer)
- `npm run dist` - Create distribution for current platform
- `npm run dist:mac` - Create macOS DMG and ZIP
- `npm run dist:win` - Create Windows NSIS installer and ZIP
- `npm run dist:linux` - Create Linux AppImage and DEB

#### Quality Assurance
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run test` - Run tests
- `npm run clean` - Clean build directories

#### Utilities
- `npm run asar:pack` - Pack source into ASAR archive
- `npm run asar:extract` - Extract ASAR archive
- `npm run icon:generate` - Generate icons from PNG source

## 🔧 Configuration Files

### Webpack Configuration
- `webpack.config.js` - Renderer process bundling
- `webpack.main.config.js` - Main process bundling

### Code Quality
- `.eslintrc.json` - ESLint rules and configuration
- `.babelrc` - Babel transpilation settings

### Build Configuration
- `package.json` - Contains electron-builder configuration
- Platform-specific build settings for macOS, Windows, and Linux

## 🐛 Debugging

### VS Code Debugging
1. Open the project in VS Code
2. Set breakpoints in your code
3. Press F5 or use "Debug Main Process" configuration
4. For renderer debugging, use "Debug Renderer Process"

### Console Debugging
- Main process logs appear in terminal
- Renderer process logs appear in DevTools (Ctrl+Shift+I)

## 📦 Building Distributions

### macOS
```bash
npm run dist:mac
```
Creates:
- DMG installer with drag-to-Applications
- ZIP archive for direct installation

### Windows
```bash
npm run dist:win
```
Creates:
- NSIS installer (.exe)
- ZIP archive for portable use

### Linux
```bash
npm run dist:linux
```
Creates:
- AppImage for universal compatibility
- DEB package for Debian/Ubuntu

## 🔍 Key Features Fixed

### Chat Functionality
The main issue with the chat button not working has been resolved:

- **Root Cause**: DOM timing issues with event listener attachment
- **Solution**: Improved initialization with proper DOM ready state checking
- **Result**: Send button and Enter key now work reliably

### Code Improvements
- Removed hardcoded API keys and development artifacts
- Enhanced error handling and logging
- Improved event listener robustness
- Better initialization timing

## 🚀 Deployment

### Development Deployment
1. Make changes to source files
2. Run `npm run watch` for auto-rebuilding
3. Test with `npm run dev`

### Production Deployment
1. Run `npm run build` to create production build
2. Run `npm run dist:mac` (or appropriate platform)
3. Test the generated installer
4. Distribute the installer files

## 📝 Development Notes

### Adding New Features
1. Create new modules in `src/js/`
2. Add styles in `src/css/`
3. Update `webpack.config.js` entry points if needed
4. Test with `npm run dev`

### Modifying UI
- Main HTML structure: `src/index.html`
- Styles: `src/css/styles.css` and `src/css/components.css`
- JavaScript: Individual modules in `src/js/`

### API Integration
- API key management: `src/js/api-keys.js`
- Chat functionality: `src/js/chat.js`
- Add new providers by extending the chat module

## 🔒 Security Notes

- API keys are stored securely using electron-store
- No hardcoded credentials in source code
- Preload script provides secure IPC communication
- CSP headers recommended for production

## 📞 Support

For development questions or issues:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure Node.js version compatibility
4. Check VS Code problems panel for linting issues

## 📄 License

MIT License - See package.json for details
