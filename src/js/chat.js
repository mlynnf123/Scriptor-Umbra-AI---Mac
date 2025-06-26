// Chat Functionality
class ChatManager {
    constructor() {
        this.isProcessing = false;
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded before setting up event listeners
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
            });
        } else {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        console.log('Setting up chat event listeners...');
        
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');

        if (!chatInput) {
            console.error('Chat input element not found!');
            return;
        }

        if (!sendButton) {
            console.error('Send button element not found!');
            return;
        }

        console.log('Chat elements found successfully', { chatInput, sendButton });

        // Send message on button click
        sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Send button clicked');
            this.sendMessage();
        });

        // Send message on Enter (but allow Shift+Enter for new lines)
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                console.log('Enter key pressed');
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        chatInput.addEventListener('input', () => {
            this.autoResizeTextarea(chatInput);
        });

        // Provider selection change
        const providerSelect = document.getElementById('aiProviderSelect');
        if (providerSelect) {
            providerSelect.addEventListener('change', (e) => {
                if (window.app && window.app.currentConversation) {
                    window.app.currentConversation.provider = e.target.value;
                }
            });
        }

        // Author style selection change
        const authorStyleSelect = document.getElementById('authorStyleSelect');
        if (authorStyleSelect) {
            authorStyleSelect.addEventListener('change', (e) => {
                if (window.app && window.app.currentConversation) {
                    window.app.currentConversation.authorStyle = e.target.value;
                }
                this.updateAuthorStyleIndicator(e.target.value);
            });
        }

        console.log('Event listeners set up successfully');
    }

    async sendMessage() {
        console.log('sendMessage called, isProcessing:', this.isProcessing);
        
        if (this.isProcessing) {
            console.log('Already processing, returning');
            return;
        }

        const chatInput = document.getElementById('chatInput');
        if (!chatInput) {
            console.error('Chat input not found');
            return;
        }
        
        const message = chatInput.value.trim();
        console.log('Message to send:', message);

        if (!message) {
            console.log('Empty message, returning');
            return;
        }

        // Check if we have a current conversation
        if (!window.app || !window.app.currentConversation) {
            if (window.app && window.app.createNewConversation) {
                window.app.createNewConversation();
            } else {
                console.error('App not initialized or createNewConversation method not available');
                return;
            }
        }

        // Add user message to UI
        this.addMessageToUI(message, 'user');

        // Clear input
        chatInput.value = '';
        this.autoResizeTextarea(chatInput);

        // Add user message to conversation
        const userMessage = {
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        };
        window.app.currentConversation.messages.push(userMessage);

        // Generate title if this is the first message
        if (window.app.currentConversation.messages.length === 1) {
            window.app.currentConversation.title = this.generateTitle(message);
        }

        // Show typing indicator
        this.showTypingIndicator();

        try {
            this.isProcessing = true;
            
            // Generate message ID for the AI response
            const aiMessageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            // Remove typing indicator and add empty AI message
            this.removeTypingIndicator();
            
            // Add empty AI message placeholder
            const messagesContainer = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message ai-message';
            messageDiv.setAttribute('data-message-id', aiMessageId);
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <img src="assets/logo.png" alt="AI" class="avatar-logo">
                </div>
                <div class="message-content">
                    <p></p>
                    <span class="message-time">${this.getCurrentTime()}</span>
                </div>
            `;
            messagesContainer.appendChild(messageDiv);
            
            // Start reasoning animation
            if (window.aiReasoningComponent) {
                const reasoningSteps = this.generateReasoningSteps(message);
                window.aiReasoningComponent.startReasoning(aiMessageId, reasoningSteps);
            }
            
            // Get AI response
            const response = await this.getAIResponse(message);
            
            // Stop reasoning and update message content
            if (window.aiReasoningComponent) {
                window.aiReasoningComponent.stopReasoning(aiMessageId);
            }
            
            // Update the message content with the actual response
            const messageContent = messageDiv.querySelector('.message-content p');
            if (messageContent) {
                messageContent.innerHTML = this.formatMessageContent(response);
            }

            // Add AI message to conversation
            const aiMessage = {
                role: 'assistant',
                content: response,
                timestamp: new Date().toISOString()
            };
            window.app.currentConversation.messages.push(aiMessage);

            // Update conversation timestamp
            window.app.currentConversation.updatedAt = new Date().toISOString();

            // Save conversation
            await this.saveCurrentConversation();

        } catch (error) {
            console.error('Error getting AI response:', error);
            this.removeTypingIndicator();
            
            // Check if it's an API key error
            if (error.message.includes('No API key configured')) {
                this.showErrorModal(error.message);
            } else {
                this.addMessageToUI('Sorry, I encountered an error while processing your request. ' + error.message, 'assistant', true);
            }
        } finally {
            this.isProcessing = false;
        }
    }

    async getAIResponse(message) {
        const provider = document.getElementById('aiProviderSelect').value;
        const apiKeys = await window.electronAPI.store.get('apiKeys') || {};
        const apiKey = apiKeys[provider];

        if (!apiKey) {
            throw new Error(`No API key configured for ${provider}. Please add your API key in the API Keys section.`);
        }

        // Get conversation history for context
        const messages = window.app.currentConversation.messages.slice(-10); // Last 10 messages for context

        switch (provider) {
            case 'openai':
                return await this.callOpenAI(apiKey, messages);
            case 'claude':
                return await this.callClaude(apiKey, messages);
            case 'deepseek':
                return await this.callDeepSeek(apiKey, messages);
            case 'llama':
                return await this.callLlama(apiKey, messages);
            case 'gemini':
                return await this.callGemini(apiKey, messages);
            default:
                throw new Error(`Unsupported provider: ${provider}`);
        }
    }

    async callOpenAI(apiKey, messages) {
        // Check if we should use the assistant or regular chat completion
        const assistantId = window.app.preferences?.assistantId;
        
        if (assistantId) {
            // Use OpenAI Assistant API
            return await this.callOpenAIAssistant(apiKey, messages, assistantId);
        } else {
            // Get selected author style
            const authorStyleSelect = document.getElementById('authorStyleSelect');
            const authorStyle = authorStyleSelect ? authorStyleSelect.value : '';
            const authorStylePrompt = this.getAuthorStylePrompt(authorStyle);
            
            // Use regular chat completion
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: `You are Scriptor Umbra AI, an intelligent ghostwriting assistant specialized in creating articles, books, copywriting, and long-form content. You provide helpful, creative, and professional writing assistance.${authorStylePrompt}`
                        },
                        ...messages
                    ],
                    max_tokens: 2000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || 'OpenAI API request failed');
            }

            const data = await response.json();
            return data.choices[0].message.content;
        }
    }

    async callOpenAIAssistant(apiKey, messages, assistantId) {
        try {
            // Create a thread
            const threadResponse = await fetch('https://api.openai.com/v1/threads', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                },
                body: JSON.stringify({})
            });

            if (!threadResponse.ok) {
                throw new Error('Failed to create thread');
            }

            const thread = await threadResponse.json();
            const threadId = thread.id;

            // Add the latest message to the thread
            const latestMessage = messages[messages.length - 1];
            await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                },
                body: JSON.stringify({
                    role: 'user',
                    content: latestMessage.content
                })
            });

            // Run the assistant
            const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                },
                body: JSON.stringify({
                    assistant_id: assistantId
                })
            });

            if (!runResponse.ok) {
                throw new Error('Failed to run assistant');
            }

            const run = await runResponse.json();
            const runId = run.id;

            // Poll for completion
            let runStatus = 'queued';
            while (runStatus === 'queued' || runStatus === 'in_progress') {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

                const statusResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'OpenAI-Beta': 'assistants=v2'
                    }
                });

                const statusData = await statusResponse.json();
                runStatus = statusData.status;

                if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
                    throw new Error(`Assistant run ${runStatus}`);
                }
            }

            // Get the messages
            const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'OpenAI-Beta': 'assistants=v2'
                }
            });

            if (!messagesResponse.ok) {
                throw new Error('Failed to get messages');
            }

            const messagesData = await messagesResponse.json();
            const assistantMessage = messagesData.data.find(msg => msg.role === 'assistant');
            
            if (assistantMessage && assistantMessage.content && assistantMessage.content[0]) {
                return assistantMessage.content[0].text.value;
            } else {
                throw new Error('No response from assistant');
            }

        } catch (error) {
            console.error('Assistant API error:', error);
            // Fallback to regular chat completion
            return await this.callOpenAI(apiKey, messages);
        }
    }

    async callClaude(apiKey, messages) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 2000,
                messages: messages.map(msg => ({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content
                }))
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Claude API request failed');
        }

        const data = await response.json();
        return data.content[0].text;
    }

    async callDeepSeek(apiKey, messages) {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'You are Scriptor Umbra AI, an intelligent ghostwriting assistant specialized in creating articles, books, copywriting, and long-form content.'
                    },
                    ...messages
                ],
                max_tokens: 2000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'DeepSeek API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async callLlama(apiKey, messages) {
        // Using Hugging Face Inference API for Llama
        const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\\n');
        
        const response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    max_new_tokens: 500,
                    temperature: 0.7,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Llama API request failed');
        }

        const data = await response.json();
        return data[0].generated_text;
    }

    async callGemini(apiKey, messages) {
        const prompt = messages.map(msg => msg.content).join('\\n');
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Gemini API request failed');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    addMessageToUI(content, role, isError = false, messageId = null) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) {
            console.error('Messages container not found');
            return;
        }

        // Generate message ID if not provided
        if (!messageId) {
            messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role === 'user' ? 'user-message' : 'ai-message'}`;
        messageDiv.setAttribute('data-message-id', messageId);
        
        if (isError) {
            messageDiv.classList.add('error-message');
        }

        messageDiv.innerHTML = `
            <div class="message-avatar">
                ${role === 'user' ? '<i class="fas fa-user"></i>' : '<img src="assets/logo.png" alt="AI" class="avatar-logo">'}
            </div>
            <div class="message-content">
                <p>${this.formatMessageContent(content)}</p>
                <span class="message-time">${this.getCurrentTime()}</span>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        
        // Notify conversation component about new message
        if (window.aiConversationComponent) {
            window.aiConversationComponent.onNewMessage();
        } else {
            // Fallback to manual scroll if conversation component not available
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Add animation
        messageDiv.classList.add('fade-in');
        
        return messageId;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) {
            console.error('Messages container not found');
            return;
        }

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <img src="assets/logo.png" alt="AI" class="avatar-logo">
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        
        // Notify conversation component about new content
        if (window.aiConversationComponent) {
            window.aiConversationComponent.onNewMessage();
        } else {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Add typing animation styles if not present
        if (!document.querySelector('#typing-styles')) {
            const styles = document.createElement('style');
            styles.id = 'typing-styles';
            styles.textContent = `
                .typing-dots {
                    display: flex;
                    gap: 4px;
                    padding: 8px 0;
                }
                
                .typing-dots span {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background-color: var(--text-muted);
                    animation: typing 1.4s infinite ease-in-out;
                }
                
                .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
                .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
                
                @keyframes typing {
                    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                    40% { transform: scale(1); opacity: 1; }
                }
                
                .error-message .message-content {
                    background-color: var(--danger-color);
                    color: white;
                    border-color: var(--danger-color);
                }
            `;
            document.head.appendChild(styles);
        }
    }

    removeTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }

    formatMessageContent(content) {
        // Basic formatting for markdown-like content
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    generateTitle(message) {
        // Generate a title from the first message
        const words = message.split(' ').slice(0, 6);
        return words.join(' ') + (message.split(' ').length > 6 ? '...' : '');
    }
    
    generateReasoningSteps(message) {
        // Generate contextual reasoning steps based on the message
        const messageType = this.analyzeMessageType(message);
        const authorStyle = document.getElementById('authorStyleSelect')?.value || '';
        
        let reasoningSteps = ['Let me think about this request step by step.'];
        
        // Add contextual reasoning based on message type
        if (messageType.isQuestion) {
            reasoningSteps.push('\n\nFirst, I need to understand what specific information is being requested.');
        } else if (messageType.isCreativeWriting) {
            reasoningSteps.push('\n\nI need to consider the creative elements and style requirements for this writing task.');
        } else if (messageType.isCodeRelated) {
            reasoningSteps.push('\n\nI should analyze the technical requirements and best practices for this coding task.');
        } else {
            reasoningSteps.push('\n\nFirst, I need to understand the full context of what the user is asking for.');
        }
        
        // Add author style consideration if selected
        if (authorStyle) {
            const authorName = this.getAuthorDisplayName(authorStyle);
            reasoningSteps.push(`\n\nI need to write in the style of ${authorName}, incorporating their unique voice and techniques.`);
        }
        
        // Add message-specific analysis
        if (message.length > 100) {
            reasoningSteps.push('\n\nThis is a detailed request that requires careful analysis of all the requirements mentioned.');
        }
        
        // Add general reasoning steps
        reasoningSteps.push('\n\nBased on my analysis, I should provide a comprehensive and helpful response.');
        reasoningSteps.push('\n\nLet me structure my answer to be clear, actionable, and directly address the user\'s needs.');
        
        return reasoningSteps.join('');
    }
    
    analyzeMessageType(message) {
        const lowerMessage = message.toLowerCase();
        return {
            isQuestion: lowerMessage.includes('?') || lowerMessage.includes('what') || lowerMessage.includes('how') || lowerMessage.includes('why'),
            isCreativeWriting: lowerMessage.includes('write') || lowerMessage.includes('story') || lowerMessage.includes('article') || lowerMessage.includes('essay'),
            isCodeRelated: lowerMessage.includes('code') || lowerMessage.includes('function') || lowerMessage.includes('debug') || lowerMessage.includes('program')
        };
    }

    async saveCurrentConversation() {
        if (!window.app || !window.app.currentConversation) return;

        try {
            // Update the conversations list in app
            const existingIndex = window.app.conversations.findIndex(
                c => c.id === window.app.currentConversation.id
            );
            
            if (existingIndex >= 0) {
                window.app.conversations[existingIndex] = window.app.currentConversation;
            } else {
                window.app.conversations.unshift(window.app.currentConversation);
            }
            
            // Save all conversations to storage
            await window.electronAPI.store.set('conversations', window.app.conversations);
        } catch (error) {
            console.error('Error saving conversation:', error);
        }
    }

    // Author Style Methods
    getAuthorStylePrompt(authorStyle) {
        if (!authorStyle) return '';

        const authorStyles = {
            'chuck-palahniuk': '\\n\\nWrite in the style of Chuck Palahniuk: Use minimalist prose, dark humor, transgressive themes, repetitive phrases for emphasis, and unconventional narrative structures. Focus on societal critique through shocking scenarios.',
            'charles-bukowski': '\\n\\nWrite in the style of Charles Bukowski: Use raw, unfiltered language, cynical observations about life, simple direct prose, and themes of alcoholism, poverty, and human struggle. Be brutally honest and unpretentious.',
            'hunter-s-thompson': '\\n\\nWrite in the style of Hunter S. Thompson: Use gonzo journalism techniques, stream-of-consciousness writing, drug-fueled observations, political satire, and wild, exaggerated descriptions. Be fearless and unconventional.',
            'jack-kerouac': '\\n\\nWrite in the style of Jack Kerouac: Use spontaneous prose, long flowing sentences, jazz-influenced rhythm, spiritual seeking, and themes of freedom and wanderlust. Write with energy and immediacy.',
            'edgar-allan-poe': '\\n\\nWrite in the style of Edgar Allan Poe: Use gothic atmosphere, psychological horror, ornate Victorian language, themes of death and madness, and precise, musical prose with dark romanticism.',
            'william-shakespeare': '\\n\\nWrite in the style of William Shakespeare: Use iambic pentameter when appropriate, rich metaphors, wordplay, complex characters, and themes of love, power, and human nature. Be eloquent and poetic.',
            'saul-williams': '\\n\\nWrite in the style of Saul Williams: Blend poetry with social activism, use rhythmic language, incorporate hip-hop influences, address racial and social justice themes, and be boldly experimental.',
            'sylvia-plath': '\\n\\nWrite in the style of Sylvia Plath: Use confessional poetry techniques, vivid imagery, emotional intensity, themes of mental health and femininity, and precise, powerful language.',
            'howard-zinn': '\\n\\nWrite in the style of Howard Zinn: Focus on people\'s history, social justice, accessible academic writing, and perspectives from the marginalized. Be passionate about equality and human rights.',
            'ernest-hemingway': '\\n\\nWrite in the style of Ernest Hemingway: Use the iceberg theory, spare prose, understated emotion, dialogue-driven narrative, and themes of war, love, and loss. Be economical with words.',
            'alfred-lord-tennyson': '\\n\\nWrite in the style of Alfred, Lord Tennyson: Use Victorian poetic forms, rich imagery, musical language, themes of love and loss, and classical references. Be melodious and romantic.',
            'walt-whitman': '\\n\\nWrite in the style of Walt Whitman: Use free verse, celebrate democracy and individualism, employ catalogs and repetition, and write with expansive, inclusive vision of America.',
            'toni-morrison': '\\n\\nWrite in the style of Toni Morrison: Focus on African American experience, use lyrical prose, explore themes of identity and trauma, and employ magical realism elements.',
            'cormac-mccarthy': '\\n\\nWrite in the style of Cormac McCarthy: Use sparse punctuation, biblical language, violent imagery, philosophical themes, and stark, beautiful descriptions of landscape.',
            'james-baldwin': '\\n\\nWrite in the style of James Baldwin: Address racial and social issues, use passionate, eloquent prose, explore themes of identity and belonging, and write with moral urgency.',
            'kathy-acker': '\\n\\nWrite in the style of Kathy Acker: Use experimental techniques, pastiche and appropriation, punk aesthetics, feminist themes, and challenge traditional narrative structures.',
            'jorge-luis-borges': '\\n\\nWrite in the style of Jorge Luis Borges: Create labyrinthine narratives, use philosophical themes, employ magical realism, and explore concepts of infinity and reality.',
            'friedrich-nietzsche': '\\n\\nWrite in the style of Friedrich Nietzsche: Use aphoristic style, challenge conventional morality, employ passionate philosophical argument, and explore themes of power and self-creation.',
            'simone-de-beauvoir': '\\n\\nWrite in the style of Simone de Beauvoir: Focus on existentialist themes, feminist philosophy, clear analytical prose, and exploration of women\'s experiences and freedom.',
            'ludwig-wittgenstein': '\\n\\nWrite in the style of Ludwig Wittgenstein: Use precise, analytical language, explore language and meaning, employ numbered propositions when appropriate, and be philosophically rigorous.',
            'michel-foucault': '\\n\\nWrite in the style of Michel Foucault: Analyze power structures, use archaeological method, explore social institutions, and employ dense, theoretical language with historical analysis.',
            'soren-kierkegaard': '\\n\\nWrite in the style of Søren Kierkegaard: Explore existential themes, use indirect communication, employ irony and paradox, and focus on individual experience and faith.',
            'dalai-lama': '\\n\\nWrite in the style of the Dalai Lama: Use compassionate, wise tone, focus on universal human values, employ simple yet profound language, and emphasize peace and understanding.',
            'jean-paul-sartre': '\\n\\nWrite in the style of Jean-Paul Sartre: Explore existentialist themes, focus on freedom and responsibility, use philosophical dialogue, and address political engagement.',
            'franz-kafka': '\\n\\nWrite in the style of Franz Kafka: Create surreal, nightmarish scenarios, use bureaucratic absurdity, explore themes of alienation and guilt, and employ precise, unsettling prose.',
            'albert-camus': '\\n\\nWrite in the style of Albert Camus: Explore absurdist themes, use clear, direct prose, focus on human dignity in meaningless universe, and address moral questions.',
            'robert-frost': '\\n\\nWrite in the style of Robert Frost: Use rural New England imagery, employ traditional poetic forms, explore themes of nature and human choice, and write with deceptive simplicity.',
            'cs-lewis': '\\n\\nWrite in the style of C.S. Lewis: Combine Christian themes with fantasy elements, use clear, accessible prose, employ allegory and symbolism, and focus on moral and spiritual growth.',
            'virginia-woolf': '\\n\\nWrite in the style of Virginia Woolf: Use stream of consciousness, explore interior psychology, employ lyrical prose, and focus on women\'s experiences and modernist techniques.',
            'jules-verne': '\\n\\nWrite in the style of Jules Verne: Create adventure narratives, use scientific speculation, employ detailed descriptions of technology and exploration, and maintain optimistic view of progress.',
            'oscar-wilde': '\\n\\nWrite in the style of Oscar Wilde: Use wit and paradox, employ aesthetic philosophy, create brilliant dialogue, and focus on beauty, art, and social satire.',
            'ray-bradbury': '\\n\\nWrite in the style of Ray Bradbury: Use poetic science fiction, focus on human emotion, employ nostalgic themes, and create atmospheric, lyrical descriptions.',
            'george-orwell': '\\n\\nWrite in the style of George Orwell: Use clear, direct prose, focus on political themes, employ dystopian scenarios, and maintain commitment to truth and social justice.',
            'mary-shelley': '\\n\\nWrite in the style of Mary Shelley: Use gothic romance, explore scientific themes, focus on moral consequences of knowledge, and employ emotional, dramatic narrative.',
            'mark-twain': '\\n\\nWrite in the style of Mark Twain: Use vernacular speech, employ humor and satire, focus on American themes, and combine entertainment with social criticism.',
            'leo-tolstoy': '\\n\\nWrite in the style of Leo Tolstoy: Use epic scope, explore moral and spiritual themes, employ psychological realism, and focus on human nature and social issues.',
            'herman-melville': '\\n\\nWrite in the style of Herman Melville: Use philosophical themes, employ maritime imagery, explore existential questions, and combine adventure with deep symbolism.',
            'italo-calvino': '\\n\\nWrite in the style of Italo Calvino: Use postmodern techniques, employ fantasy and fable elements, focus on storytelling itself, and combine playfulness with philosophical depth.',
            'flannery-oconnor': '\\n\\nWrite in the style of Flannery O\'Connor: Use Southern Gothic elements, employ dark humor, focus on religious themes, and create grotesque yet sympathetic characters.',
            'dante-alighieri': '\\n\\nWrite in the style of Dante Alighieri: Use allegorical structure, employ medieval Christian themes, create epic scope, and combine personal journey with universal significance.'
        };

        return authorStyles[authorStyle] || '';
    }

    updateAuthorStyleIndicator(authorStyle) {
        // Remove existing indicator
        const existingIndicator = document.querySelector('.author-style-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Add new indicator if style is selected
        if (authorStyle) {
            const chatHeader = document.querySelector('.chat-header h2');
            if (chatHeader) {
                const indicator = document.createElement('div');
                indicator.className = 'author-style-indicator';
                indicator.textContent = `Writing in the style of ${this.getAuthorDisplayName(authorStyle)}`;
                chatHeader.parentNode.insertBefore(indicator, chatHeader.nextSibling);
            }
        }
    }

    getAuthorDisplayName(authorStyle) {
        const displayNames = {
            'chuck-palahniuk': 'Chuck Palahniuk',
            'charles-bukowski': 'Charles Bukowski',
            'hunter-s-thompson': 'Hunter S. Thompson',
            'jack-kerouac': 'Jack Kerouac',
            'edgar-allan-poe': 'Edgar Allan Poe',
            'william-shakespeare': 'William Shakespeare',
            'saul-williams': 'Saul Williams',
            'sylvia-plath': 'Sylvia Plath',
            'howard-zinn': 'Howard Zinn',
            'ernest-hemingway': 'Ernest Hemingway',
            'alfred-lord-tennyson': 'Alfred, Lord Tennyson',
            'walt-whitman': 'Walt Whitman',
            'toni-morrison': 'Toni Morrison',
            'cormac-mccarthy': 'Cormac McCarthy',
            'james-baldwin': 'James Baldwin',
            'kathy-acker': 'Kathy Acker',
            'jorge-luis-borges': 'Jorge Luis Borges',
            'friedrich-nietzsche': 'Friedrich Nietzsche',
            'simone-de-beauvoir': 'Simone de Beauvoir',
            'ludwig-wittgenstein': 'Ludwig Wittgenstein',
            'michel-foucault': 'Michel Foucault',
            'soren-kierkegaard': 'Søren Kierkegaard',
            'dalai-lama': 'Dalai Lama (Tenzin Gyatso)',
            'jean-paul-sartre': 'Jean-Paul Sartre',
            'franz-kafka': 'Franz Kafka',
            'albert-camus': 'Albert Camus',
            'robert-frost': 'Robert Frost',
            'cs-lewis': 'C.S. Lewis',
            'virginia-woolf': 'Virginia Woolf',
            'jules-verne': 'Jules Verne',
            'oscar-wilde': 'Oscar Wilde',
            'ray-bradbury': 'Ray Bradbury',
            'george-orwell': 'George Orwell',
            'mary-shelley': 'Mary Shelley',
            'mark-twain': 'Mark Twain',
            'leo-tolstoy': 'Leo Tolstoy',
            'herman-melville': 'Herman Melville',
            'italo-calvino': 'Italo Calvino',
            'flannery-oconnor': 'Flannery O\'Connor',
            'dante-alighieri': 'Dante Alighieri'
        };

        return displayNames[authorStyle] || authorStyle;
    }

    showErrorModal(message) {
        const modal = document.getElementById('errorModal');
        const errorMessage = document.getElementById('errorMessage');
        
        if (modal && errorMessage) {
            errorMessage.textContent = message;
            modal.classList.remove('hidden');
        }
    }
    
    closeErrorModal() {
        const modal = document.getElementById('errorModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    goToApiKeys() {
        this.closeErrorModal();
        // Navigate to API Keys view
        if (window.app && window.app.switchView) {
            window.app.switchView('api-keys');
        }
    }
}

// Initialize Chat Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing ChatManager...');
    window.chatManager = new ChatManager();
});

// Also try to initialize immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    console.log('DOM already loaded, initializing ChatManager immediately...');
    window.chatManager = new ChatManager();
}

