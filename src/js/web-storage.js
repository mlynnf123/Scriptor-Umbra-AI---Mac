// Web-compatible storage shim to replace Electron APIs
class WebStorage {
    static get(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Error getting from localStorage:', error);
            return null;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return Promise.resolve();
        } catch (error) {
            console.error('Error setting to localStorage:', error);
            return Promise.reject(error);
        }
    }

    static delete(key) {
        try {
            localStorage.removeItem(key);
            return Promise.resolve();
        } catch (error) {
            console.error('Error deleting from localStorage:', error);
            return Promise.reject(error);
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return Promise.resolve();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return Promise.reject(error);
        }
    }
}

// Create a mock electronAPI for web compatibility
window.electronAPI = {
    store: {
        get: (key) => Promise.resolve(WebStorage.get(key)),
        set: (key, value) => WebStorage.set(key, value),
        delete: (key) => WebStorage.delete(key),
        clear: () => WebStorage.clear()
    },
    onMenuAction: (callback) => {
        // Mock menu actions for web
        console.log('Menu actions not available in web version');
    },
    platform: 'web',
    versions: {
        node: 'N/A',
        chrome: navigator.userAgent,
        electron: 'Web Version'
    }
};