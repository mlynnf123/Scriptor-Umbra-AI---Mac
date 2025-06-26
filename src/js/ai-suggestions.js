// AI Suggestions Component - Vanilla JS version
class AISuggestionsComponent {
    constructor() {
        this.suggestions = [];
        this.isVisible = true;
        this.selectedIndex = -1;
        
        // Default suggestions for different contexts
        this.defaultSuggestions = {
            general: [
                'Write a compelling novel opening in the style of Ernest Hemingway',
                'Create a character study reminiscent of Charles Dickens',
                'Draft a thrilling adventure scene like Jack London',
                'Write a philosophical dialogue in the manner of Oscar Wilde',
                'Compose a dark mystery opening à la Edgar Allan Poe',
                'Create a humorous travel narrative like Mark Twain',
                'Write a fantasy prologue inspired by C.S. Lewis',
                'Draft a dystopian chapter in the style of George Orwell'
            ],
            authorStyle: {
                'ernest-hemingway': [
                    'Write a story with Hemingway\'s iceberg theory',
                    'Create spare, understated dialogue',
                    'Write about war and loss with restraint',
                    'Show emotion through action, not words',
                    'Write a scene with economic language',
                    'Create a character study with minimal description'
                ],
                'william-shakespeare': [
                    'Write a soliloquy in iambic pentameter',
                    'Create a scene with rich metaphors',
                    'Write about love using Shakespearean language',
                    'Create dialogue with wordplay and wit',
                    'Write a dramatic monologue',
                    'Compose a sonnet about modern life'
                ],
                'edgar-allan-poe': [
                    'Write a gothic horror opening',
                    'Create psychological tension',
                    'Write about madness and obsession',
                    'Create an atmosphere of dread',
                    'Write with ornate Victorian language',
                    'Develop a tale of mystery and macabre'
                ],
                'jack-kerouac': [
                    'Write with spontaneous prose style',
                    'Create a stream-of-consciousness passage',
                    'Write about freedom and wanderlust',
                    'Use jazz-influenced rhythm in writing',
                    'Write about spiritual seeking',
                    'Create a road trip narrative'
                ],
                'mark-twain': [
                    'Write a humorous river adventure',
                    'Create satirical social commentary',
                    'Write dialogue in authentic vernacular',
                    'Develop a mischievous young protagonist',
                    'Create a tale of mistaken identity',
                    'Write about American frontier life'
                ],
                'hunter-s-thompson': [
                    'Write gonzo journalism about a strange event',
                    'Create drug-fueled social commentary',
                    'Write a wild political satire',
                    'Develop paranoid stream-of-consciousness',
                    'Create an outrageous Vegas adventure',
                    'Write about the death of the American Dream'
                ],
                'cs-lewis': [
                    'Write a fantasy allegory with moral themes',
                    'Create a talking animal character',
                    'Write about good versus evil',
                    'Develop a magical world with rules',
                    'Create a coming-of-age fantasy',
                    'Write Christian symbolism into adventure'
                ],
                'virginia-woolf': [
                    'Write stream-of-consciousness interior thoughts',
                    'Create a day-in-the-life narrative',
                    'Write about women\'s inner lives',
                    'Develop psychological complexity',
                    'Create impressionistic descriptions',
                    'Write about time and memory'
                ],
                'franz-kafka': [
                    'Write a bureaucratic nightmare scenario',
                    'Create an absurd transformation story',
                    'Write about alienation and guilt',
                    'Develop surreal dream logic',
                    'Create an anxiety-inducing situation',
                    'Write about powerlessness against systems'
                ]
            },
            writing: [
                'Write a Southern Gothic tale like Flannery O\'Connor',
                'Create a Beat Generation narrative like Jack Kerouac',
                'Draft a psychological thriller in the style of Franz Kafka',
                'Write a historical romance like Jane Austen',
                'Compose a war story reminiscent of Kurt Vonnegut',
                'Create a coming-of-age chapter like Harper Lee',
                'Write a supernatural tale inspired by H.P. Lovecraft',
                'Draft a Western adventure like Zane Grey'
            ],
            literary: [
                'Write stream-of-consciousness like Virginia Woolf',
                'Create magical realism like Gabriel García Márquez',
                'Draft existentialist prose like Jean-Paul Sartre',
                'Write minimalist fiction like Raymond Carver',
                'Compose epic fantasy like J.R.R. Tolkien',
                'Create noir detective fiction like Raymond Chandler',
                'Write Gothic horror like Bram Stoker',
                'Draft science fiction like Isaac Asimov'
            ],
            creative: [
                'Generate a plot twist worthy of O. Henry',
                'Create character development like Charles Dickens',
                'Write dialogue in the wit of Dorothy Parker',
                'Develop a setting like William Faulkner',
                'Create conflict structure like Shakespeare',
                'Write descriptive passages like Thomas Hardy',
                'Generate story themes like Toni Morrison',
                'Create narrative voice like Salinger'
            ]
        };
        
        this.init();
    }

