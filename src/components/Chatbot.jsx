import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./chatbot.css";
import BotIcon from "./BotIcon";

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you with Scrollosoft today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // New States for User Details
  const [websiteId, setWebsiteId] = useState(null);
  const [activeUrl, setActiveUrl] = useState(""); // Stores pdfUrl or sitemapUrl

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // 1. Initial Load: Get websiteId and then fetch User Details
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("websiteId") || window.chatbotWebsiteId;

    console.log("Website ID on load:", id);

    if (id) {
      setWebsiteId(id);
      fetchUserDetails(id);
    }
  }, []);


  const fetchUserDetails = async (id) => {
    try {
      const response = await fetch(`https://chatbotapi.scrollosoft.com/users/get-details?id=${id}`);
      const result = await response.json();

      console.log("User details response:", result);

      if (result.status && result.user) {
        const urlToUse = result.user.sitemapUrl || result.user.pdfUrl;

        console.log("URL selected:", urlToUse);

        setActiveUrl(urlToUse);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
   const id = params.get("websiteId") || window.chatbotWebsiteId;

    console.log("Website ID:", id);

    if (id) {
      setWebsiteId(id);
      fetchUserDetails(id);
    }
  }, []);

  // Auto-resize Logic for Textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // 2. Updated Send Message Logic
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!activeUrl) {
      setMessages(prev => [...prev, {
        sender: "bot",
        text: "Chatbot is still loading data. Please try again."
      }]);
      return;
    }
    const userQuestion = input;

    console.log("Question:", userQuestion);
    console.log("URL sent to API:", activeUrl);

    setMessages((prev) => [...prev, { sender: "user", text: userQuestion }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("https://chatbotapi.scrollosoft.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userQuestion,
          url: activeUrl // Passing the URL fetched from the details API
        })
      });

      const data = await response.json();

      setMessages(prev => [...prev, {
        sender: "bot",
        text: data?.data || "No response received"
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        sender: "bot",
        text: "Connection error. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chatbotContainer">
      <div className="chatHeader">
        <div className="headerLeft">
          <span>AI Support</span>
        </div>
        <button className="humanConnectBtn" onClick={() => window.open('https://scrollosoft.com/contact', '_blank')}>
          <span>Human Connect</span>
        </button>
      </div>

      <div className="chatMessages">
        {messages.map((msg, index) => (
          <div key={index} className={`messageRow ${msg.sender}`}>
            {msg.sender === "bot" && (
              <div className="botIcon">
                <BotIcon isTyping={false} />
              </div>
            )}
            <div className={`messageBubble ${msg.sender === "bot" ? "" : "py"}`}>
              {msg.sender === "bot" ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {msg.text}
                </ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
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