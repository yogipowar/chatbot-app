import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import "./chatbot.css";
import BotIcon from "./BotIcon";

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you with Scrollosoft today?" }
  ]);
  const [input, setInput] = useState("");
  const [websiteId, setWebsiteId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null); // Ref for auto-resize

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("websiteId");
    setWebsiteId(id);
  }, []);

  // Auto-resize logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height
      const scrollHeight = textareaRef.current.scrollHeight;
      // Set height but cap it via CSS max-height
      textareaRef.current.style.height = scrollHeight + "px";
    }
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const userQuestion = input;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("https://chatbotapi.scrollosoft.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion, websiteId })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { sender: "bot", text: data?.data || "No response" }]);
    } catch (e) {
      setMessages(prev => [...prev, { sender: "bot", text: `I received your message: "${userQuestion}". This is a mock response because the live API is currently facing CORS restrictions.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    // If Enter is pressed without Shift, send the message
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
                <BotIcon isTyping={false} />
              </div>
            )}
            <div className="messageBubble">{msg.text}</div>
          </div>
        ))}

        {isLoading && (
          <div className="messageRow bot">
            <div className="botIcon">
              <BotIcon isTyping={true} />
            </div>
            <div className="messageBubble typing-container">
              <div className="typing-dots">Thinking 
                <span> .</span><span>.</span><span>.</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef}></div>
      </div>

      <div className="chatInputArea">
        <textarea
          ref={textareaRef}
          rows="1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask something..."
          disabled={isLoading}
          className="auto-expand-input"
        />
        <button onClick={sendMessage} disabled={isLoading}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

export default Chatbot;