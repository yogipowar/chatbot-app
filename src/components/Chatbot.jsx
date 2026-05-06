import { useState, useEffect, useRef } from "react";
import { Send, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./chatbot.css";
import BotIcon from "./BotIcon";
import { socket } from "../components/socket";
import { useSound } from "react-sounds";
import notification from "../../public/notification2.mp3";

const saveChatToLocal = (question, data) => {
  try {
    const existing = JSON.parse(localStorage.getItem("chatHistory")) || [];

    const newEntry = {
      question,
      data,
      timestamp: new Date().toISOString(),
    };

    const updated = [...existing, newEntry].slice(-50);
    localStorage.setItem("chatHistory", JSON.stringify(updated));
  } catch (err) {
    console.error("LocalStorage Error:", err);
  }
};

const saveChatAgainstUserId = (userId, userEmail, conversationId = null) => {
  try {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    const storageKey = `chatHistory_${userId}`;

    if (chatHistory.length === 0) return;

    const existingUserChats =
      JSON.parse(localStorage.getItem(storageKey)) || {
        userId,
        email: userEmail,
        chatSessions: [],
      };

    const newSession = {
      conversationId,
      chats: chatHistory.map((chat) => ({
        question: chat.question,
        aiResponse: chat.data,
        timestamp: chat.timestamp,
      })),
      createdAt: new Date().toISOString(),
    };

    const updatedUserChats = {
      ...existingUserChats,
      userId,
      email: userEmail,
      chatSessions: [...(existingUserChats.chatSessions || []), newSession],
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(storageKey, JSON.stringify(updatedUserChats));
  } catch (err) {
    console.error("User chat localStorage error:", err);
  }
};

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you today?" },
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
  const [isActive, setIsActive] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  const [emailOnlyMode, setEmailOnlyMode] = useState(false);
  const [conversationStatus, setConversationStatus] = useState(null);

  const textareaRef = useRef(null);
  const aiMessagesEndRef = useRef(null);
  const humanMessagesEndRef = useRef(null);
  const convIdRef = useRef(conversationId);

  const { play } = useSound(notification);

  const isAiHistoryMessage = (msg) => {
    const text = String(msg.text || msg.message || msg.messageText || "").trim();

    return (
      String(msg.messageById) === "ai_bot" ||
      String(msg.messageById) === "ai_history_user" ||
      text.startsWith("[AI_HISTORY_USER]") ||
      text.startsWith("[AI_HISTORY_BOT]") ||
      /^Chat\s+\d+\s+User:/i.test(text) ||
      (text.includes("User:") && text.includes("AI:"))
    );
  };


  useEffect(() => {
    const savedHasHumanChat = localStorage.getItem("hasHumanChat");
    const savedUserId = localStorage.getItem("userId");
    const savedConversationId = localStorage.getItem("conversationId");
    const savedEmail = localStorage.getItem("userEmail");

    if (!savedEmail) {
      setEmailOnlyMode(true);
      setShowHumanDrawer(true);
    } else {
      setEmail(savedEmail);
    }

    if (savedHasHumanChat === "true") {
      setHasHumanChat(true);
    }

    if (savedUserId) {
      setUserId(savedUserId);
    }

    if (savedConversationId) {
      setConversationId(savedConversationId);
      checkConversationStatus(savedConversationId);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // const id = params.get("websiteId");

    const id = "97"

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
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        }
      );

      const result = await response.json();

      if (result.status && result.user) {
        const adminMail =
          result.user.email ||
          result.user.username ||
          result.user.adminEmail ||
          result.user.contactEmail ||
          "";

        setAdminEmail(adminMail);

        const urlToUse = result.user.sitemapUrl || result.user.pdfUrl;
        setActiveUrl(urlToUse);

        setIsActive(Number(result.user.isActive) === 1);

        const primary = result.user.primaryColor || "#009DE1";
        const secondary = result.user.secondaryColor || "#0488c1";

        document.documentElement.style.setProperty("--primary-color", primary);
        document.documentElement.style.setProperty("--secondary-color", secondary);

        const position = result.user.chatPosition || "right";
        const chatbot = document.querySelector(".chatbotContainer");

        if (chatbot) {
          chatbot.style.left = position === "left" ? "0px" : "auto";
          chatbot.style.right = position === "right" ? "0px" : "auto";
        }
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const sendEmailToAdmin = async (userMessage) => {
    const savedEmail = localStorage.getItem("userEmail");

    try {
      const res = await fetch("https://chatbotapi.scrollosoft.com/users/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: adminEmail,
          subject: "New Chat Request",
          text: `New message from ${savedEmail || "User"}: ${userMessage}`,
          html: `
            <h2>New Chat Request</h2>
            <p><strong>User Email:</strong> ${savedEmail || "Not available"}</p>
            <p><strong>Message:</strong> ${userMessage}</p>
          `,
        }),
      });

      const data = await res.json();
      console.log("Admin Email Response:", data);
    } catch (err) {
      console.error("Admin email failed:", err);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  useEffect(() => {
    if (activeTab === "ai") {
      aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (activeTab === "human") {
      humanMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, humanMessages, activeTab]);

  const handleConnectToHuman = async () => {
    if (hasHumanChat && conversationId) {
      setHasHumanChat(true);
      setActiveTab("human");
      fetchHumanMessages(conversationId);
      return;
    }

    const savedEmail = localStorage.getItem("userEmail");

    if (savedEmail) {
      setEmail(savedEmail);
      setEmailOnlyMode(false);
      await submitHumanRequest(savedEmail);
    } else {
      setEmailOnlyMode(false);
      setShowHumanDrawer(true);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!activeUrl) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Chatbot is still loading data. Please try again.",
        },
      ]);
      return;
    }

    const userQuestion = input;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userQuestion,
        createdAt: new Date().toISOString(),
      },
    ]);

    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("https://chatbotapi.scrollosoft.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userQuestion,
          url: activeUrl,
        }),
      });

      const data = await response.json();
      const botResponse = data?.data || "No response received";

      saveChatToLocal(userQuestion, botResponse);

      if (conversationId && userId) {
        await sendChatMessageToConversation(
          `[AI_HISTORY_USER] ${userQuestion}`,
          "ai_history_user",
          conversationId
        );

        await sendChatMessageToConversation(
          `[AI_HISTORY_BOT] ${botResponse}`,
          "ai_bot",
          conversationId
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botResponse,
        },
      ]);

      const normalizedBotResponse = String(botResponse).trim().toUpperCase();

      if (normalizedBotResponse === "CONNECTING TO HUMAN") {
        await handleConnectToHuman();
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Connection error. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const createLead = async (leadEmail) => {
    if (!leadEmail) return;

    try {
      const response = await fetch(
        "https://chatbotapi.scrollosoft.com/users/create-lead",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            adminId: Number(websiteId),
            email: leadEmail,
          }),
        }
      );

      const result = await response.json();
      console.log("Create Lead Result:", result);
    } catch (error) {
      console.error("Create lead failed:", error);
    }
  };

  const submitHumanRequest = async (emailOverride) => {
    const finalEmail = emailOverride || email;

    if (!finalEmail) return;

    localStorage.setItem("userEmail", finalEmail);
    await createLead(finalEmail);

    if (emailOnlyMode && !emailOverride) {
      setShowHumanDrawer(false);
      setEmailOnlyMode(false);
      return;
    }

    setIsSubmitting(true);

    try {
      if (!socket.id) {
        await new Promise((resolve) => {
          socket.once("connect", resolve);

          if (socket.connected) resolve();

          setTimeout(resolve, 3000);
        });
      }

      const authResponse = await fetch(
        "https://chatbotapi.scrollosoft.com/users/user-auth",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: finalEmail,
            password: finalEmail,
            socketId: socket.id,
          }),
        }
      );

      const authResult = await authResponse.json();
      console.log("Auth Result:", authResult);

      if (authResult?.status && authResult?.user?.id) {
        const loggedInUserId = authResult.user.id;

        setUserId(loggedInUserId);
        localStorage.setItem("userId", loggedInUserId);
        localStorage.setItem("userEmail", finalEmail);
        setShowHumanDrawer(false);

        const listResponse = await fetch(
          `https://chatbotapi.scrollosoft.com/conversation/list?adminId=${websiteId}&userId=${loggedInUserId}`
        );

        const listResult = await listResponse.json();
        console.log("List Result:", listResult);

        if (listResult?.status) {
          const hasChat = listResult.data.length > 0;

          if (hasChat) {
            const existingConversationId = listResult.data[0].id;

            setConversationId(existingConversationId);
            localStorage.setItem("conversationId", existingConversationId);

            setHasHumanChat(true);
            localStorage.setItem("hasHumanChat", "true");

            saveChatAgainstUserId(
              loggedInUserId,
              finalEmail,
              existingConversationId
            );

            await sendStoredAiChatToConversation(
              existingConversationId,
              loggedInUserId
            );

            await fetchHumanMessages(existingConversationId);
            setActiveTab("human");

            console.log("Existing Conversation ID:", existingConversationId);
          } else {
            const createResponse = await fetch(
              "https://chatbotapi.scrollosoft.com/conversation/create",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userId: loggedInUserId,
                  adminId: websiteId,
                }),
              }
            );

            const createResult = await createResponse.json();
            console.log("Create Result:", createResult);

            const newListResponse = await fetch(
              `https://chatbotapi.scrollosoft.com/conversation/list?adminId=${websiteId}&userId=${loggedInUserId}`
            );

            const newListResult = await newListResponse.json();
            console.log("Updated List Result:", newListResult);

            if (newListResult?.status && newListResult.data.length > 0) {
              const newConversationId = newListResult.data[0].id;

              setConversationId(newConversationId);
              localStorage.setItem("conversationId", newConversationId);

              setHasHumanChat(true);
              localStorage.setItem("hasHumanChat", "true");

              saveChatAgainstUserId(
                loggedInUserId,
                finalEmail,
                newConversationId
              );

              await sendStoredAiChatToConversation(
                newConversationId,
                loggedInUserId
              );

              await fetchHumanMessages(newConversationId);
              setActiveTab("human");

              console.log("New Conversation ID:", newConversationId);
            }
          }
        }
      } else {
        console.log("Auth failed");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
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
        const onlyHumanMessages = (result.data || []).filter(
          (msg) => !isAiHistoryMessage(msg)
        );

        setHumanMessages(onlyHumanMessages);

        if (result.data?.length > 0) {
          setConversationStatus(
            result.data[result.data.length - 1].conversationStatus
          );
        }
      }
    } catch (error) {
      console.error("Error fetching human messages:", error);
    } finally {
      setIsHumanLoading(false);
    }
  };

  const checkConversationStatus = async (convId) => {
    if (!convId) return;

    try {
      const response = await fetch(
        `https://chatbotapi.scrollosoft.com/conversation/message-list?conversationId=${convId}`
      );

      const result = await response.json();

      if (result?.status && result.data.length > 0) {
        const status = result.data[result.data.length - 1].conversationStatus;

        setConversationStatus(status);

        if (status === "closed") {
          setHasHumanChat(false);
          localStorage.setItem("hasHumanChat", "false");

          setActiveTab("ai");
          setConversationId(null);
          localStorage.removeItem("conversationId");
        } else {
          setHasHumanChat(true);
          localStorage.setItem("hasHumanChat", "true");
        }
      }
    } catch (error) {
      console.error("Error checking conversation status:", error);
    }
  };

  useEffect(() => {
    convIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    const handleIncomingMessage = async (data) => {
      console.log("Incoming:", data);

      const currentId = convIdRef.current;
      const incomingConvId = data.conversationId || data.convId || data.id;

      if (String(data.messageById) !== String(userId)) {
        play();
      }

      if (currentId && incomingConvId) {
        if (String(incomingConvId) !== String(currentId)) {
          return;
        }
      }

      try {
        const response = await fetch(
          `https://chatbotapi.scrollosoft.com/conversation/message-list?conversationId=${currentId}`
        );

        const result = await response.json();

        if (result?.status) {
          const messages = (result.data || []).filter(
            (msg) => !isAiHistoryMessage(msg)
          );

          setHumanMessages(messages);

          if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            setConversationStatus(lastMsg.conversationStatus);

            if (lastMsg.conversationStatus === "closed") {
              setHasHumanChat(false);
              setActiveTab("ai");
              setConversationId(null);
              setHumanMessages([]);

              localStorage.setItem("hasHumanChat", "false");
              localStorage.removeItem("conversationId");
            }
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    socket.on("receive_message", handleIncomingMessage);

    return () => {
      socket.off("receive_message", handleIncomingMessage);
    };
  }, [userId, play]);

  useEffect(() => {
    if (!conversationId) return;

    checkConversationStatus(conversationId);
  }, [conversationId]);

  useEffect(() => {
    const handleConnect = async () => {
      console.log("User Connected:", socket.id);

      const savedEmail = localStorage.getItem("userEmail");

      if (savedEmail) {
        await fetch("https://chatbotapi.scrollosoft.com/users/user-auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: savedEmail,
            password: savedEmail,
            socketId: socket.id,
          }),
        });

        console.log("User re-auth done");
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
    humanMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [humanMessages.length]);

  useEffect(() => {
    if (activeTab === "human" && conversationId) {
      fetchHumanMessages(conversationId);
      checkConversationStatus(conversationId);
    }
  }, [activeTab, conversationId]);

  const sendHumanMessage = async () => {
    if (!input.trim() || !conversationId) return;

    const userMessage = input;

    const shouldSendAdminEmail =
      conversationStatus === "pending" &&
      !localStorage.getItem(`adminEmailSent_${conversationId}`);

    const tempMessage = {
      text: userMessage,
      messageById: userId,
      createdAt: new Date().toISOString(),
    };

    setHumanMessages((prev) => [...prev, tempMessage]);
    setInput("");

    try {
      const response = await fetch(
        "https://chatbotapi.scrollosoft.com/conversation/send-message",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userMessage,
            messageById: userId,
            conversationId,
          }),
        }
      );

      const result = await response.json();
      console.log("Send Message Result:", result);

      if (shouldSendAdminEmail && adminEmail) {
        await sendEmailToAdmin(userMessage);
        localStorage.setItem(`adminEmailSent_${conversationId}`, "true");
      }
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  const clearChatHistory = () => {
    localStorage.removeItem("chatHistory");

    setMessages([
      { sender: "bot", text: "Hello! How can I help you with today?" },
    ]);
  };

  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];

    if (savedChats.length > 0) {
      const formattedMessages = [];

      savedChats.forEach((chat) => {
        formattedMessages.push({
          sender: "user",
          text: chat.question,
        });

        formattedMessages.push({
          sender: "bot",
          text: chat.data,
        });
      });

      setMessages(formattedMessages);
    }
  }, []);

  const formatMessageTime = (dateString) => {
    if (!dateString) return "";

    const now = new Date();
    const msgTime = new Date(dateString);

    const diffMs = now - msgTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 2) return "Now";

    if (diffMinutes >= 2 && diffMinutes <= 5) {
      return `${diffMinutes} min ago`;
    }

    if (diffHours < 24) {
      return msgTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return msgTime.toLocaleString([], {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sendStoredAiChatToConversation = async (convId, loggedInUserId) => {
    try {
      const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

      if (!convId || !loggedInUserId || chatHistory.length === 0) return;

      const alreadySentKey = `aiChatSent_${convId}`;
      if (localStorage.getItem(alreadySentKey) === "true") return;

      for (const chat of chatHistory) {
        if (chat.question) {
          await sendChatMessageToConversation(
            `[AI_HISTORY_USER] ${chat.question}`,
            "ai_history_user",
            convId
          );
        }

        if (chat.data) {
          await sendChatMessageToConversation(
            `[AI_HISTORY_BOT] ${chat.data}`,
            "ai_bot",
            convId
          );
        }
      }

      localStorage.setItem(alreadySentKey, "true");
    } catch (error) {
      console.error("Send stored AI chat error:", error);
    }
  };


  const sendChatMessageToConversation = async (message, messageById, convId) => {
    if (!message || !convId || !messageById) return;

    try {
      await fetch("https://chatbotapi.scrollosoft.com/conversation/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          messageById,
          conversationId: convId,
        }),
      });
    } catch (error) {
      console.error("Send chat history message error:", error);
    }
  };

  return (
    <div className="chatbotContainer">
      <div className="chatHeader">
        <div className="headerLeft">
          <span>AI Support</span>
        </div>

        {activeTab === "ai" && (
          <button className="clearChatBtn" onClick={clearChatHistory}>
            Clear Chat
          </button>
        )}
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

      {!isActive ? (
        <div className="inactive-banner">
          Chatbot is currently inactive. Please contact the admin.
        </div>
      ) : (
        <div className="chatMessages">
          {activeTab === "ai" && (
            <>
              {messages.map((msg, index) => (
                <div key={index} className={`messageRow ${msg.sender}`}>
                  {msg.sender === "bot" && (
                    <div className="botIcon">
                      <BotIcon isTyping={false} />
                    </div>
                  )}

                  <div
                    className={`messageBubble ${msg.sender === "bot" ? "" : "py"
                      }`}
                  >
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

          {activeTab === "human" && (
            <div className="humanChatContainer">
              {isHumanLoading ? (
                <p>Loading messages...</p>
              ) : humanMessages.length === 0 ? (
                <p>No messages yet</p>
              ) : (
                <>
                  {humanMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`messageRow ${String(msg.messageById) === String(userId)
                        ? "user"
                        : "bot"
                        }`}
                    >
                      {String(msg.messageById) === String(websiteId) && (
                        <div className="botIcon">
                          <User size={18} />
                        </div>
                      )}

                      <div className="messageBubble">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>

                        {msg.text?.trim().length > 0 && (
                          <div className="msg-time">
                            {formatMessageTime(msg.createdAt)}
                          </div>
                        )}

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
                  Thinking <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isActive ? (
        <div className="chatInputArea">
          <textarea
            ref={textareaRef}
            rows="1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask something..."
            disabled={!isActive || isLoading || !activeUrl}
            className="auto-expand-input"
          />

          <button
            onClick={activeTab === "ai" ? sendMessage : sendHumanMessage}
            disabled={!isActive || isLoading || !activeUrl}
          >
            <Send size={18} />
          </button>
        </div>
      ) : null}

      {showHumanDrawer && (
        <div className="humanDrawerOverlay">
          <div className="humanDrawer">
            <h3>{emailOnlyMode ? "Enter Your Email" : "Connect With Human"}</h3>

            <p>
              {emailOnlyMode
                ? "Please enter your email to continue."
                : "Please enter your email and our team will contact you."}
            </p>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="drawerButtons">
              <button
                className="drawerSubmit"
                onClick={() => submitHumanRequest()}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>

              {!emailOnlyMode && (
                <button
                  className="drawerClose"
                  onClick={() => setShowHumanDrawer(false)}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
