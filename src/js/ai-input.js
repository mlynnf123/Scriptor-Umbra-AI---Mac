// AI Input Component - Vanilla JS version mimicking React component
class AIInputComponent {
    constructor() {
        this.text = '';
        this.model = 'gpt-4';
        this.status = 'ready'; // 'submitted', 'streaming', 'ready', 'error'
        this.models = [
            { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
            { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
            { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'claude' },
            { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'claude' },
            { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'claude' },
            { id: 'gemini-pro', name: 'Gemini Pro', provider: 'gemini' },
            { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'deepseek' },
            { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'deepseek' },
            { id: 'llama-2-70b', name: 'Llama 2 70B', provider: 'llama' },
            { id: 'llama-2-13b', name: 'Llama 2 13B', provider: 'llama' },
        ];
        
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const container = document.querySelector('.chat-input-container');
        if (!container) return;

        container.innerHTML = `
            <div class="ai-input-wrapper">
                <div class="ai-input-main">
                    <textarea 
                        id="aiInputTextarea" 
                        class="ai-input-textarea" 
                        placeholder="Ask me anything..." 
                        rows="1"
                        value="${this.text}"
                    ></textarea>
                </div>
                
                <div class="ai-input-toolbar">
                    <div class="ai-input-tools">
                        <button class="ai-input-button" data-action="attach" title="Attach file">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                        </button>
                        
                        <button class="ai-input-button" data-action="voice" title="Voice input">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                                <line x1="12" x2="12" y1="19" y2="22"/>
                                <line x1="8" x2="16" y1="22" y2="22"/>
                            </svg>
                        </button>
                        
                        <button class="ai-input-button" data-action="search" title="Web search">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                                <path d="M2 12h20"/>
                            </svg>
                            <span>Search</span>
                        </button>
                    </div>
                    
                    <button class="ai-input-submit" id="aiInputSubmit" ${!this.text ? 'disabled' : ''}>
                        ${this.getSubmitButtonContent()}
                    </button>
                </div>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        if (document.querySelector('#ai-input-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ai-input-styles';
        styles.textContent = `
            .ai-input-wrapper {
                border: 1px solid #e5e7eb;
                border-radius: 16px;
                background: white;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                min-height: 60px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                transition: all 0.2s ease;
                margin: 0 auto;
                max-width: 800px;
                width: 100%;
                overflow: visible;
                position: relative;
            }

            .ai-input-wrapper:focus-within {
                border-color: #3b82f6;
                box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.25), 0 0 0 3px rgba(59, 130, 246, 0.1);
                transform: translateY(-1px);
            }

            .ai-input-main {
                flex: 1;
            }

            .ai-input-textarea {
                width: 100%;
                border: none;
                outline: none;
                resize: none;
                font-size: 14px;
                line-height: 1.5;
                font-family: inherit;
                background: transparent;
                min-height: 20px;
                max-height: 200px;
                overflow-y: auto;
                color: #374151;
            }

            .ai-input-textarea::placeholder {
                color: #9ca3af;
            }

            /* Dark theme text color */
            [data-theme="dark"] .ai-input-textarea {
                color: #e5e7eb;
            }

            [data-theme="dark"] .ai-input-textarea::placeholder {
                color: #6b7280;
            }

            .ai-input-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 8px;
            }

            .ai-input-tools {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .ai-input-button {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 6px 8px;
                border: none;
                background: #f3f4f6;
                border-radius: 6px;
                color: #374151;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .ai-input-button:hover {
                background: #e5e7eb;
            }

            .ai-input-button:active {
                transform: scale(0.95);
            }

            .ai-input-button.recording {
                background: #ef4444 !important;
                color: white !important;
                animation: pulse 1.5s infinite;
            }

            .ai-input-button.processing {
                background: #3b82f6 !important;
                color: white !important;
            }

            .ai-input-button.processing svg {
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.7; }
                100% { opacity: 1; }
            }

            .ai-input-submit {
                padding: 8px 16px;
                border: none;
                background: #3b82f6;
                color: white;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 4px;
                min-width: 60px;
                justify-content: center;
            }

            .ai-input-submit:hover:not(:disabled) {
                background: #2563eb;
            }

            .ai-input-submit:disabled {
                background: #d1d5db;
                color: #9ca3af;
                cursor: not-allowed;
            }

            .ai-input-submit:active:not(:disabled) {
                transform: scale(0.95);
            }

            .ai-input-submit.streaming {
                background: #ef4444;
            }

            .ai-input-submit.streaming:hover {
                background: #dc2626;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .ai-input-submit .spinner {
                animation: spin 1s linear infinite;
            }

            [data-theme="dark"] .ai-input-wrapper {
                background: #1f2937;
                border-color: #374151;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
            }

            [data-theme="dark"] .ai-input-wrapper:focus-within {
                border-color: #3b82f6;
                box-shadow: 0 8px 25px -5px rgba(59, 130, 246, 0.4), 0 0 0 3px rgba(59, 130, 246, 0.2);
            }

            [data-theme="dark"] .ai-input-textarea {
                color: #f9fafb;
            }

            [data-theme="dark"] .ai-input-textarea::placeholder {
                color: #6b7280;
            }

            [data-theme="dark"] .ai-input-button {
                background: #374151;
                color: #f9fafb;
            }

            [data-theme="dark"] .ai-input-button:hover {
                background: #4b5563;
            }

            /* Responsive design */
            @media (max-width: 1024px) {
                .ai-input-wrapper {
                    max-width: 700px;
                }
            }

            @media (max-width: 768px) {
                .ai-input-wrapper {
                    max-width: 600px;
                }
            }

            @media (max-width: 640px) {
                .ai-input-wrapper {
                    max-width: 100%;
                    margin: 0 16px;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    setupEventListeners() {
        const textarea = document.getElementById('aiInputTextarea');
        const submitButton = document.getElementById('aiInputSubmit');
        const modelTrigger = document.getElementById('modelSelectTrigger');
        const modelDropdown = document.getElementById('modelDropdown');

        // Textarea events
        if (textarea) {
            textarea.addEventListener('input', (e) => {
                this.text = e.target.value;
                this.autoResize(textarea);
                this.updateSubmitButton();
            });

            textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    this.handleSubmit();
                }
            });

            // Auto-resize on load
            this.autoResize(textarea);
        }

        // Submit button
        if (submitButton) {
            submitButton.addEventListener('click', () => {
                this.handleSubmit();
            });
        }

        // Tool buttons
        document.querySelectorAll('.ai-input-button').forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.action;
                this.handleToolAction(action);
            });
        });
    }

    autoResize(textarea) {
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 200);
        textarea.style.height = newHeight + 'px';
    }

    updateSubmitButton() {
        const submitButton = document.getElementById('aiInputSubmit');
        if (submitButton) {
            submitButton.disabled = !this.text.trim();
            submitButton.innerHTML = this.getSubmitButtonContent();
        }
    }

    updateModelDisplay() {
        const modelValue = document.querySelector('.model-value');
        if (modelValue) {
            modelValue.textContent = this.getModelName(this.model);
        }

        // Update selected state in dropdown
        document.querySelectorAll('.ai-input-model-item').forEach(item => {
            item.classList.toggle('selected', item.dataset.value === this.model);
        });
    }

    getModelName(modelId) {
        const model = this.models.find(m => m.id === modelId);
        return model ? model.name : modelId;
    }

    getSubmitButtonContent() {
        switch (this.status) {
            case 'streaming':
                return `
                    <svg class="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    Stop
                `;
            case 'submitted':
                return `
                    <svg class="spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                `;
            default:
                return `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 2 11 13"/>
                        <path d="M22 2 15 22 11 13 2 9z"/>
                    </svg>
                    Send
                `;
        }
    }

    handleSubmit() {
        console.log('AI Input handleSubmit called with text:', this.text);
        console.log('Status:', this.status);
        console.log('Window chatManager available:', !!window.chatManager);
        
        if (!this.text.trim() || this.status === 'streaming') {
            console.log('Submit blocked: empty text or streaming');
            return;
        }

        // Use the existing chat manager's send functionality
        if (window.chatManager) {
            console.log('Using chat manager to send message');
            
            // Create or get the hidden input and set its value
            let oldInput = document.getElementById('chatInput');
            if (!oldInput) {
                console.log('Creating hidden input element');
                oldInput = document.createElement('textarea');
                oldInput.id = 'chatInput';
                oldInput.style.display = 'none';
                document.body.appendChild(oldInput);
            }
            
            console.log('Setting input value and calling sendMessage');
            oldInput.value = this.text;
            
            // Call sendMessage directly on chat manager
            try {
                window.chatManager.sendMessage();
                console.log('SendMessage called successfully');
            } catch (error) {
                console.error('Error calling sendMessage:', error);
            }
            
            // Clear the new input
            this.text = '';
            const textarea = document.getElementById('aiInputTextarea');
            if (textarea) {
                textarea.value = '';
                this.autoResize(textarea);
                this.updateSubmitButton();
            }
        } else {
            console.error('Chat manager not available, trying alternative approach');
            // Fallback: try to directly call the app's send functionality
            if (window.app && window.app.currentConversation) {
                console.log('Trying direct app approach');
                const message = this.text.trim();
                
                // Add user message to UI manually
                const chatMessages = document.getElementById('chatMessages');
                if (chatMessages) {
                    const messageEl = document.createElement('div');
                    messageEl.className = 'message user-message';
                    messageEl.innerHTML = `
                        <div class="message-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="message-content">
                            <p>${message}</p>
                            <span class="message-time">Just now</span>
                        </div>
                    `;
                    chatMessages.appendChild(messageEl);
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
                
                // Clear input
                this.text = '';
                const textarea = document.getElementById('aiInputTextarea');
                if (textarea) {
                    textarea.value = '';
                    this.autoResize(textarea);
                    this.updateSubmitButton();
                }
                
                console.log('Message added to UI, but no AI response will be generated');
            } else {
                console.error('Neither chat manager nor app available');
            }
        }
    }

    handleToolAction(action) {
        switch (action) {
            case 'attach':
                this.handleFileAttachment();
                break;
            case 'voice':
                this.handleVoiceInput();
                break;
            case 'search':
                this.handleWebSearch();
                break;
        }
    }

    handleFileAttachment() {
        // Create a hidden file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,.md,.pdf,.doc,.docx,.json,.csv,.xml,.log,.yml,.yaml,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.html,.css,.scss,.less,.sql,.sh,.bat,.ps1,.rtf,.odt,.ods,.odp,.xls,.xlsx,.ppt,.pptx';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Check file size (limit to 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    alert('File size must be less than 10MB');
                    return;
                }
                
                this.processAttachedFile(file);
            }
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }

    async processAttachedFile(file) {
        const attachButton = document.querySelector('[data-action="attach"]');
        const originalHTML = attachButton.innerHTML;
        
        try {
            // Show processing state
            attachButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
            `;
            attachButton.classList.add('processing');
            
            const textarea = document.getElementById('aiInputTextarea');
            if (textarea) {
                // Determine file type and create appropriate prompt
                const fileType = file.type || 'unknown';
                const fileExt = file.name.split('.').pop().toLowerCase();
                const fileName = file.name;
                const fileSize = this.formatFileSize(file.size);
                
                let prompt = '';
                
                // Check if it's a text-based file
                const textBasedExtensions = ['txt', 'md', 'json', 'csv', 'xml', 'log', 'yml', 'yaml'];
                const codeExtensions = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt'];
                
                if (textBasedExtensions.includes(fileExt) || codeExtensions.includes(fileExt) || fileType.includes('text/')) {
                    // For text files, read and include content
                    const text = await this.readFileAsText(file);
                    prompt = `I've attached a ${fileExt.toUpperCase()} file for analysis:\n\n**File:** ${fileName} (${fileSize})\n\n**Content:**\n\`\`\`${fileExt}\n${text}\n\`\`\`\n\nPlease analyze this file.`;
                } else if (fileType.includes('image/')) {
                    // For images, just show preview info
                    prompt = `I've attached an image file:\n\n**File:** ${fileName} (${fileSize})\n**Type:** ${fileType}\n\nPlease help me with this image.`;
                } else if (fileExt === 'pdf' || fileType === 'application/pdf') {
                    // For PDFs, show preview info
                    prompt = `I've attached a PDF document:\n\n**File:** ${fileName} (${fileSize})\n\nPlease help me analyze or work with this PDF document.`;
                } else if (fileExt === 'doc' || fileExt === 'docx' || fileType.includes('document')) {
                    // For Word documents
                    prompt = `I've attached a Word document:\n\n**File:** ${fileName} (${fileSize})\n\nPlease help me with this document.`;
                } else {
                    // For other file types
                    prompt = `I've attached a file:\n\n**File:** ${fileName} (${fileSize})\n**Type:** ${fileType || fileExt.toUpperCase() + ' file'}\n\nPlease help me with this file.`;
                }
                
                textarea.value = prompt;
                this.text = prompt;
                this.autoResize(textarea);
                this.updateSubmitButton();
                textarea.focus();
            }
        } catch (error) {
            console.error('Error reading file:', error);
            alert('Error reading file. Please try again.');
        } finally {
            // Restore original button state
            attachButton.innerHTML = originalHTML;
            attachButton.classList.remove('processing');
        }
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    handleVoiceInput() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        const voiceButton = document.querySelector('[data-action="voice"]');
        const originalHTML = voiceButton.innerHTML;
        
        // Show recording state
        voiceButton.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6"/>
                <path d="m9 9 3-3 3 3"/>
                <path d="m9 15 3 3 3-3"/>
            </svg>
        `;
        voiceButton.classList.add('recording');
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const textarea = document.getElementById('aiInputTextarea');
            if (textarea) {
                const currentText = textarea.value;
                const newText = currentText ? currentText + ' ' + transcript : transcript;
                textarea.value = newText;
                this.text = newText;
                this.autoResize(textarea);
                this.updateSubmitButton();
                textarea.focus();
            }
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            alert('Speech recognition failed. Please try again.');
        };
        
        recognition.onend = () => {
            // Restore original button state
            voiceButton.innerHTML = originalHTML;
            voiceButton.classList.remove('recording');
        };
        
        recognition.start();
    }

    handleWebSearch() {
        const textarea = document.getElementById('aiInputTextarea');
        if (textarea) {
            const currentText = textarea.value;
            let searchPrompt;
            
            if (currentText.trim()) {
                searchPrompt = `Search the web for information about: ${currentText}`;
            } else {
                const searchQuery = prompt('What would you like to search for?');
                if (searchQuery) {
                    searchPrompt = `Search the web for information about: ${searchQuery}`;
                } else {
                    return;
                }
            }
            
            textarea.value = searchPrompt;
            this.text = searchPrompt;
            this.autoResize(textarea);
            this.updateSubmitButton();
            textarea.focus();
        }
    }

    setStatus(status) {
        this.status = status;
        this.updateSubmitButton();
        
        const submitButton = document.getElementById('aiInputSubmit');
        if (submitButton) {
            submitButton.classList.toggle('streaming', status === 'streaming');
        }
    }

    async trackModelUsage(provider, model) {
        try {
            // Get current usage stats
            const stats = await window.electronAPI.store.get('usageStats') || {
                totalConversations: 0,
                wordsGenerated: 0,
                apiCallsToday: 0,
                favoriteProvider: 'openai',
                providerUsage: {},
                modelUsage: {},
                lastResetDate: new Date().toDateString()
            };

            // Reset daily stats if needed
            const today = new Date().toDateString();
            if (stats.lastResetDate !== today) {
                stats.apiCallsToday = 0;
                stats.lastResetDate = today;
            }

            // Update provider usage
            if (!stats.providerUsage[provider]) {
                stats.providerUsage[provider] = 0;
            }
            stats.providerUsage[provider]++;

            // Update model usage
            if (!stats.modelUsage[model]) {
                stats.modelUsage[model] = 0;
            }
            stats.modelUsage[model]++;

            // Update favorite provider
            const mostUsedProvider = Object.entries(stats.providerUsage)
                .sort(([,a], [,b]) => b - a)[0];
            if (mostUsedProvider) {
                stats.favoriteProvider = mostUsedProvider[0];
            }

            // Save updated stats
            await window.electronAPI.store.set('usageStats', stats);

            // Update dashboard if visible
            if (window.app && typeof window.app.updateDashboardStats === 'function') {
                window.app.updateDashboardStats();
            }
        } catch (error) {
            console.error('Error tracking model usage:', error);
        }
    }
}

// Initialize the AI Input component when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure other components are loaded
    setTimeout(() => {
        console.log('Initializing AI Input Component...');
        window.aiInputComponent = new AIInputComponent();
        console.log('AI Input Component initialized');
    }, 200);
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    console.log('DOM already loaded, initializing AI Input Component immediately...');
    setTimeout(() => {
        window.aiInputComponent = new AIInputComponent();
    }, 200);
}