    init() {
        this.addStyles();
        this.loadSuggestions();
    }

    addStyles() {
        if (document.querySelector('#ai-suggestions-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ai-suggestions-styles';
        styles.textContent = `
            .ai-suggestions-container {
                width: 100%;
                margin: 0 auto 20px auto;
                transition: all 0.3s ease;
                background: transparent;
                max-width: 800px;
            }

            .ai-suggestions-container.hidden {
                display: none;
            }

            .ai-suggestions-scroll-container {
                position: relative;
                width: 100%;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 4px;
            }

            .ai-suggestions-scroll-area {
                flex: 1;
                overflow-x: auto;
                white-space: nowrap;
                scrollbar-width: none;
                -ms-overflow-style: none;
                scroll-behavior: smooth;
                padding: 4px 8px;
                margin: -4px -8px;
            }

            .ai-suggestions-scroll-area::-webkit-scrollbar {
                display: none;
            }

            .ai-suggestions-list {
                display: flex;
                gap: 8px;
                flex-wrap: nowrap;
                width: max-content;
                align-items: center;
                margin: 0;
                padding: 0;
                list-style: none;
            }

            .ai-suggestions-arrow {
                background: rgba(255, 255, 255, 0.9);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                flex-shrink: 0;
                box-shadow: 
                    0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                position: relative;
                z-index: 10;
            }

            .ai-suggestions-arrow:hover {
                background: rgba(255, 255, 255, 0.95);
                border-color: rgba(59, 130, 246, 0.3);
                box-shadow: 
                    0 8px 25px -5px rgba(0, 0, 0, 0.2),
                    0 4px 12px -2px rgba(59, 130, 246, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
                transform: translateY(-2px) scale(1.05);
            }

            .ai-suggestions-arrow:active {
                transform: scale(0.95);
            }

            .ai-suggestions-arrow.disabled {
                opacity: 0.3;
                cursor: not-allowed;
                pointer-events: none;
            }

            .ai-suggestions-arrow svg {
                width: 16px;
                height: 16px;
                color: #1e293b;
                stroke-width: 2.5;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
            }

            .ai-suggestions-arrow:hover svg {
                color: #3b82f6;
                stroke-width: 3;
            }

            .ai-suggestion {
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 9999px;
                padding: 8px 16px;
                font-size: 13px;
                color: #1e293b;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                white-space: nowrap;
                position: relative;
                outline: none;
                font-weight: 400;
                line-height: 1.25;
                min-height: 36px;
                display: flex;
                align-items: center;
                text-decoration: none;
                user-select: none;
                box-shadow: 
                    0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
                text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
            }

            .ai-suggestion:hover {
                background: rgba(255, 255, 255, 0.95);
                border-color: rgba(59, 130, 246, 0.4);
                color: #3b82f6;
                box-shadow: 
                    0 8px 25px -5px rgba(0, 0, 0, 0.2),
                    0 4px 12px -2px rgba(59, 130, 246, 0.25),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
                transform: translateY(-2px) scale(1.02);
                text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
            }

            .ai-suggestion:focus {
                box-shadow: 
                    0 0 0 3px rgba(59, 130, 246, 0.3),
                    0 8px 25px -5px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
                border-color: rgba(59, 130, 246, 0.5);
                outline: none;
            }

            .ai-suggestion:active {
                transform: scale(0.98) translateY(-1px);
            }

            .ai-suggestion.selected {
                background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95));
                color: white;
                border-color: rgba(59, 130, 246, 0.8);
                box-shadow: 
                    0 8px 25px -5px rgba(59, 130, 246, 0.5),
                    0 4px 12px -2px rgba(59, 130, 246, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
            }

            .ai-suggestions-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(0, 0, 0, 0.1);
                border: none;
                color: #6b7280;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }

            .ai-suggestions-close:hover {
                background: rgba(0, 0, 0, 0.2);
                color: #374151;
            }

            .ai-suggestions-close svg {
                width: 12px;
                height: 12px;
            }

            /* Dark theme styles */
            [data-theme="dark"] .ai-suggestion {
                background: rgba(55, 65, 81, 0.9);
                backdrop-filter: blur(12px);
                border-color: rgba(75, 85, 99, 0.6);
                color: #e2e8f0;
                font-weight: 400;
                box-shadow: 
                    0 4px 6px -1px rgba(0, 0, 0, 0.4),
                    0 2px 4px -1px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
            }

            [data-theme="dark"] .ai-suggestion:hover {
                background: rgba(75, 85, 99, 0.95);
                border-color: rgba(59, 130, 246, 0.5);
                color: #60a5fa;
                box-shadow: 
                    0 8px 25px -5px rgba(0, 0, 0, 0.5),
                    0 4px 12px -2px rgba(59, 130, 246, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15);
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
            }

            [data-theme="dark"] .ai-suggestions-arrow {
                background: rgba(55, 65, 81, 0.9);
                backdrop-filter: blur(10px);
                border-color: rgba(75, 85, 99, 0.6);
                box-shadow: 
                    0 4px 6px -1px rgba(0, 0, 0, 0.4),
                    0 2px 4px -1px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
            }

            [data-theme="dark"] .ai-suggestions-arrow:hover {
                background: rgba(75, 85, 99, 0.95);
                border-color: rgba(59, 130, 246, 0.4);
                box-shadow: 
                    0 8px 25px -5px rgba(0, 0, 0, 0.5),
                    0 4px 12px -2px rgba(59, 130, 246, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15);
            }

            [data-theme="dark"] .ai-suggestions-arrow svg {
                color: #e2e8f0;
                filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
            }

            [data-theme="dark"] .ai-suggestions-arrow:hover svg {
                color: #60a5fa;
            }

            [data-theme="dark"] .ai-suggestions-close {
                background: rgba(255, 255, 255, 0.1);
                color: #9ca3af;
            }

            [data-theme="dark"] .ai-suggestions-close:hover {
                background: rgba(255, 255, 255, 0.2);
                color: #e5e7eb;
            }

            /* Responsive design */
            @media (max-width: 1024px) {
                .ai-suggestions-container {
                    max-width: 700px;
                }
            }

            @media (max-width: 768px) {
                .ai-suggestions-container {
                    max-width: 600px;
                }
            }

            @media (max-width: 640px) {
                .ai-suggestions-container {
                    max-width: 100%;
                    margin: 0 16px 20px 16px;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    createSuggestionsElement() {
        const container = document.createElement('div');
        container.className = 'ai-suggestions-container';
        container.id = 'ai-suggestions-container';

        container.innerHTML = `
            <div class="ai-suggestions-scroll-container">
                <button class="ai-suggestions-arrow" id="scroll-left" title="Scroll left">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <div class="ai-suggestions-scroll-area" id="suggestions-scroll-area">
                    <div class="ai-suggestions-list" id="suggestions-list"></div>
                </div>
                <button class="ai-suggestions-arrow" id="scroll-right" title="Scroll right">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 6 15 12 9 18"></polyline>
                    </svg>
                </button>
            </div>
            <button class="ai-suggestions-close" id="close-suggestions">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;

        return container;
    }

    renderSuggestions() {
        const container = document.getElementById('ai-suggestions-container');
        const list = document.getElementById('suggestions-list');
        
        if (!container || !list) return;

        list.innerHTML = '';
        
        this.suggestions.forEach((suggestion, index) => {
            const button = document.createElement('button');
            button.className = 'ai-suggestion';
            button.type = 'button';
            if (index === this.selectedIndex) {
                button.classList.add('selected');
            }
            
            button.textContent = suggestion;
            
            button.addEventListener('click', () => {
                this.handleSuggestionClick(suggestion);
            });
            
            list.appendChild(button);
        });

        // Update scroll buttons after rendering
        setTimeout(() => this.updateScrollButtons(), 50);
    }

    loadSuggestions() {
        // Determine context based on current conversation or default
        const context = this.determineContext();
        this.suggestions = this.getRandomSuggestions(context, 6);
        this.renderSuggestions();
    }

    determineContext() {
        // Check selected author style first
        const authorStyle = document.getElementById('authorStyleSelect')?.value;
        if (authorStyle && this.defaultSuggestions.authorStyle[authorStyle]) {
            return { type: 'authorStyle', value: authorStyle };
        }
        
        // Check if there's an active conversation to determine context
        if (window.app && window.app.currentConversation) {
            const messages = window.app.currentConversation.messages;
            if (messages && messages.length > 0) {
                const lastMessage = messages[messages.length - 1].content.toLowerCase();
                
                if (lastMessage.includes('stream') || lastMessage.includes('magical realism') || lastMessage.includes('existentialist') || lastMessage.includes('minimalist') || lastMessage.includes('noir') || lastMessage.includes('gothic')) {
                    return { type: 'category', value: 'literary' };
                } else if (lastMessage.includes('story') || lastMessage.includes('write') || lastMessage.includes('novel') || lastMessage.includes('chapter') || lastMessage.includes('narrative')) {
                    return { type: 'category', value: 'writing' };
                } else if (lastMessage.includes('character') || lastMessage.includes('plot') || lastMessage.includes('dialogue') || lastMessage.includes('setting') || lastMessage.includes('theme')) {
                    return { type: 'category', value: 'creative' };
                }
            }
        }
        
        return { type: 'category', value: 'general' };
    }

    getRandomSuggestions(context, count) {
        let suggestions = [];
        
        if (context.type === 'authorStyle') {
            suggestions = [...this.defaultSuggestions.authorStyle[context.value]];
        } else {
            suggestions = [...this.defaultSuggestions[context.value]];
        }
        
        const selected = [];
        
        for (let i = 0; i < count && suggestions.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * suggestions.length);
            selected.push(suggestions[randomIndex]);
            suggestions.splice(randomIndex, 1);
        }
        
        return selected;
    }

    handleSuggestionClick(suggestion) {
        console.log('Selected suggestion:', suggestion);
        
        // Set the suggestion in the AI input
        if (window.aiInputComponent) {
            const textarea = document.getElementById('aiInputTextarea');
            if (textarea) {
                textarea.value = suggestion;
                window.aiInputComponent.text = suggestion;
                window.aiInputComponent.autoResize(textarea);
                window.aiInputComponent.updateSubmitButton();
                
                // Focus the textarea
                textarea.focus();
                
                // Optionally auto-send
                // window.aiInputComponent.handleSubmit();
            }
        } else {
            // Fallback to old chat input
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.value = suggestion;
                chatInput.focus();
            }
        }
        
        // Refresh suggestions after selection
        setTimeout(() => {
            this.loadSuggestions();
        }, 100);
    }

