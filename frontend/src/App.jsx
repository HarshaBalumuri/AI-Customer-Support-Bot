import "./App.css";
import { useState, useEffect, useRef } from "react";
import { FaMicrophoneAlt, FaTrashAlt } from "react-icons/fa";
import { jsPDF } from "jspdf";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import axios from "axios";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const [showSignup, setShowSignup] = useState(false);
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
const [chatHistory, setChatHistory] = useState(() => {
  const savedHistory = localStorage.getItem("chatHistoryList");
  return savedHistory ? JSON.parse(savedHistory) : [];
});
const [currentChat, setCurrentChat] = useState(0);
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
    const token = localStorage.getItem("token");

const res = await fetch("http://localhost:5000/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
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
useEffect(() => {
  localStorage.setItem(
    "chatHistoryList",
    JSON.stringify(chatHistory)
  );
}, [chatHistory]);
useEffect(() => {
  const loadChats = async () => {
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      const res = await axios.get("http://localhost:5000/api/chat", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const loadedMessages = [];

      res.data.forEach((chat) => {
        loadedMessages.push({
          sender: "user",
          text: chat.message,
          time: new Date(chat.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });

        loadedMessages.push({
          sender: "bot",
          text: chat.reply,
          time: new Date(chat.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      });

      if (loadedMessages.length > 0) {
        setMessages(loadedMessages);
      }
    } catch (err) {
      console.log(err);
    }
  };

  loadChats();
}, []);
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
const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("chatHistory");
  localStorage.removeItem("chatHistoryList");

  window.location.reload();
};
if (!user) {
  return showSignup ? (
    <Signup setShowSignup={setShowSignup} />
  ) : (
    <Login setShowSignup={setShowSignup} />
  );
}

  return (
    <div className="app">
      <div className="sidebar">
        <div className="logo">
  🤖 <span>AI Support</span>
</div>

<div
  style={{
    textAlign: "center",
    marginTop: "20px",
    marginBottom: "20px",
    color: "white",
  }}
>
  <div
    style={{
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      background: "#8b5cf6",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "24px",
      margin: "0 auto 10px",
    }}
  >
    👤
  </div>

  <h3>{user.name}</h3>
  <small>{user.email}</small>
</div>

        <button
  className="new-chat"
  onClick={() => {
     if (messages.length > 1) {
    setChatHistory((prev) => [...prev, messages]);
  }

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
}}
>
  + New Chat
</button>
<h3 style={{ marginTop: "30px", marginBottom: "15px" }}>
  Chat History
</h3>

<div className="history">
  {chatHistory.map((chat, index) => (
  <div
    key={index}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "10px",
    }}
  >
    <p
      onClick={() => {
        setMessages(chat);
        setCurrentChat(index);
      }}
      style={{
        cursor: "pointer",
        margin: 0,
        flex: 1,
      }}
    >
      {chat.find(msg => msg.sender === "user")?.text.substring(0, 25) || "New Chat"}...
    </p>

    <button
      onClick={() => {
        setChatHistory(chatHistory.filter((_, i) => i !== index));
      }}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: "18px",
      }}
    >
      <FaTrashAlt />
    </button>
  </div>
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
  <button
  onClick={handleLogout}
  className="logout-btn"
>
  🚪 Logout
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