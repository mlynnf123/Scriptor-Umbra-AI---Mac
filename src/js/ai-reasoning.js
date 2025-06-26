// AI Reasoning Component - Vanilla JS version
class AIReasoningComponent {
    constructor() {
        this.isOpen = false;
        this.isStreaming = false;
        this.content = '';
        this.currentTokenIndex = 0;
        this.tokens = [];
        this.streamingInterval = null;
        this.reasoningSteps = [];
        
        this.init();
    }

    init() {
        this.addStyles();
    }

    addStyles() {
        if (document.querySelector('#ai-reasoning-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ai-reasoning-styles';
        styles.textContent = `
            .ai-reasoning-container {
                margin-bottom: 12px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background: #f9fafb;
                overflow: hidden;
                transition: all 0.3s ease;
            }

            .ai-reasoning-container.collapsed {
                max-height: 48px;
            }

            .ai-reasoning-container.expanded {
                max-height: 500px;
            }

            .ai-reasoning-trigger {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                cursor: pointer;
                background: transparent;
                border: none;
                width: 100%;
                text-align: left;
                font-size: 14px;
                color: #374151;
                transition: background-color 0.2s ease;
            }

            .ai-reasoning-trigger:hover {
                background: #f3f4f6;
            }

            .ai-reasoning-label {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
            }

            .ai-reasoning-icon {
                width: 16px;
                height: 16px;
                animation: rotate 1s linear infinite;
            }

            .ai-reasoning-icon.static {
                animation: none;
            }

            @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }

            .ai-reasoning-chevron {
                width: 16px;
                height: 16px;
                transition: transform 0.3s ease;
            }

            .ai-reasoning-container.expanded .ai-reasoning-chevron {
                transform: rotate(180deg);
            }

            .ai-reasoning-content-wrapper {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
            }

            .ai-reasoning-container.expanded .ai-reasoning-content-wrapper {
                max-height: 452px;
            }

            .ai-reasoning-content {
                padding: 0 16px 16px 16px;
                font-size: 13px;
                line-height: 1.6;
                color: #4b5563;
                font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
                white-space: pre-wrap;
                max-height: 420px;
                overflow-y: auto;
            }

            .ai-reasoning-content::-webkit-scrollbar {
                width: 6px;
            }

            .ai-reasoning-content::-webkit-scrollbar-track {
                background: #f3f4f6;
                border-radius: 3px;
            }

            .ai-reasoning-content::-webkit-scrollbar-thumb {
                background: #d1d5db;
                border-radius: 3px;
            }

            .ai-reasoning-content::-webkit-scrollbar-thumb:hover {
                background: #9ca3af;
            }

            .ai-reasoning-cursor {
                display: inline-block;
                width: 2px;
                height: 16px;
                background: #3b82f6;
                margin-left: 2px;
                animation: blink 1s infinite;
            }

            @keyframes blink {
                0%, 50% { opacity: 1; }
                51%, 100% { opacity: 0; }
            }

            /* Dark theme styles */
            [data-theme="dark"] .ai-reasoning-container {
                background: #1f2937;
                border-color: #374151;
            }

            [data-theme="dark"] .ai-reasoning-trigger {
                color: #f9fafb;
            }

            [data-theme="dark"] .ai-reasoning-trigger:hover {
                background: #374151;
            }

            [data-theme="dark"] .ai-reasoning-content {
                color: #e5e7eb;
            }

            [data-theme="dark"] .ai-reasoning-content::-webkit-scrollbar-track {
                background: #374151;
            }

            [data-theme="dark"] .ai-reasoning-content::-webkit-scrollbar-thumb {
                background: #6b7280;
            }

            [data-theme="dark"] .ai-reasoning-content::-webkit-scrollbar-thumb:hover {
                background: #9ca3af;
            }
        `;
        document.head.appendChild(styles);
    }

    createReasoningElement(messageId) {
        const container = document.createElement('div');
        container.className = 'ai-reasoning-container collapsed';
        container.id = `reasoning-${messageId}`;

        container.innerHTML = `
            <button class="ai-reasoning-trigger">
                <div class="ai-reasoning-label">
                    <svg class="ai-reasoning-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    <span>Thinking...</span>
                </div>
                <svg class="ai-reasoning-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </button>
            <div class="ai-reasoning-content-wrapper">
                <div class="ai-reasoning-content"></div>
            </div>
        `;

        // Add event listener for toggle
        const trigger = container.querySelector('.ai-reasoning-trigger');
        trigger.addEventListener('click', () => {
            this.toggleReasoning(container);
        });

        return container;
    }

    toggleReasoning(container) {
        const isExpanded = container.classList.contains('expanded');
        if (isExpanded) {
            container.classList.remove('expanded');
            container.classList.add('collapsed');
        } else {
            container.classList.remove('collapsed');
            container.classList.add('expanded');
        }
    }

    startReasoning(messageId, reasoningSteps = null) {
        console.log('Starting reasoning for message:', messageId);
        
        // Default reasoning steps if none provided
        if (!reasoningSteps) {
            reasoningSteps = [
                'Let me analyze this request step by step.',
                '\n\nFirst, I need to understand what the user is asking for.',
                '\n\nBased on the context, I can see that this relates to ',
                `${window.app?.currentConversation?.messages?.slice(-1)[0]?.content || 'the current query'}.`,
                '\n\nI should provide a comprehensive and helpful response.',
                '\n\nLet me structure my answer to be clear and actionable.'
            ].join('');
        }

        this.reasoningSteps = Array.isArray(reasoningSteps) ? reasoningSteps : [reasoningSteps];
        this.isStreaming = true;
        this.content = '';
        this.currentTokenIndex = 0;
        
        // Tokenize the reasoning steps
        this.tokens = this.chunkIntoTokens(this.reasoningSteps.join('\n\n'));

        // Get or create reasoning element
        let reasoningEl = document.getElementById(`reasoning-${messageId}`);
        if (!reasoningEl) {
            const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
            if (messageEl) {
                reasoningEl = this.createReasoningElement(messageId);
                // Insert before the message content
                const messageContent = messageEl.querySelector('.message-content');
                if (messageContent) {
                    messageContent.insertBefore(reasoningEl, messageContent.firstChild);
                }
            }
        }

        if (reasoningEl) {
            // Auto-expand
            reasoningEl.classList.remove('collapsed');
            reasoningEl.classList.add('expanded');
            
            // Start streaming animation
            const icon = reasoningEl.querySelector('.ai-reasoning-icon');
            if (icon) icon.classList.remove('static');
            
            // Start streaming content
            this.streamContent(reasoningEl);
        }
    }

    chunkIntoTokens(text) {
        const tokens = [];
        let i = 0;
        while (i < text.length) {
            // Random chunk size between 2-5 characters for smoother streaming
            const chunkSize = Math.floor(Math.random() * 4) + 2;
            tokens.push(text.slice(i, i + chunkSize));
            i += chunkSize;
        }
        return tokens;
    }

    streamContent(reasoningEl) {
        const contentEl = reasoningEl.querySelector('.ai-reasoning-content');
        if (!contentEl) return;

        // Clear any existing interval
        if (this.streamingInterval) {
            clearInterval(this.streamingInterval);
        }

        // Stream tokens
        this.streamingInterval = setInterval(() => {
            if (this.currentTokenIndex >= this.tokens.length) {
                this.finishStreaming(reasoningEl);
                return;
            }

            this.content += this.tokens[this.currentTokenIndex];
            contentEl.innerHTML = this.content + '<span class="ai-reasoning-cursor"></span>';
            
            // Auto-scroll to bottom
            contentEl.scrollTop = contentEl.scrollHeight;
            
            this.currentTokenIndex++;
        }, 30); // 30ms interval for smooth streaming
    }

    finishStreaming(reasoningEl) {
        console.log('Finishing reasoning stream');
        
        // Clear interval
        if (this.streamingInterval) {
            clearInterval(this.streamingInterval);
            this.streamingInterval = null;
        }

        this.isStreaming = false;

        // Remove cursor
        const contentEl = reasoningEl.querySelector('.ai-reasoning-content');
        if (contentEl) {
            contentEl.innerHTML = this.content;
        }

        // Keep animation running and update label to show generating response
        const icon = reasoningEl.querySelector('.ai-reasoning-icon');
        // Don't stop animation yet - keep it running until response is complete
        
        const label = reasoningEl.querySelector('.ai-reasoning-label span');
        if (label) label.textContent = 'Generating response...';

        // Don't auto-collapse - wait for stopReasoning to be called
    }

    stopReasoning(messageId) {
        const reasoningEl = document.getElementById(`reasoning-${messageId}`);
        if (reasoningEl) {
            // Stop animation and update final label
            const icon = reasoningEl.querySelector('.ai-reasoning-icon');
            if (icon) icon.classList.add('static');
            
            const label = reasoningEl.querySelector('.ai-reasoning-label span');
            if (label) {
                const thinkingTime = Math.round(this.tokens.length * 30 / 1000 * 10) / 10;
                label.textContent = `Thought for ${thinkingTime} seconds`;
            }

            // Auto-collapse after 2 seconds
            setTimeout(() => {
                if (reasoningEl && reasoningEl.classList.contains('expanded')) {
                    reasoningEl.classList.remove('expanded');
                    reasoningEl.classList.add('collapsed');
                }
            }, 2000);
        }
    }
}

// Initialize the AI Reasoning component when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing AI Reasoning Component...');
    window.aiReasoningComponent = new AIReasoningComponent();
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    console.log('DOM already loaded, initializing AI Reasoning Component immediately...');
    window.aiReasoningComponent = new AIReasoningComponent();
}