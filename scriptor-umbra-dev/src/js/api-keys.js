// API Keys Management
class ApiKeysManager {
    constructor() {
        this.providers = {
            openai: {
                name: 'OpenAI',
                baseUrl: 'https://api.openai.com/v1',
                testEndpoint: '/models',
                headers: (key) => ({
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                })
            },
            claude: {
                name: 'Anthropic Claude',
                baseUrl: 'https://api.anthropic.com/v1',
                testEndpoint: '/messages',
                headers: (key) => ({
                    'x-api-key': key,
                    'Content-Type': 'application/json',
                    'anthropic-version': '2023-06-01'
                })
            },
            deepseek: {
                name: 'DeepSeek',
                baseUrl: 'https://api.deepseek.com/v1',
                testEndpoint: '/models',
                headers: (key) => ({
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                })
            },
            llama: {
                name: 'Meta Llama',
                baseUrl: 'https://api-inference.huggingface.co/models',
                testEndpoint: '/meta-llama/Llama-2-7b-chat-hf',
                headers: (key) => ({
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                })
            },
            gemini: {
                name: 'Google Gemini',
                baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
                testEndpoint: '/models',
                headers: (key) => ({
                    'Content-Type': 'application/json'
                }),
                keyParam: 'key'
            }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Toggle password visibility
        document.querySelectorAll('.toggle-visibility').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetId = button.dataset.target;
                const input = document.getElementById(targetId);
                const icon = button.querySelector('i');

                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        });

        // Save API keys
        document.querySelectorAll('.btn-save').forEach(button => {
            button.addEventListener('click', async (e) => {
                const provider = button.dataset.provider;
                await this.saveApiKey(provider);
            });
        });

        // Test API connections
        document.querySelectorAll('.btn-test').forEach(button => {
            button.addEventListener('click', async (e) => {
                const provider = button.dataset.provider;
                await this.testApiKey(provider);
            });
        });

        // Auto-save on input change
        document.querySelectorAll('.api-key-input').forEach(input => {
            input.addEventListener('blur', async (e) => {
                const provider = input.id.replace('-key', '');
                await this.saveApiKey(provider);
            });
        });
    }

    async saveApiKey(provider) {
        const input = document.getElementById(`${provider}-key`);
        const key = input.value.trim();

        try {
            // Get current API keys
            const apiKeys = await window.electronAPI.apiKeys.get() || {};
            
            if (key) {
                apiKeys[provider] = key;
                this.updateProviderStatus(provider, 'connected');
            } else {
                delete apiKeys[provider];
                this.updateProviderStatus(provider, 'disconnected');
            }

            // Save to secure storage
            await window.electronAPI.apiKeys.save(apiKeys);
            
            // Update app's apiKeys
            if (window.app) {
                window.app.apiKeys = apiKeys;
            }

            this.showNotification(`${this.providers[provider].name} API key saved successfully`, 'success');
        } catch (error) {
            console.error('Error saving API key:', error);
            this.showNotification('Error saving API key', 'error');
        }
    }

    async testApiKey(provider) {
        const input = document.getElementById(`${provider}-key`);
        const key = input.value.trim();

        if (!key) {
            this.showNotification('Please enter an API key first', 'warning');
            return;
        }

        const button = document.querySelector(`[data-provider="${provider}"].btn-test`);
        const originalText = button.innerHTML;
        
        try {
            // Update UI to show testing state
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
            button.disabled = true;
            this.updateProviderStatus(provider, 'testing');

            // Test the API key
            const isValid = await this.performApiTest(provider, key);

            if (isValid) {
                this.updateProviderStatus(provider, 'connected');
                this.showNotification(`${this.providers[provider].name} connection successful`, 'success');
            } else {
                this.updateProviderStatus(provider, 'error');
                this.showNotification(`${this.providers[provider].name} connection failed`, 'error');
            }
        } catch (error) {
            console.error('Error testing API key:', error);
            this.updateProviderStatus(provider, 'error');
            this.showNotification(`Error testing ${this.providers[provider].name} connection`, 'error');
        } finally {
            // Restore button state
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    async performApiTest(provider, key) {
        const config = this.providers[provider];
        if (!config) return false;

        try {
            let url = config.baseUrl + config.testEndpoint;
            const headers = config.headers(key);

            // Handle Gemini's query parameter authentication
            if (config.keyParam) {
                url += `?${config.keyParam}=${key}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
                timeout: 10000
            });

            // Different providers have different success criteria
            switch (provider) {
                case 'openai':
                case 'deepseek':
                    return response.status === 200;
                
                case 'claude':
                    // Claude's test endpoint might return 400 for GET, but 401 for invalid key
                    return response.status !== 401 && response.status !== 403;
                
                case 'llama':
                    // Hugging Face returns 200 for valid tokens
                    return response.status === 200;
                
                case 'gemini':
                    return response.status === 200;
                
                default:
                    return response.status === 200;
            }
        } catch (error) {
            console.error(`API test failed for ${provider}:`, error);
            return false;
        }
    }

    updateProviderStatus(provider, status) {
        const statusElement = document.getElementById(`${provider}-status`);
        if (statusElement) {
            const indicator = statusElement.querySelector('.status-indicator');
            if (indicator) {
                indicator.className = `status-indicator ${status}`;
            }
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--background-color);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 1rem;
                    box-shadow: var(--shadow-lg);
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    min-width: 300px;
                    animation: slideInRight 0.3s ease;
                }
                
                .notification-success { border-left: 4px solid var(--success-color); }
                .notification-error { border-left: 4px solid var(--danger-color); }
                .notification-warning { border-left: 4px solid var(--warning-color); }
                .notification-info { border-left: 4px solid var(--primary-color); }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    flex: 1;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: 0.25rem;
                }
                
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        // Add to page
        document.body.appendChild(notification);

        // Handle close button
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }
}

// Initialize API Keys Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.apiKeysManager = new ApiKeysManager();
});

