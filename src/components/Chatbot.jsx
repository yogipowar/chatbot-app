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
  const [websiteId, setWebsiteId] = useState(null);
  const [activeUrl, setActiveUrl] = useState("");

  const [showHumanDrawer, setShowHumanDrawer] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasHumanChat, setHasHumanChat] = useState(false);
  const [activeTab, setActiveTab] = useState("ai"); // "ai" | "human"
  const [conversationId, setConversationId] = useState(null);
  const [humanMessages, setHumanMessages] = useState([]);
  const [isHumanLoading, setIsHumanLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Get websiteId from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("websiteId");

    console.log("Website ID:", id);

    if (id) {
      setWebsiteId(id);
      fetchUserDetails(id);
    }
  }, []);

  // Fetch User Details
  const fetchUserDetails = async (id) => {
    try {
      const response = await fetch(
        "https://chatbotapi.scrollosoft.com/users/get-details",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ id })
        }
      );

      const result = await response.json();

      if (result.status && result.user) {
        const urlToUse = result.user.sitemapUrl || result.user.pdfUrl;
        setActiveUrl(urlToUse);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!activeUrl) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Chatbot is still loading data. Please try again."
        }
      ]);
      return;
    }

    const userQuestion = input;

    setMessages((prev) => [...prev, { sender: "user", text: userQuestion }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://chatbotapi.scrollosoft.com/api/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            question: userQuestion,
            url: activeUrl
          })
        }
      );

      const data = await response.json();
      const botResponse = data?.data || "No response received";

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botResponse
        }
      ]);

      // 🔹 Detect human connect
      if (botResponse === "CONNECTING TO HUMAN") {
        setShowHumanDrawer(true);
      }

    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Connection error. Please try again later."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitHumanRequest = async () => {
    if (!email) return;

    setIsSubmitting(true);

    try {
      // 🔹 1. USER AUTH
      const authResponse = await fetch(
        "https://chatbotapi.scrollosoft.com/users/user-auth",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: email,
            password: email
          })
        }
      );

      const authResult = await authResponse.json();
      console.log("Auth Result:", authResult);

      if (authResult?.status && authResult?.user?.id) {
        const userId = authResult.user.id;
        setUserId(userId)

        // ✅ CLOSE DRAWER IMMEDIATELY
        setShowHumanDrawer(false);
        setEmail("");

        // 🔹 2. CALL LIST API
        const listResponse = await fetch(
          `https://chatbotapi.scrollosoft.com/conversation/list?adminId=${websiteId}&userId=${userId}`
        );

        const listResult = await listResponse.json();
        console.log("List Result:", listResult);

        if (listResult?.status) {
          // 🔥 Set hasHumanChat based on whether data is not empty
          setHasHumanChat(listResult.data.length > 0);

          // 🔥 CASE 1: NO CONVERSATION → CREATE
          if (listResult.data.length === 0) {
            // 🔹 CREATE CONVERSATION
            const createResponse = await fetch(
              "https://chatbotapi.scrollosoft.com/conversation/create",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  message: "hello, i have a query again",
                  userId: userId,
                  adminId: websiteId
                })
              }
            );

            const createResult = await createResponse.json();
            console.log("Create Result:", createResult);

            // 🔹 CALL LIST AGAIN
            const newListResponse = await fetch(
              `https://chatbotapi.scrollosoft.com/conversation/list?adminId=${websiteId}&userId=${userId}`
            );

            const newListResult = await newListResponse.json();
            console.log("Updated List Result:", newListResult);

            if (newListResult?.status && newListResult.data.length > 0) {
              const conversationId = newListResult.data[0].id;

              setConversationId(conversationId);
              setHasHumanChat(true);
              fetchHumanMessages(conversationId);

              console.log("New Conversation ID:", conversationId);
            }

          } else {
            // 🔥 EXISTING CONVERSATION
            const conversationId = listResult.data[0].id;
            setConversationId(conversationId);
            setHasHumanChat(true);
            fetchHumanMessages(conversationId);

            console.log("Conversation ID:", conversationId);
          }
        }
      } else {
        console.log("Auth failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setIsSubmitting(false);
  };


  const fetchHumanMessages = async (convId) => {
    if (!convId) return;

    setIsHumanLoading(true);

    try {
      const response = await fetch(
        `https://chatbotapi.scrollosoft.com/conversation/message-list?conversationId=${convId}`
      );

      const result = await response.json();

      console.log("Human Messages:", result);

      if (result?.status) {
        setHumanMessages(result.data || []);
      }
    } catch (error) {
      console.error("Error fetching human messages:", error);
    }

    setIsHumanLoading(false);
  };

  // Enter key handler
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (activeTab === "ai") {
        sendMessage();
      } else {
        sendHumanMessage();
      }
    }
  };

  useEffect(() => {
    if (activeTab === "human" && conversationId) {
      fetchHumanMessages(conversationId);
    }
  }, [activeTab, conversationId]);

  useEffect(() => {
    let interval;

    if (activeTab === "human" && conversationId) {
      fetchHumanMessages(conversationId);

      // interval = setInterval(() => {
      //   fetchHumanMessages(conversationId);
      // }, 5000); 
    }

    return () => clearInterval(interval);
  }, [activeTab, conversationId]);

  const sendHumanMessage = async () => {
    if (!input.trim() || !conversationId) return;

    const userMessage = input;

    // ✅ Optimistic UI (instant show)
    const tempMessage = {
      text: userMessage,
      messageById: userId,
    };

    setHumanMessages((prev) => [...prev, tempMessage]);
    setInput("");

    try {
      const response = await fetch(
        "https://chatbotapi.scrollosoft.com/conversation/send-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: userMessage,
            messageById: userId, // 🔥 IMPORTANT
            conversationId: conversationId
          })
        }
      );

      const result = await response.json();
      console.log("Send Message Result:", result);

      // ✅ Optional: re-fetch to sync with DB
      fetchHumanMessages(conversationId);

    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  return (
    <div className="chatbotContainer">

      <div className="chatHeader">
        <div className="headerLeft">
          <span>AI Support</span>
        </div>

        <button
          className="humanConnectBtn"
          onClick={() =>
            window.open("https://scrollosoft.com/contact", "_blank")
          }
        >
          <span>Human Connect</span>
        </button>
      </div>

      {hasHumanChat && (
        <div className="chatTabs">
          <button
            className={activeTab === "ai" ? "activeTab" : ""}
            onClick={() => setActiveTab("ai")}
          >
            AI Chat
          </button>
          <button
            className={activeTab === "human" ? "activeTab" : ""}
            onClick={() => setActiveTab("human")}
          >
            Human Chat
          </button>
        </div>
      )}


      <div className="chatMessages">

        {/* 🔹 AI CHAT */}
        {activeTab === "ai" &&
          messages.map((msg, index) => (
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

        {/* 🔹 HUMAN CHAT */}
        {activeTab === "human" && (
          <div className="humanChatContainer">
            {isHumanLoading ? (
              <p>Loading messages...</p>
            ) : humanMessages.length === 0 ? (
              <p>No messages yet</p>
            ) : (
              humanMessages.map((msg, index) => {
                const isUser = msg.messageById === userId;

                return (
                  <div key={index} className={`messageRow ${isUser ? "user" : "bot"}`}>

                    {!isUser && (
                      <div className="botIcon">
                        <BotIcon isTyping={false} />
                      </div>
                    )}

                    <div className={`messageBubble ${isUser ? "py" : ""}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {isLoading && activeTab === "ai" && (
          <div className="messageRow bot">
            <div className="botIcon">
              <BotIcon isTyping={true} />
            </div>

            <div className="messageBubble typing-container">
              <div className="typing-dots">
                Thinking <span>.</span><span>.</span><span>.</span>
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
          disabled={isLoading || !activeUrl}
          className="auto-expand-input"
        />

        <button onClick={sendMessage} disabled={isLoading || !activeUrl}>
          <Send size={18} />
        </button>
      </div>

      {/* 🔹 HUMAN CONNECT DRAWER */}
      {showHumanDrawer && (
        <div className="humanDrawerOverlay">
          <div className="humanDrawer">

            <h3>Connect With Human</h3>
            <p>Please enter your email and our team will contact you.</p>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button onClick={submitHumanRequest} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>

            <button
              className="drawerClose"
              onClick={() => setShowHumanDrawer(false)}
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default Chatbot;