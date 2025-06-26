// Import CSS files
import '../css/styles.css';
import '../css/components.css';

// Main Application Logic
class ScriptorUmbraApp {
    constructor() {
        this.currentView = 'chat';
        this.apiKeys = {};
        this.preferences = {};
        this.conversations = [];
        this.currentConversation = null;
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.setupEventListeners();
        this.setupNavigation();
        this.applyTheme();
        this.showView('chat');
    }

    async loadData() {
        try {
            this.apiKeys = await window.electronAPI.store.get('apiKeys') || {};
            this.preferences = await window.electronAPI.store.get('preferences') || {
                theme: 'light',
                defaultProvider: 'openai',
                autoSave: true,
                notifications: true
            };
            this.conversations = await window.electronAPI.store.get('conversations') || [];
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                this.showView(view);
            });
        });

        // New conversation button
        document.getElementById('newConversationBtn').addEventListener('click', () => {
            this.createNewConversation();
        });

        // Theme change
        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.changeTheme(e.target.value);
        });

        // Preferences menu listener (web compatible)
        if (window.electronAPI && window.electronAPI.onShowPreferences) {
            window.electronAPI.onShowPreferences(() => {
                this.showView('settings');
            });
        }
    }

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    showView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
            this.currentView = viewName;

            // Update navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.view === viewName) {
                    item.classList.add('active');
                }
            });

            // Load view-specific data
            this.loadViewData(viewName);
        }
    }

    async loadViewData(viewName) {
        switch (viewName) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'api-keys':
                await this.loadApiKeysData();
                break;
            case 'conversations':
                await this.loadConversationsData();
                break;
            case 'settings':
                await this.loadSettingsData();
                break;
        }
    }

    async loadDashboardData() {
        // Update dashboard statistics
        document.getElementById('totalConversations').textContent = this.conversations.length;
        
        const totalWords = this.conversations.reduce((total, conv) => {
            return total + (conv.messages || []).reduce((msgTotal, msg) => {
                return msgTotal + (msg.content ? msg.content.split(' ').length : 0);
            }, 0);
        }, 0);
        document.getElementById('wordsGenerated').textContent = totalWords.toLocaleString();

        // API calls today (mock data for now)
        document.getElementById('apiCallsToday').textContent = Math.floor(Math.random() * 50);

        // Favorite provider
        const providerCounts = {};
        this.conversations.forEach(conv => {
            const provider = conv.provider || 'openai';
            providerCounts[provider] = (providerCounts[provider] || 0) + 1;
        });
        
        const favoriteProvider = Object.keys(providerCounts).reduce((a, b) => 
            providerCounts[a] > providerCounts[b] ? a : b, 'OpenAI'
        );
        document.getElementById('favoriteProvider').textContent = this.capitalizeFirst(favoriteProvider);

        // Load recent conversations
        this.loadRecentConversations();
    }

    loadRecentConversations() {
        const container = document.getElementById('recentConversationsList');
        const recent = this.conversations.slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <h3>No conversations yet</h3>
                    <p>Start a new conversation to see your recent chats here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recent.map(conv => `
            <div class="conversation-item" data-id="${conv.id}">
                <div class="conversation-info">
                    <h4>${conv.title || 'Untitled Conversation'}</h4>
                    <p>${this.formatDate(conv.updatedAt || conv.createdAt)}</p>
                </div>
                <div class="conversation-actions">
                    <button class="btn btn-secondary" onclick="app.loadConversation('${conv.id}')">
                        <i class="fas fa-eye"></i>
                        Open
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadApiKeysData() {
        // Populate API key fields
        Object.keys(this.apiKeys).forEach(provider => {
            const input = document.getElementById(`${provider}-key`);
            if (input) {
                input.value = this.apiKeys[provider] || '';
                this.updateProviderStatus(provider, this.apiKeys[provider] ? 'connected' : 'disconnected');
            }
        });
    }

    async loadConversationsData() {
        const container = document.getElementById('conversationsContainer');
        
        if (this.conversations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h3>No conversations found</h3>
                    <p>Your conversation history will appear here once you start chatting.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.conversations.map(conv => `
            <div class="conversation-item" data-id="${conv.id}">
                <div class="conversation-info">
                    <h4>${conv.title || 'Untitled Conversation'}</h4>
                    <p>${this.formatDate(conv.updatedAt || conv.createdAt)} • ${conv.messages?.length || 0} messages</p>
                </div>
                <div class="conversation-actions">
                    <button class="btn btn-secondary" onclick="app.loadConversation('${conv.id}')">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                    <button class="btn btn-danger" onclick="app.deleteConversation('${conv.id}')">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadSettingsData() {
        // Populate settings form
        document.getElementById('theme-select').value = this.preferences.theme || 'light';
        document.getElementById('default-provider').value = this.preferences.defaultProvider || 'openai';
        document.getElementById('auto-save').checked = this.preferences.autoSave !== false;
        document.getElementById('notifications').checked = this.preferences.notifications !== false;
        document.getElementById('sound-effects').checked = this.preferences.soundEffects === true;
    }

    createNewConversation() {
        this.currentConversation = {
            id: this.generateId(),
            title: null,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            provider: this.preferences.defaultProvider || 'openai'
        };
        
        // Clear chat messages
        document.getElementById('chatMessages').innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar">
                    <i class="fas fa-feather-alt"></i>
                </div>
                <div class="message-content">
                    <p>Hello! I'm Scriptor Umbra AI, your intelligent ghostwriting assistant. I specialize in creating articles, books, copywriting, and other long-form content. How can I help you with your writing today?</p>
                    <span class="message-time">Just now</span>
                </div>
            </div>
        `;
        
        this.showView('chat');
    }

    async loadConversation(conversationId) {
        const conversation = this.conversations.find(c => c.id === conversationId);
        if (!conversation) return;

        this.currentConversation = conversation;
        
        // Load messages into chat
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = conversation.messages.map(msg => `
            <div class="message ${msg.role === 'user' ? 'user-message' : 'ai-message'}">
                <div class="message-avatar">
                    <i class="fas fa-${msg.role === 'user' ? 'user' : 'robot'}"></i>
                </div>
                <div class="message-content">
                    <p>${msg.content}</p>
                    <span class="message-time">${this.formatTime(msg.timestamp)}</span>
                </div>
            </div>
        `).join('');

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        this.showView('chat');
    }

    async deleteConversation(conversationId) {
        if (confirm('Are you sure you want to delete this conversation?')) {
            await window.electronAPI.conversations.delete(conversationId);
            this.conversations = this.conversations.filter(c => c.id !== conversationId);
            this.loadConversationsData();
        }
    }

    updateProviderStatus(provider, status) {
        const statusElement = document.getElementById(`${provider}-status`);
        if (statusElement) {
            const indicator = statusElement.querySelector('.status-indicator');
            indicator.className = `status-indicator ${status}`;
        }
    }

    async changeTheme(theme) {
        this.preferences.theme = theme;
        await window.electronAPI.preferences.save(this.preferences);
        this.applyTheme();
    }

    applyTheme() {
        const theme = this.preferences.theme;
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else if (theme === 'light') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            // Auto theme - detect system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
        }
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('hidden');
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Today';
        } else if (diffDays === 2) {
            return 'Yesterday';
        } else if (diffDays <= 7) {
            return `${diffDays - 1} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    createNewConversation() {
        this.currentConversation = {
            id: this.generateId(),
            title: 'New Conversation',
            messages: [],
            provider: 'openai',
            authorStyle: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Clear chat interface
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="message ai-message">
                    <div class="message-avatar">
                        <i class="fas fa-feather-alt"></i>
                    </div>
                    <div class="message-content">
                        <p>Hello! I'm Scriptor Umbra AI, your intelligent ghostwriting assistant. I specialize in creating articles, books, copywriting, and other long-form content. How can I help you with your writing today?</p>
                        <span class="message-time">Just now</span>
                    </div>
                </div>
            `;
        }
        
        // Switch to chat view
        this.showView('chat');
    }
    
    async saveSettings() {
        try {
            // Collect current settings from UI
            const themeSelect = document.getElementById('theme-select');
            const defaultProviderSelect = document.getElementById('default-provider');
            const autoSaveCheck = document.getElementById('auto-save');
            const notificationsCheck = document.getElementById('notifications');
            const soundEffectsCheck = document.getElementById('sound-effects');
            
            this.preferences = {
                theme: themeSelect ? themeSelect.value : 'light',
                defaultProvider: defaultProviderSelect ? defaultProviderSelect.value : 'openai',
                autoSave: autoSaveCheck ? autoSaveCheck.checked : true,
                notifications: notificationsCheck ? notificationsCheck.checked : true,
                soundEffects: soundEffectsCheck ? soundEffectsCheck.checked : false
            };
            
            // Save to storage
            await window.electronAPI.store.set('preferences', this.preferences);
            
            // Apply theme immediately
            this.applyTheme();
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ScriptorUmbraApp();
});

// Handle system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (window.app && window.app.preferences.theme === 'auto') {
        window.app.applyTheme();
    }
});

