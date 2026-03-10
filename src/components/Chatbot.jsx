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

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const question = input;
    setInput("");

    try {
      const response = await fetch(
        "https://chatbotapi.scrollosoft.com/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            question: question,
            websiteId: websiteId
          })
        }
      );

      const data = await response.json();

      const botMessage = {
        sender: "bot",
        text: data?.data || "No response received"
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      const errorMessage = {
        sender: "bot",
        text: "Something went wrong. Please try again."
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
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