    show() {
        const container = document.getElementById('ai-suggestions-container');
        if (container) {
            container.classList.remove('hidden');
            this.isVisible = true;
            localStorage.setItem('ai-suggestions-visible', 'true');
        }
    }

    hide() {
        const container = document.getElementById('ai-suggestions-container');
        if (container) {
            container.classList.add('hidden');
            this.isVisible = false;
            localStorage.setItem('ai-suggestions-visible', 'false');
        }
    }

    setupEventListeners() {
        // Close button
        const closeBtn = document.getElementById('close-suggestions');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // Scroll buttons
        const scrollLeft = document.getElementById('scroll-left');
        const scrollRight = document.getElementById('scroll-right');
        const scrollArea = document.getElementById('suggestions-scroll-area');

        if (scrollLeft && scrollRight && scrollArea) {
            scrollLeft.addEventListener('click', () => {
                scrollArea.scrollBy({ left: -200, behavior: 'smooth' });
                this.updateScrollButtons();
            });

            scrollRight.addEventListener('click', () => {
                scrollArea.scrollBy({ left: 200, behavior: 'smooth' });
                this.updateScrollButtons();
            });

            // Update button states on scroll
            scrollArea.addEventListener('scroll', () => {
                this.updateScrollButtons();
            });

            // Initial button state update
            setTimeout(() => this.updateScrollButtons(), 100);
        }
        
        // Listen for author style changes
        const authorStyleSelect = document.getElementById('authorStyleSelect');
        if (authorStyleSelect) {
            authorStyleSelect.addEventListener('change', () => {
                setTimeout(() => {
                    this.loadSuggestions();
                }, 100);
            });
        }
        
        // Listen for provider changes
        const providerSelect = document.getElementById('aiProviderSelect');
        if (providerSelect) {
            providerSelect.addEventListener('change', () => {
                setTimeout(() => {
                    this.loadSuggestions();
                }, 100);
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isVisible) return;
            
            if (e.key === 'Tab' && !e.shiftKey) {
                e.preventDefault();
                this.navigateSuggestions(1);
            } else if (e.key === 'Tab' && e.shiftKey) {
                e.preventDefault();
                this.navigateSuggestions(-1);
            } else if (e.key === 'Enter' && this.selectedIndex >= 0) {
                e.preventDefault();
                const suggestions = document.querySelectorAll('.ai-suggestion');
                if (suggestions[this.selectedIndex]) {
                    suggestions[this.selectedIndex].click();
                }
            } else if (e.key === 'Escape') {
                this.selectedIndex = -1;
                this.renderSuggestions();
            }
        });
    }

