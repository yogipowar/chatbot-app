import { useState, useEffect, useRef } from "react";
import { Send, Sparkles } from "lucide-react";
import "./chatbot.css";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [websiteId, setWebsiteId] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("websiteId");
    setWebsiteId(id);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const botMessage = {
        sender: "bot",
        text: "Hello! How can I help you?"
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);

    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chatbotContainer">

      <div className="chatHeader">
        <span>AI Support</span>
      </div>

      <div className="chatMessages">

        {messages.map((msg, index) => (
          <div key={index} className={`messageRow ${msg.sender}`}>

            {msg.sender === "bot" && (
              <div className="botIcon">
                <Sparkles size={18} />
              </div>
            )}

            <div className="messageBubble">
              {msg.text}
            </div>

          </div>
        ))}

        <div ref={messagesEndRef}></div>

      </div>

      <div className="chatInputArea">

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask something..."
        />

        <button onClick={sendMessage}>
          <Send size={18} />
        </button>

      </div>

    </div>
  );
}

export default Chatbot;