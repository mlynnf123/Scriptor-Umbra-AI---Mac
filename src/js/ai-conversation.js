// AI Conversation Component - Vanilla JS version
class AIConversationComponent {
    constructor() {
        this.isAtBottom = true;
        this.observer = null;
        this.conversationElement = null;
        this.contentElement = null;
        this.scrollButton = null;
        
        this.init();
    }

    init() {
        this.addStyles();
        this.setupElements();
        this.setupScrollObserver();
        this.setupEventListeners();
    }

    addStyles() {
        if (document.querySelector('#ai-conversation-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ai-conversation-styles';
        styles.textContent = `
            .ai-conversation {
                position: relative;
                flex: 1;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                height: 100%;
            }

            .ai-conversation-content {
                flex: 1;
                padding: 16px;
                overflow-y: auto;
                scroll-behavior: smooth;
            }

            .ai-conversation-scroll-button {
                position: absolute;
                bottom: 16px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                z-index: 10;
            }

            .ai-conversation-scroll-button:hover {
                background: #f9fafb;
                border-color: #d1d5db;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transform: translateX(-50%) translateY(-1px);
            }

            .ai-conversation-scroll-button:active {
                transform: translateX(-50%) scale(0.95);
            }

            .ai-conversation-scroll-button .scroll-icon {
                width: 20px;
                height: 20px;
                color: #6b7280;
            }

            .ai-conversation-scroll-button.hidden {
                opacity: 0;
                pointer-events: none;
                transform: translateX(-50%) translateY(10px);
            }

            /* Ensure chat messages container works within new structure */
            .ai-conversation .chat-messages {
                display: flex;
                flex-direction: column;
                gap: 16px;
                min-height: 100%;
            }

            /* Dark theme styles */
            [data-theme="dark"] .ai-conversation-scroll-button {
                background: #374151;
                border-color: #4b5563;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }

            [data-theme="dark"] .ai-conversation-scroll-button:hover {
                background: #4b5563;
                border-color: #6b7280;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            }

            [data-theme="dark"] .ai-conversation-scroll-button .scroll-icon {
                color: #9ca3af;
            }

            /* Smooth scrolling animation */
            .ai-conversation-content.scrolling {
                scroll-behavior: smooth;
            }
        `;
        document.head.appendChild(styles);
    }

    setupElements() {
        this.conversationElement = document.getElementById('aiConversation');
        this.contentElement = document.getElementById('aiConversationContent');
        this.scrollButton = document.getElementById('aiConversationScrollButton');

        if (!this.conversationElement || !this.contentElement || !this.scrollButton) {
            console.error('AI Conversation elements not found');
            return;
        }

        console.log('AI Conversation elements initialized');
    }

    setupScrollObserver() {
        if (!this.contentElement) return;

        // Use Intersection Observer to detect when we're at the bottom
        const sentinel = document.createElement('div');
        sentinel.style.height = '1px';
        sentinel.className = 'scroll-sentinel';
        this.contentElement.appendChild(sentinel);

        this.observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                this.isAtBottom = entry.isIntersecting;
                this.updateScrollButton();
            },
            {
                root: this.contentElement,
                threshold: 0.1,
            }
        );

        this.observer.observe(sentinel);

        // Also listen for scroll events to update button state
        this.contentElement.addEventListener('scroll', () => {
            this.checkScrollPosition();
        });
    }

    checkScrollPosition() {
        if (!this.contentElement) return;

        const { scrollTop, scrollHeight, clientHeight } = this.contentElement;
        const threshold = 50; // Show button when 50px from bottom
        this.isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;
        this.updateScrollButton();
    }

    updateScrollButton() {
        if (!this.scrollButton) return;

        if (this.isAtBottom) {
            this.scrollButton.style.display = 'none';
            this.scrollButton.classList.add('hidden');
        } else {
            this.scrollButton.style.display = 'flex';
            this.scrollButton.classList.remove('hidden');
        }
    }

    setupEventListeners() {
        if (!this.scrollButton) return;

        this.scrollButton.addEventListener('click', () => {
            this.scrollToBottom();
        });
    }

    scrollToBottom(smooth = true) {
        if (!this.contentElement) return;

        const scrollOptions = {
            top: this.contentElement.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        };

        this.contentElement.scrollTo(scrollOptions);
        
        // Update state immediately for smooth UX
        setTimeout(() => {
            this.isAtBottom = true;
            this.updateScrollButton();
        }, 100);
    }

    // Method to be called when new messages are added
    onNewMessage() {
        // Auto-scroll to bottom if user was already at bottom
        if (this.isAtBottom) {
            this.scrollToBottom();
        } else {
            // Show scroll button if user is not at bottom
            this.updateScrollButton();
        }
    }

    // Method to initialize the conversation after messages are loaded
    initializeAfterContent() {
        setTimeout(() => {
            this.scrollToBottom(false); // Immediate scroll on load
            this.checkScrollPosition();
        }, 100);
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// Initialize the AI Conversation component when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing AI Conversation Component...');
    window.aiConversationComponent = new AIConversationComponent();
    
    // Initialize after a short delay to ensure content is loaded
    setTimeout(() => {
        if (window.aiConversationComponent) {
            window.aiConversationComponent.initializeAfterContent();
        }
    }, 500);
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    console.log('DOM already loaded, initializing AI Conversation Component immediately...');
    window.aiConversationComponent = new AIConversationComponent();
    setTimeout(() => {
        if (window.aiConversationComponent) {
            window.aiConversationComponent.initializeAfterContent();
        }
    }, 500);
}