    navigateSuggestions(direction) {
        const suggestionsCount = this.suggestions.length;
        if (suggestionsCount === 0) return;

        this.selectedIndex += direction;
        
        if (this.selectedIndex >= suggestionsCount) {
            this.selectedIndex = 0;
        } else if (this.selectedIndex < 0) {
            this.selectedIndex = suggestionsCount - 1;
        }
        
        this.renderSuggestions();
    }

    updateScrollButtons() {
        const scrollArea = document.getElementById('suggestions-scroll-area');
        const scrollLeft = document.getElementById('scroll-left');
        const scrollRight = document.getElementById('scroll-right');

        if (!scrollArea || !scrollLeft || !scrollRight) return;

        const isAtStart = scrollArea.scrollLeft <= 0;
        const isAtEnd = scrollArea.scrollLeft >= (scrollArea.scrollWidth - scrollArea.clientWidth);

        scrollLeft.classList.toggle('disabled', isAtStart);
        scrollRight.classList.toggle('disabled', isAtEnd);
    }

    insertIntoChat() {
        // Wait for AI Input component to finish rendering first
        this.waitForAIInputAndInsert();
    }

    waitForAIInputAndInsert(maxAttempts = 10, currentAttempt = 0) {
        if (currentAttempt >= maxAttempts) {
            console.error('Failed to find suitable container for AI suggestions after maximum attempts');
            return;
        }

        // Try multiple selectors to find the right container
        let inputContainer = null;
        
        // First, try to find the AI input wrapper (created by AI Input component)
        const aiInputWrapper = document.querySelector('.ai-input-wrapper');
        if (aiInputWrapper) {
            inputContainer = aiInputWrapper;
        }
        
        // Fallback to the original chat input container
        if (!inputContainer) {
            inputContainer = document.querySelector('.chat-input-container');
        }
        
        // Try to find any container with the AI input textarea
        if (!inputContainer) {
            const aiInput = document.querySelector('#aiInputTextarea');
            if (aiInput) {
                inputContainer = aiInput.closest('.ai-input-wrapper') || aiInput.closest('div');
            }
        }
        
        // As last resort, try to find the chat container and insert before last child
        if (!inputContainer) {
            const chatContainer = document.querySelector('.chat-container');
            if (chatContainer && chatContainer.children.length > 0) {
                inputContainer = chatContainer.children[chatContainer.children.length - 1];
            }
        }

        // If still no container found, wait and try again
        if (!inputContainer) {
            console.log(`AI suggestions: Attempt ${currentAttempt + 1} - No container found, retrying...`);
            setTimeout(() => {
                this.waitForAIInputAndInsert(maxAttempts, currentAttempt + 1);
            }, 200);
            return;
        }

        console.log('AI suggestions: Found container:', inputContainer.className || inputContainer.tagName);

        // Check if suggestions container already exists (prevent duplicates)
        if (document.getElementById('ai-suggestions-container')) {
            console.log('AI suggestions: Container already exists, skipping insertion');
            return;
        }

        const suggestionsEl = this.createSuggestionsElement();
        inputContainer.parentNode.insertBefore(suggestionsEl, inputContainer);
        
        console.log('AI suggestions: Successfully inserted suggestions container');
        
        // Check if suggestions should be visible (default to visible)
        const savedVisibility = localStorage.getItem('ai-suggestions-visible');
        if (savedVisibility === 'false') {
            this.hide();
        } else {
            // Ensure suggestions are visible by default
            this.show();
        }
        
        this.setupEventListeners();
        
        // Load initial suggestions
        this.renderSuggestions();
    }
}

// Initialize the AI Suggestions component when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing AI Suggestions Component...');
    if (!window.aiSuggestionsComponent) {
        window.aiSuggestionsComponent = new AISuggestionsComponent();
        console.log('AI Suggestions Component created and assigned to window');
        
        // Wait for AI Input component to be ready
        setTimeout(() => {
            console.log('Attempting to insert AI suggestions into chat...');
            if (window.aiSuggestionsComponent) {
                window.aiSuggestionsComponent.insertIntoChat();
            }
        }, 800);
    }
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    console.log('DOM already loaded, initializing AI Suggestions Component immediately...');
    if (!window.aiSuggestionsComponent) {
        window.aiSuggestionsComponent = new AISuggestionsComponent();
        console.log('AI Suggestions Component created and assigned to window');
        setTimeout(() => {
            console.log('Attempting to insert AI suggestions into chat...');
            if (window.aiSuggestionsComponent) {
                window.aiSuggestionsComponent.insertIntoChat();
            }
        }, 800);
    }
}