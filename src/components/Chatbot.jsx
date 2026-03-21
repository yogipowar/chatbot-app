import { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./chatbot.css";
import BotIcon from "./BotIcon";
import { socket } from "../components/socket"

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
  const [activeTab, setActiveTab] = useState("ai");
  const [conversationId, setConversationId] = useState(null);
  const [humanMessages, setHumanMessages] = useState([]);
  const [isHumanLoading, setIsHumanLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const textareaRef = useRef(null);

  const aiMessagesEndRef = useRef(null);
  const humanMessagesEndRef = useRef(null);


  useEffect(() => {
    const savedHasHumanChat = localStorage.getItem("hasHumanChat");
    const savedUserId = localStorage.getItem("userId");
    const savedConversationId = localStorage.getItem("conversationId");

    if (savedHasHumanChat === "true") {
      setHasHumanChat(true);
    }

    if (savedUserId) {
      setUserId(savedUserId);
    }

    if (savedConversationId) {
      setConversationId(savedConversationId);
    }
  }, []);

  useEffect(() => {
    // const params = new URLSearchParams(window.location.search);
    // const id = '33';

    const params = new URLSearchParams(window.location.search);
    const id = params.get("websiteId");

    console.log("Website ID:", id);

    if (id) {
      setWebsiteId(id);
      fetchUserDetails(id);
    }
  }, []);

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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  useEffect(() => {
    if (activeTab === "ai") {
      aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (activeTab === "human") {
      humanMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, humanMessages, activeTab]);



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

      // Detect human connect
      if (botResponse === "CONNECTING TO HUMAN") {
        if (hasHumanChat && conversationId) {
          // Already connected → just switch tab
          setActiveTab("human");
          fetchHumanMessages(conversationId);
        } else {
          // First time → show email drawer
          setShowHumanDrawer(true);
        }
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

      if (!socket.id) {
        console.log("Socket ID null, waiting for connection...");
        await new Promise((resolve) => {
          socket.once("connect", () => {
            resolve();
          });

          if (socket.connected) resolve();

          setTimeout(resolve, 3000);
        });
      }

      const currentSocketId = socket.id;
      console.log("Using Socket ID:", currentSocketId);

      const authResponse = await fetch(
        "https://chatbotapi.scrollosoft.com/users/user-auth",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: email,
            password: email,
            socketId: socket.id
          })
        }
      );

      const authResult = await authResponse.json();
      console.log("Auth Result:", authResult);


      if (authResult?.status && authResult?.user?.id) {
        const userId = authResult.user.id;
        setUserId(userId);
        localStorage.setItem("userId", userId);
        localStorage.setItem("userEmail", email);

        setShowHumanDrawer(false);
        setEmail("");

        // CALL LIST API
        const listResponse = await fetch(
          `https://chatbotapi.scrollosoft.com/conversation/list?adminId=${websiteId}&userId=${userId}`
        );

        const listResult = await listResponse.json();
        console.log("List Result:", listResult);

        if (listResult?.status) {
          const hasChat = listResult.data.length > 0;
          setHasHumanChat(hasChat);
          localStorage.setItem("hasHumanChat", hasChat.toString());

          // CASE 1: NO CONVERSATION → CREATE
          if (!hasChat) {
            // CREATE CONVERSATION
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

            // CALL LIST AGAIN
            const newListResponse = await fetch(
              `https://chatbotapi.scrollosoft.com/conversation/list?adminId=${websiteId}&userId=${userId}`
            );

            const newListResult = await newListResponse.json();
            console.log("Updated List Result:", newListResult);

            if (newListResult?.status && newListResult.data.length > 0) {
              const conversationId = newListResult.data[0].id;

              setConversationId(conversationId);
              localStorage.setItem("conversationId", conversationId);
              setHasHumanChat(true);
              localStorage.setItem("hasHumanChat", "true");
              fetchHumanMessages(conversationId);

              console.log("New Conversation ID:", conversationId);
            }
          } else {
            // EXISTING CONVERSATION
            const conversationId = listResult.data[0].id;
            setConversationId(conversationId);
            localStorage.setItem("conversationId", conversationId);
            setHasHumanChat(true);
            localStorage.setItem("hasHumanChat", "true");
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

  // 1. Add this Ref at the top with your other hooks
  const convIdRef = useRef(conversationId);

  // 2. Keep the Ref in sync with the state
  useEffect(() => {
    convIdRef.current = conversationId;
  }, [conversationId]);

  // 3. The Updated Listener
  useEffect(() => {
    const handleIncomingMessage = async (data) => {
      console.log("🔥 Incoming:", data);

      const currentId = convIdRef.current;

      if (currentId) {
        // ✅ Fetch latest messages
        const response = await fetch(
          `https://chatbotapi.scrollosoft.com/conversation/message-list?conversationId=${currentId}`
        );

        const result = await response.json();

        if (result?.status) {
          setHumanMessages(result.data || []);
        }
      }
    };

    socket.on("receive_message", handleIncomingMessage);

    return () => {
      socket.off("receive_message", handleIncomingMessage);
    };
  }, []);

  useEffect(() => {
    const handleConnect = async () => {
      console.log("✅ User Connected:", socket.id);

      const savedEmail = localStorage.getItem("userEmail");

      if (savedEmail) {
        await fetch(
          "https://chatbotapi.scrollosoft.com/users/user-auth",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: savedEmail,
              password: savedEmail,
              socketId: socket.id,
            }),
          }
        );

        console.log("✅ User re-auth done");
      }
    };

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
  }, []);

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
    const container = humanMessagesEndRef.current;

    if (container) {
      container.scrollIntoView({ behavior: "smooth" });
    }
  }, [humanMessages.length]); // 👈 only when new msg count changes

  useEffect(() => {
    if (activeTab === "human" && conversationId) {
      fetchHumanMessages(conversationId);
    }
  }, [activeTab, conversationId]);

  const sendHumanMessage = async () => {
    if (!input.trim() || !conversationId) return;

    const userMessage = input;

    // Optimistic UI: Append the new message immediately
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
            messageById: userId,
            conversationId: conversationId
          })
        }
      );

      const result = await response.json();
      console.log("Send Message Result:", result);


    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  useEffect(() => {
  const handleConnect = async () => {
    console.log("👤 User Connected:", socket.id);

    const userEmail = localStorage.getItem("userEmail");

    if (userEmail) {
      await fetch("https://chatbotapi.scrollosoft.com/users/user-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userEmail,
          password: userEmail,
          socketId: socket.id,
        }),
      });

      console.log("✅ User socket mapped");
    }
  };

  socket.on("connect", handleConnect);

  return () => {
    socket.off("connect", handleConnect);
  };
}, []);

  return (
    <div className="chatbotContainer">
      <div className="chatHeader">
        <div className="headerLeft">
          <span>AI Support</span>
        </div>


      </div>

      {hasHumanChat && (
        <div className="chatTabs">
          <button
            className={`aiTab ${activeTab === "ai" ? "activeTab" : ""}`}
            onClick={() => setActiveTab("ai")}
          >
            AI Chat
          </button>
          <button
            className={`humanTab ${activeTab === "human" ? "activeTab" : ""}`}
            onClick={() => setActiveTab("human")}
          >
            Human Chat
          </button>
        </div>
      )}

      <div className="chatMessages">
        {/* AI CHAT */}
        {activeTab === "ai" && (
          <>
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
            <div ref={aiMessagesEndRef} />
          </>
        )}


        {/* HUMAN CHAT */}
        {activeTab === "human" && (
          <div className="humanChatContainer">
            {isHumanLoading ? (
              <p>Loading messages...</p>
            ) : humanMessages.length === 0 ? (
              <p>No messages yet</p>
            ) : (
              <>
                {humanMessages.map((msg, index) => (
                  <div key={index} className={`messageRow ${msg.messageById == userId ? "user" : "bot"}`}>
                    {msg.messageById == websiteId && (
                      <div className="botIcon">
                        {/* <BotIcon isTyping={false} /> */}
                        <User size={18} />
                      </div>
                    )}
                    <div className={`messageBubble `}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                <div ref={humanMessagesEndRef} />
              </>
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

        <button onClick={activeTab === "ai" ? sendMessage : sendHumanMessage} disabled={isLoading || !activeUrl}>
          <Send size={18} />
        </button>
      </div>

      {/* HUMAN CONNECT DRAWER */}
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
            <div className="drawerButtons">
              <button className="drawerSubmit" onClick={submitHumanRequest} disabled={isSubmitting}>
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
        </div>
      )}
    </div>
  );
}

export default Chatbot;
