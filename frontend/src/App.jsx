import "./App.css";
import { useState, useEffect, useRef } from "react";
import { FaMicrophoneAlt } from "react-icons/fa";
import { jsPDF } from "jspdf";

function App() {
const [messages, setMessages] = useState(() => {
  const saved = localStorage.getItem("chatHistory");
  

  return saved
  ? JSON.parse(saved)
  : [
      {
        sender: "bot",
        text: "Hello! Welcome to Customer Support.\nHow can I help you today?",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ];
    });

const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const chatEndRef = useRef(null);
const fileInputRef = useRef(null);
const sendMessage = async () => {
  if (!message.trim()) return;

  // Show user message
  const userMessage = {
  sender: "user",
  text: message,
  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
};
  setMessages((prev) => [...prev, userMessage]);
  setLoading(true);

  try {
    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
setLoading(false);

// Speak the reply
const speech = new SpeechSynthesisUtterance(data.reply);
speech.lang = "en-US";
speech.rate = 1;
speech.pitch = 1;
window.speechSynthesis.speak(speech);

// Show bot reply
setMessages((prev) => [
  ...prev,
  {
  sender: "bot",
  text: data.reply,
  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  }),
},
]);
    
  } catch (err) {
    setLoading(false);
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "❌ Unable to connect to server." },
    ]);
  }

  setMessage("");
};
useEffect(() => {
  chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, loading]);
useEffect(() => {
  localStorage.setItem("chatHistory", JSON.stringify(messages));
}, [messages]);
const startListening = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech Recognition is not supported.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onstart = () => {
    alert("Listening...");
  };

  recognition.onresult = (event) => {
    setMessage(event.results[0][0].transcript);
  };

  recognition.onerror = (event) => {
    alert("Error: " + event.error);
  };

  recognition.start();
};
const downloadChat = () => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("AI Customer Support Chat", 20, 20);

  let y = 35;

  messages.forEach((msg) => {
    const text = `${msg.sender.toUpperCase()}: ${msg.text}`;

    // Wrap long text automatically
    const lines = doc.splitTextToSize(text, 170);

    doc.text(lines, 20, y);

    // Leave space after each message
    y += lines.length * 8 + 6;

    // Add new page if needed
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  });


  doc.save("CustomerSupportChat.pdf");
};
const handleFileUpload = (event) => {
  const file = event.target.files[0];

  if (!file) return;

  setMessages((prev) => [
    ...prev,
    {
      sender: "user",
      text: `📎 Uploaded: ${file.name}`,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
};

  return (
    <div className="app">
      <div className="sidebar">
        <div className="logo">
          🤖 <span>AI Support</span>
        </div>

        <button
  className="new-chat"
  onClick={() => {
    setMessages([
  {
    sender: "bot",
    text: "Hello! Welcome to Customer Support.\nHow can I help you today?",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  },
]);
    setMessage("");
    setLoading(false);
    localStorage.removeItem("chatHistory");
  }}
>
  + New Chat
</button>
<h3 style={{ marginTop: "30px", marginBottom: "15px" }}>
  Chat History
</h3>

<div className="history">
  {messages
    .filter(msg => msg.sender === "user")
    .map((msg, index) => (
      <p key={index}>
        {msg.text.length > 25
          ? msg.text.substring(0, 25) + "..."
          : msg.text}
      </p>
    ))}
</div>

        
      </div>

      <div className="chat-section">
        <div className="chat-header">
  <h2>AI Customer Support Bot</h2>
  <p>🟢 Online • Ready to Help</p>
  

  <button onClick={downloadChat} className="download-btn">
    📄 Download Chat
  </button>
</div>

        <div className="chat-box">
  {messages.map((msg, index) => (
    <div
      key={index}
      className={msg.sender === "bot" ? "bot-message" : "user-message"}
    >
      {msg.sender === "bot" ? "🤖 " : ""}
      

<div>{msg.text}</div>

<small
  style={{
    display: "block",
    textAlign: "right",
    marginTop: "6px",
    fontSize: "11px",
    opacity: "0.7",
  }}
>
  {msg.time}
</small>

    </div>
  ))}

  {loading && (
    <div className="bot-message">
      🤖 Typing...
    </div>
  )}
  <div ref={chatEndRef}></div>



         
        </div>
        <div className="quick-actions">
  <button onClick={() => setMessage("Where is my order?")}>
    📦 Order Status
  </button>

  <button onClick={() => setMessage("I want a refund")}>
    💳 Refund
  </button>

  <button onClick={() => setMessage("How can I contact support?")}>
    📞 Contact Support
  </button>

  <button onClick={() => setMessage("Tell me about your products")}>
    ❓ Product Query
  </button>
</div>

        <div className="input-area">
          <input
  type="text"
  placeholder="Type your message..."
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") sendMessage();
  }}

/>
<input
  type="file"
  ref={fileInputRef}
  style={{ display: "none" }}
  onChange={handleFileUpload}
/>

<button onClick={() => fileInputRef.current.click()}>
  📎
</button>
          <button onClick={startListening}>
  🎤
</button>
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;