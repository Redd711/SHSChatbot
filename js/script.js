// =====================================================
// CONFIGURATION — Replace with your Vercel backend URL
// =====================================================
const API_URL = "YOUR_VERCEL_BACKEND_URL/api/chat";

// ===== DOM Elements =====
const chatMessages = document.getElementById("chatMessages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const themeToggle = document.getElementById("themeToggle");

// ===== State =====
let conversationHistory = [];
let isWaitingForResponse = false;

// ===== Theme =====

function loadTheme() {
    const saved = localStorage.getItem("uphsl-chatbot-theme") || "light";
    document.documentElement.setAttribute("data-theme", saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("uphsl-chatbot-theme", next);
}

loadTheme();
themeToggle.addEventListener("click", toggleTheme);

// ===== Textarea auto-resize =====

messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + "px";
    sendBtn.disabled = !messageInput.value.trim() || isWaitingForResponse;
});

// ===== Time formatting =====

function getTimeString() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ===== Markdown-lite renderer =====

function renderMarkdown(text) {
    let html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
    html = html.replace(/`(.+?)`/g, "<code>$1</code>");
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    const lines = html.split("\n");
    let result = "";
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const bulletMatch = line.match(/^[\s]*[-*•]\s+(.*)/);
        const numberedMatch = line.match(/^[\s]*(\d+)[.)]\s+(.*)/);

        if (bulletMatch) {
            if (!inList) { result += "<ul>"; inList = "ul"; }
            result += `<li>${bulletMatch[1]}</li>`;
        } else if (numberedMatch) {
            if (!inList) { result += "<ol>"; inList = "ol"; }
            result += `<li>${numberedMatch[2]}</li>`;
        } else {
            if (inList) { result += `</${inList}>`; inList = false; }
            if (line.trim() === "") {
                result += "</p><p>";
            } else {
                result += line + "<br>";
            }
        }
    }
    if (inList) result += `</${inList}>`;

    result = "<p>" + result + "</p>";
    result = result.replace(/<p><\/p>/g, "").replace(/<br><\/p>/g, "</p>").replace(/<p><br>/g, "<p>");

    return result;
}

// ===== Add message to UI =====

function addMessage(role, text) {
    const time = getTimeString();
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${role}`;

    if (role === "bot") {
        messageDiv.innerHTML = `
            <img src="assets/logo.png" alt="Bot" class="message-avatar">
            <div class="message-content">
                <div class="bubble">${renderMarkdown(text)}</div>
                <span class="message-time">${time}</span>
            </div>`;
    } else {
        const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="bubble">${escaped}</div>
                <span class="message-time">${time}</span>
            </div>`;
    }

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// ===== Typing indicator =====

function showTypingIndicator() {
    const wrapper = document.createElement("div");
    wrapper.className = "typing-indicator-wrapper";
    wrapper.id = "typingIndicator";
    wrapper.innerHTML = `
        <img src="assets/logo.png" alt="Bot" class="message-avatar">
        <div class="typing-bubble">
            <span></span><span></span><span></span>
        </div>`;
    chatMessages.appendChild(wrapper);
    scrollToBottom();
}

function removeTypingIndicator() {
    const el = document.getElementById("typingIndicator");
    if (el) el.remove();
}

// ===== Scroll =====

function scrollToBottom() {
    requestAnimationFrame(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// ===== Send message =====

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || isWaitingForResponse) return;

    addMessage("user", text);
    conversationHistory.push({ role: "user", content: text });

    messageInput.value = "";
    messageInput.style.height = "auto";
    sendBtn.disabled = true;
    isWaitingForResponse = true;

    showTypingIndicator();

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: conversationHistory }),
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `Server error (${res.status})`);
        }

        const data = await res.json();
        const reply = data.response || "Sorry, I could not generate a response.";

        conversationHistory.push({ role: "model", content: reply });
        removeTypingIndicator();
        addMessage("bot", reply);
    } catch (err) {
        removeTypingIndicator();
        addMessage("bot", `Something went wrong. Please try again later.\n\n(${err.message})`);
        console.error("Chat error:", err);
    } finally {
        isWaitingForResponse = false;
        sendBtn.disabled = !messageInput.value.trim();
        messageInput.focus();
    }
}

// ===== Event listeners =====

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// ===== Welcome message =====

addMessage(
    "bot",
    "Hello! I'm the **UPHSL SHS Chatbot**. I can help you with information about the **University of Perpetual Help System Laguna — Senior High School Department** at the Jonelta Campus.\n\nFeel free to ask me about:\n- Programs and strands offered\n- Enrollment and admission\n- School facilities and contact info\n- Events and campus life\n- Career opportunities per strand\n\nHow can I help you today?"
);
messageInput.focus();
