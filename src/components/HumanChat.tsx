import { useEffect, useState, useRef } from "react";
import "./HumanChat.css";
import AdminSidebar from "./AdminSidebar";
import { useNavigate } from "react-router-dom";
import { socket } from "../components/socket";
import { useSound } from "react-sounds";
import notification from "../../public/notification1.mp3";
import { ChevronLeft } from "lucide-react";

const HumanChat = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

  const selectedIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevConversationsRef = useRef<any[]>([]);

  const adminId = Number(localStorage.getItem("adminId"));
  const navigate = useNavigate();
  const { play } = useSound(notification);

  const getAiChatHistoryForConversation = (conv: any) => {
    const conversationId = conv.conversationId?.toString();
    const userId = conv.userId?.toString();

    if (!conversationId && !userId) return [];

    try {
      let storedData: any = null;

      if (userId) {
        storedData = JSON.parse(
          localStorage.getItem(`chatHistory_${userId}`) || "null"
        );
      }

      if (!storedData) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);

          if (!key?.startsWith("chatHistory_")) continue;

          const value = JSON.parse(localStorage.getItem(key) || "null");

          const matchedSession = value?.chatSessions?.find(
            (session: any) =>
              session.conversationId?.toString() === conversationId
          );

          if (matchedSession) {
            storedData = value;
            break;
          }
        }
      }

      if (!storedData?.chatSessions?.length) return [];

      const session =
        storedData.chatSessions.find(
          (item: any) =>
            item.conversationId?.toString() === conversationId
        ) || storedData.chatSessions[storedData.chatSessions.length - 1];

      if (!session?.chats?.length) return [];

      const aiHistoryMessages: any[] = [];

      session.chats.forEach((chat: any, index: number) => {
        aiHistoryMessages.push({
          id: `ai-history-user-${index}`,
          text: chat.question,
          messageById: conv.userId,
          createdAt: chat.timestamp,
          isAiHistory: true,
        });

        aiHistoryMessages.push({
          id: `ai-history-bot-${index}`,
          text: chat.aiResponse,
          messageById: "ai_bot",
          createdAt: chat.timestamp,
          isAiHistory: true,
        });
      });

      return aiHistoryMessages;
    } catch (err) {
      console.error("AI chat history read error:", err);
      return [];
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(
        `https://chatbotapi.scrollosoft.com/conversation/admin-conversation-list?adminId=${adminId}`
      );

      const data = await res.json();

      if (data.status) {
        setConversations(data.data);
        prevConversationsRef.current = data.data;
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(
    (conv) => conv.status === statusFilter
  );

  const fetchMessages = async (conversationId: number | string, conv?: any) => {
    try {
      const res = await fetch(
        `https://chatbotapi.scrollosoft.com/conversation/message-list?conversationId=${conversationId}`
      );

      const data = await res.json();

      if (data.status) {
        const humanMessages = data.data
          .filter((msg: any) => msg.text && msg.text.trim() !== "")
          .map((msg: any) => ({
            ...msg,
            conversationId,
            createdAt: msg.createdAt,
          }));

        const aiHistoryMessages = conv
          ? getAiChatHistoryForConversation(conv)
          : [];

        setMessages([...aiHistoryMessages, ...humanMessages]);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const handleSelectConversation = async (conv: any) => {
    const cid = conv.conversationId.toString().trim();

    setSelectedConversation(conv);
    selectedIdRef.current = cid;

    socket.emit("join_room", { conversationId: cid });

    try {
      if (conv.status === "pending") {
        const res = await fetch(
          "https://chatbotapi.scrollosoft.com/conversation/chnage-status",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "accepted",
              conversationId: conv.conversationId,
            }),
          }
        );

        const data = await res.json();
        console.log("Status Update Response:", data);

        setConversations((prev) =>
          prev.map((c) =>
            c.conversationId === conv.conversationId
              ? { ...c, status: "accepted" }
              : c
          )
        );

        setSelectedConversation((prev: any) =>
          prev ? { ...prev, status: "accepted" } : prev
        );

        const userEmail = conv.username;

        if (userEmail) {
          try {
            await fetch("https://chatbotapi.scrollosoft.com/users/send-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: userEmail,
                subject: "Chat Accepted",
                text: "Admin accepted your request.",
                html: `<h2>Hi</h2><p>Your chat request has been accepted.</p>`,
              }),
            });
          } catch (err) {
            console.error("Email failed:", err);
          }
        }
      }
    } catch (err) {
      console.error("Update error:", err);
    }

    fetchMessages(cid, conv);
  };

  const handleCloseConversation = async () => {
    if (!selectedConversation) return;

    const convId = selectedConversation.conversationId;

    try {
      await fetch("https://chatbotapi.scrollosoft.com/conversation/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Admin closed this chat",
          messageById: adminId,
          conversationId: convId,
        }),
      });

      await fetch("https://chatbotapi.scrollosoft.com/conversation/chnage-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "closed",
          conversationId: convId,
        }),
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === convId ? { ...c, status: "closed" } : c
        )
      );

      setSelectedConversation((prev: any) =>
        prev ? { ...prev, status: "closed" } : prev
      );

      setMessages((prev) => [
        ...prev,
        {
          text: "Admin closed this chat",
          messageById: adminId,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      console.error("Close error:", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedConversation) return;

    const text = input;
    const convId = selectedConversation.conversationId;

    setMessages((prev) => [
      ...prev,
      {
        text,
        messageById: adminId,
        createdAt: new Date().toISOString(),
      },
    ]);

    setInput("");

    try {
      await fetch("https://chatbotapi.scrollosoft.com/conversation/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          messageById: adminId,
          conversationId: convId,
        }),
      });
    } catch (err) {
      console.error("Send Error:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleIncomingMessage = () => {
      fetch(
        `https://chatbotapi.scrollosoft.com/conversation/admin-conversation-list?adminId=${adminId}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (!data.status) return;

          const newConversations: any[] = data.data;
          const prev = prevConversationsRef.current;
          const currentOpenId = selectedIdRef.current?.toString();

          newConversations.forEach((newConv) => {
            const oldConv = prev.find(
              (c) =>
                c.conversationId?.toString() ===
                newConv.conversationId?.toString()
            );

            const isNewMessage =
              !oldConv || oldConv.messageId !== newConv.messageId;

            const isOpenConversation =
              currentOpenId === newConv.conversationId?.toString();

            if (isNewMessage && isOpenConversation) {
              if (newConv.messageText && newConv.messageText.trim() !== "") {
                setMessages((prev) => {
                  const isDuplicate = prev.some(
                    (m) =>
                      (m.text || m.messageText) === newConv.messageText &&
                      m.messageId === newConv.messageId
                  );

                  if (isDuplicate) return prev;

                  return [
                    ...prev,
                    {
                      text: newConv.messageText,
                      messageById: newConv.userId,
                      conversationId: newConv.conversationId,
                      messageId: newConv.messageId,
                      createdAt: new Date().toISOString(),
                    },
                  ];
                });
              }

              play();
            }
          });

          prevConversationsRef.current = newConversations;
          setConversations(newConversations);
        })
        .catch((err) => console.error("Fetch error:", err));
    };

    socket.on("receive_message", handleIncomingMessage);

    return () => {
      socket.off("receive_message", handleIncomingMessage);
    };
  }, [adminId, play]);

  useEffect(() => {
    if (!selectedConversation) return;

    const updated = conversations.find(
      (c) =>
        c.conversationId?.toString() ===
        selectedConversation.conversationId?.toString()
    );

    if (updated) {
      setSelectedConversation(updated);
    }
  }, [conversations]);

  useEffect(() => {
    const handleConnect = async () => {
      const email = localStorage.getItem("adminemail");
      const password = localStorage.getItem("adminpassword");

      if (email && password) {
        await fetch("https://chatbotapi.scrollosoft.com/users/admin-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: email,
            password,
            socketId: socket.id,
          }),
        });

        if (selectedIdRef.current) {
          socket.emit("join_room", { conversationId: selectedIdRef.current });
        }
      }
    };

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
  }, []);

  const handleBack = () => {
    setSelectedConversation(null);
    setMessages([]);
    selectedIdRef.current = null;
  };

  const pendingCount = conversations.filter((c) => c.status === "pending").length;
  const acceptedCount = conversations.filter((c) => c.status === "accepted").length;
  const closedCount = conversations.filter((c) => c.status === "closed").length;

  const formatMessageTime = (dateString: string) => {
    if (!dateString) return "";

    const now = new Date();
    const msgTime = new Date(dateString);

    const diffMs = now.getTime() - msgTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 2) return "Now";
    if (diffMinutes >= 2 && diffMinutes <= 5) return `${diffMinutes} min ago`;

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

  return (
    <div className="human-chat-layout">
      <AdminSidebar
        onLogout={() => {
          localStorage.removeItem("isLoggedIn");
          navigate("/login");
        }}
      />

      <div className="chat-layout">
        <div className="chat-sidebar">
          <h3>Conversations</h3>

          <div className="chat-filters">
            <button
              className={statusFilter === "pending" ? "active" : ""}
              onClick={() => setStatusFilter("pending")}
            >
              Pending <span>({pendingCount})</span>
            </button>

            <button
              className={statusFilter === "accepted" ? "active" : ""}
              onClick={() => setStatusFilter("accepted")}
            >
              Accepted <span>({acceptedCount})</span>
            </button>

            <button
              className={statusFilter === "closed" ? "active" : ""}
              onClick={() => setStatusFilter("closed")}
            >
              Closed <span>({closedCount})</span>
            </button>
          </div>

          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className={`chat-item ${
                selectedConversation?.conversationId?.toString() ===
                conv.conversationId?.toString()
                  ? "active"
                  : ""
              }`}
              onClick={() => handleSelectConversation(conv)}
            >
              <div className="chat-item-header">
                <span className="username">{conv.username}</span>
              </div>
              <p>{conv.messageText}</p>
            </div>
          ))}
        </div>

        <div className="chat-main">
          {!selectedConversation ? (
            <div className="no-chat">Select a conversation</div>
          ) : (
            <>
              <div className="chat-header">
                <div className="chat-header-left">
                  <button className="back-btn" onClick={handleBack}>
                    <ChevronLeft />
                  </button>
                  <h4>{selectedConversation.username}</h4>
                </div>

                {selectedConversation.status !== "closed" && (
                  <button onClick={handleCloseConversation} className="close-btn">
                    Close Chat
                  </button>
                )}
              </div>

              <div className="chat-messages">
                {messages.map((msg, i) => {
                  const isAdmin = Number(msg.messageById) === adminId;
                  const isAiBot = msg.messageById === "ai_bot";

                  return (
                    <div
                      className={`msg-row ${isAdmin ? "right" : "left"}`}
                      key={msg.id || msg.messageId || i}
                    >
                      {msg.isAiHistory && (
                        <div className="ai-history-label">
                          {isAiBot ? "AI response" : "User asked AI"}
                        </div>
                      )}

                      <div
                        className={`chat-bubble ${isAdmin ? "right" : "left"} ${
                          msg.isAiHistory ? "ai-history-bubble" : ""
                        }`}
                      >
                        {msg.text || msg.messageText}
                      </div>

                      <div className="msg-time">
                        {formatMessageTime(msg.createdAt)}
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input">
                <input
                  type="text"
                  value={input}
                  disabled={selectedConversation?.status === "closed"}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type message..."
                />

                <button
                  onClick={sendMessage}
                  disabled={selectedConversation?.status === "closed"}
                >
                  Send Message
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HumanChat;
