document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.createElement('div');
    wrapper.id = 'gumbo-chat-wrapper';
    wrapper.innerHTML = `
        <div id="gumbo-cta-label">Have any questions or want to schedule an appointment? chat with Gumbo the AI Assistant</div>
        <div id="gumbo-chat-bubble">
            <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
        </div>
        <div id="gumbo-chat-window">
            <div class="chat-header">
                <h4>Ask Gumbo</h4>
                <span id="close-chat" style="cursor:pointer">&times;</span>
            </div>
            <div id="chat-messages">
                <div class="message bot">Hello! I'm Gumbo, Dr. Gulshan's AI assistant. Need to schedule an appointment? Please ask! I can answer any questions you may have or help you get started with a consultation.</div>
                <div id="typing-indicator" class="typing">Gumbo is thinking...</div>
            </div>
            <div class="chat-disclaimer">
                This assistant provides information about the practice only and cannot offer therapy or clinical advice.
            </div>
            <form id="chat-form" class="chat-input-area">
                <input type="text" id="chat-input" placeholder="Type a message..." autocomplete="off">
                <button type="submit">Send</button>
            </form>
        </div>
    `;
    document.body.appendChild(wrapper);

    const bubble = document.getElementById('gumbo-chat-bubble');
    const chatWindow = document.getElementById('gumbo-chat-window');
    const closeBtn = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const messageContainer = document.getElementById('chat-messages');
    const typingIndicator = document.getElementById('typing-indicator');

    // Generate or get unique session ID
    let sessionId = localStorage.getItem('gumbo_session_id');
    if (!sessionId) {
        sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('gumbo_session_id', sessionId);
    }

    bubble.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        // Add user message immediately
        addMessage(text, 'user');
        chatInput.value = '';

        // Show typing indicator
        typingIndicator.style.display = 'block';
        messageContainer.scrollTop = messageContainer.scrollHeight;

        // Determine API URL based on environment (Live Server uses 5500/5501)
        const isLocalDev = window.location.port === '5500' || window.location.port === '5501';
        const API_URL = isLocalDev ? 'http://localhost:3000/api/chat' : '/api/chat';
        
        console.log(`[Gumbo Debug] Current port: ${window.location.port}, isLocalDev: ${isLocalDev}`);
        console.log(`[Gumbo Debug] Fetching from: ${API_URL}`);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, sessionId })
            });

            const data = await response.json();
            typingIndicator.style.display = 'none';
            
            if (data.reply) {
                // Use streaming effect for bot
                await streamMessage(data.reply, 'bot');
            } else {
                addMessage("I'm sorry, I'm having trouble connecting to my brain.", 'bot');
            }
        } catch (error) {
            typingIndicator.style.display = 'none';
            addMessage("Error: The server isn't running. Start server.js to talk to Gumbo.", 'bot');
        }
    });

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        messageContainer.insertBefore(msgDiv, typingIndicator);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    // Streaming Effect Function
    function streamMessage(text, sender) {
        return new Promise(resolve => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${sender}`;
            msgDiv.textContent = ''; // Start empty
            messageContainer.insertBefore(msgDiv, typingIndicator);
            
            let i = 0;
            const speed = 20; // ms per character

            function typeChar() {
                if (i < text.length) {
                    msgDiv.textContent += text.charAt(i);
                    i++;
                    messageContainer.scrollTop = messageContainer.scrollHeight;
                    setTimeout(typeChar, speed);
                } else {
                    resolve(); // Animation done
                }
            }
            
            typeChar();
        });
    }
});
