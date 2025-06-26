// Dashboard functionality
document.addEventListener('DOMContentLoaded', () => {
    // Dashboard is handled by the main app
});

// Conversations functionality  
document.addEventListener('DOMContentLoaded', () => {
    // Export conversations
    document.getElementById('exportConversations').addEventListener('click', async () => {
        try {
            // For web version, implement a simple download
            const conversations = await window.electronAPI.store.get('conversations') || [];
            const dataStr = JSON.stringify(conversations, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `scriptor-umbra-conversations-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
            const result = { success: true };
            if (result.success) {
                window.apiKeysManager?.showNotification('Conversations exported successfully', 'success');
            } else {
                window.apiKeysManager?.showNotification('Export cancelled', 'info');
            }
        } catch (error) {
            console.error('Export error:', error);
            window.apiKeysManager?.showNotification('Error exporting conversations', 'error');
        }
    });

    // Import conversations
    document.getElementById('importConversations').addEventListener('click', async () => {
        try {
            // For web version, implement file input
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const text = await file.text();
                    const conversations = JSON.parse(text);
                    await window.electronAPI.store.set('conversations', conversations);
                    const result = { success: true, count: conversations.length };
                    
                    if (result.success) {
                        window.apiKeysManager?.showNotification(`Imported ${result.count} conversations`, 'success');
                        // Refresh conversations view
                        if (window.app) {
                            await window.app.loadData();
                            window.app.loadConversationsData();
                        }
                    }
                }
            };
            input.click();
        } catch (error) {
            console.error('Import error:', error);
            window.apiKeysManager?.showNotification('Error importing conversations', 'error');
        }
    });
});

// Settings functionality
document.addEventListener('DOMContentLoaded', () => {
    // Save settings on change
    const settingsInputs = ['theme-select', 'default-provider', 'auto-save', 'notifications', 'sound-effects'];
    
    settingsInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', async () => {
                if (window.app) {
                    await window.app.saveSettings();
                }
            });
        }
    });

    // Clear all data
    document.getElementById('clearAllData').addEventListener('click', async () => {
        const confirmed = confirm(
            'Are you sure you want to clear all data? This will delete all conversations, API keys, and settings. This action cannot be undone.'
        );
        
        if (confirmed) {
            try {
                await window.electronAPI.store.clear();
                window.apiKeysManager?.showNotification('All data cleared successfully', 'success');
                
                // Reset app state
                if (window.app) {
                    window.app.apiKeys = {};
                    window.app.conversations = [];
                    window.app.preferences = {
                        theme: 'light',
                        defaultProvider: 'openai',
                        autoSave: true,
                        notifications: true
                    };
                    window.app.currentConversation = null;
                    
                    // Refresh all views
                    window.app.loadSettingsData();
                    window.app.loadApiKeysData();
                    window.app.loadConversationsData();
                    window.app.loadDashboardData();
                    window.app.createNewConversation();
                }
            } catch (error) {
                console.error('Error clearing data:', error);
                window.apiKeysManager?.showNotification('Error clearing data', 'error');
            }
        }
    });
});

// Add saveSettings method to app
if (window.app) {
    window.app.saveSettings = async function() {
        this.preferences = {
            theme: document.getElementById('theme-select').value,
            defaultProvider: document.getElementById('default-provider').value,
            autoSave: document.getElementById('auto-save').checked,
            notifications: document.getElementById('notifications').checked,
            soundEffects: document.getElementById('sound-effects').checked
        };
        
        await window.electronAPI.preferences.save(this.preferences);
        this.applyTheme();
    };
}

