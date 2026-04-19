import { useEffect, useState, useRef } from "react";
import "./HumanChat.css";
import AdminSidebar from "./AdminSidebar";
import { useNavigate } from "react-router-dom";
import { socket } from "../components/socket";
import { useSound } from 'react-sounds';
import notification from "../../public/notification1.mp3";
import SubscriptionModal from "./SubscriptionModal";
import { ChevronLeft } from "lucide-react";

const HumanChat = () => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [statusFilter, setStatusFilter] = useState("pending"); // default
    // This is the source of truth for the socket
    const selectedIdRef = useRef<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const adminId = Number(localStorage.getItem("adminId"));
    const navigate = useNavigate();
    const { play } = useSound(notification);

    // --- API: Fetch Sidebar ---
    const fetchConversations = async () => {
        try {
            const res = await fetch(
                `https://chatbotapi.scrollosoft.com/conversation/admin-conversation-list?adminId=${adminId}`
            );
            const data = await res.json();

            if (data.status) {
                setConversations(data.data);
                prevConversationsRef.current = data.data; // ✅ ADD THIS LINE
            }
        } catch (err) {
            console.error("❌ Error fetching conversations:", err);
        }
    };

    const filteredConversations = conversations.filter(
        (conv) => conv.status === statusFilter
    );

    // --- API: Fetch Messages ---
    const fetchMessages = async (conversationId: number | string) => {
        try {
            const res = await fetch(
                `https://chatbotapi.scrollosoft.com/conversation/message-list?conversationId=${conversationId}`
            );
            const data = await res.json();

            console.log("💬 Messages:", data);

            if (data.status) {
                const filteredMessages = data.data
                    .filter((msg: any) => msg.text && msg.text.trim() !== "")
                    .map((msg: any) => ({
                        ...msg,
                        conversationId: conversationId, // ✅ attach manually
                        createdAt: msg.createdAt,
                    }));

                setMessages(filteredMessages);
            }
        } catch (err) {
            console.error("❌ Error fetching messages:", err);
        }
    };

    // const handleSelectConversation = (conv: any) => {
    //     const cid = conv.conversationId.toString();
    //     setSelectedConversation(conv);
    //     selectedIdRef.current = cid;
    //     fetchMessages(cid);
    // };

    useEffect(() => {
        const events = [
            "message", "new_message", "chat_message", "receive_message",
            "msg", "user_message", "send_message", "messageFromUser"
        ];

        events.forEach(event => {
            socket.on(event, (data: any) => {
                console.log(`🔵 EVENT [${event}]:`, JSON.stringify(data));
            });
        });

        return () => {
            events.forEach(event => socket.off(event));
        };
    }, []);

    useEffect(() => {
        const originalOn = socket.onAny;

        socket.onAny((eventName: string, ...args: any[]) => {
            console.log(`🔴 CAUGHT EVENT: "${eventName}"`, JSON.stringify(args));
        });

        return () => {
            socket.offAny();
        };
    }, []);

    const handleSelectConversation = async (conv: any) => {
        const cid = conv.conversationId.toString().trim();

        setSelectedConversation(conv);
        selectedIdRef.current = cid;

        socket.emit("join_room", { conversationId: cid });

        try {
            // ✅ Call correct API: chnage-status
            if (conv.status === "pending") {
                const res = await fetch(
                    `https://chatbotapi.scrollosoft.com/conversation/chnage-status`,
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
                console.log("✅ Status Update Response:", data);

                // ✅ IMMEDIATE UI UPDATE (IMPORTANT FIX)
                setConversations((prev) =>
                    prev.map((c) =>
                        c.conversationId === conv.conversationId
                            ? { ...c, status: "accepted" }
                            : c
                    )
                );

                // ✅ ALSO update selected conversation
                setSelectedConversation((prev) =>
                    prev ? { ...prev, status: "accepted" } : prev
                );

                // ✅ SEND EMAIL
                const userEmail = conv.username;

                if (userEmail) {
                    try {
                        await fetch("https://chatbotapi.scrollosoft.com/users/send-email", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                to: userEmail,
                                subject: "Chat Accepted",
                                text: "Admin accepted your request.",
                                html: `<h2>Hi</h2><p>Your chat request has been accepted.</p>`,
                            }),
                        });
                    } catch (err) {
                        console.error("❌ Email failed:", err);
                    }
                }
            }

            // setConversations((prev) =>
            //     prev.map((c) =>
            //         c.conversationId === conv.conversationId
            //             ? {
            //                 ...c,
            //                 messageStatus: "read",
            //                 status:
            //                     c.status === "pending"
            //                         ? "accepted"
            //                         : c.status,
            //             }
            //             : c
            //     )
            // );
        } catch (err) {
            console.error("❌ Update error:", err);
        }

        fetchMessages(cid);
    };

    const handleCloseConversation = async () => {
        if (!selectedConversation) return;

        const convId = selectedConversation.conversationId;

        try {
            // ✅ 1. SEND "Admin closed chat" message
            await fetch("https://chatbotapi.scrollosoft.com/conversation/send-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: "Admin closed this chat",
                    messageById: adminId,
                    conversationId: convId,
                }),
            });

            // ✅ 2. CLOSE CONVERSATION
            await fetch(
                `https://chatbotapi.scrollosoft.com/conversation/chnage-status`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: "closed",
                        conversationId: convId,
                    }),
                }
            );

            // ✅ 3. UPDATE UI
            setConversations((prev) =>
                prev.map((c) =>
                    c.conversationId === convId
                        ? { ...c, status: "closed" }
                        : c
                )
            );

            setSelectedConversation((prev: any) =>
                prev ? { ...prev, status: "closed" } : prev
            );

            // ✅ 4. OPTIONAL: Show message instantly in UI
            setMessages((prev) => [
                ...prev,
                {
                    text: "Admin closed this chat",
                    messageById: adminId,
                    createdAt: new Date().toISOString(), // ✅ ADD THIS
                },
            ]);

        } catch (err) {
            console.error("❌ Close error:", err);
        }
    };

    const pendingCount = conversations.filter(c => c.status === "pending").length;
    const acceptedCount = conversations.filter(c => c.status === "accepted").length;
    const closedCount = conversations.filter(c => c.status === "closed").length;

    const sendMessage = async () => {
        if (!input.trim() || !selectedConversation) return;
        const text = input;
        const convId = selectedConversation.conversationId;

        setMessages((prev) => [
            ...prev,
            {
                text,
                messageById: adminId,
                createdAt: new Date().toISOString(), // ✅ ADD THIS
            },
        ]);
        setInput("");

        try {
            await fetch("https://chatbotapi.scrollosoft.com/conversation/send-message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text, messageById: adminId, conversationId: convId }),
            });
            // fetchMessages(convId);
        } catch (err) { console.error("Send Error:", err); }
    };

    useEffect(() => { fetchConversations(); }, []);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    // --- THE SOCKET LISTENER (FIXED) ---
    // Keep a ref to previous conversations to detect new messages
    const prevConversationsRef = useRef<any[]>([]);

    useEffect(() => {
        const handleIncomingMessage = () => {
            // ✅ STEP 1: Refetch the conversation list (has latest messageText)
            fetch(`https://chatbotapi.scrollosoft.com/conversation/admin-conversation-list?adminId=${adminId}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.status) return;

                    const newConversations: any[] = data.data;
                    const prev = prevConversationsRef.current;
                    const currentOpenId = selectedIdRef.current?.toString();

                    // ✅ STEP 2: Find which conversation got a new message
                    newConversations.forEach((newConv) => {
                        const oldConv = prev.find(
                            (c) => c.conversationId?.toString() === newConv.conversationId?.toString()
                        );

                        const isNewMessage =
                            !oldConv || oldConv.messageId !== newConv.messageId;

                        const isOpenConversation =
                            currentOpenId === newConv.conversationId?.toString();

                        // ✅ STEP 3: If this is the open chat AND has new message → append it
                        if (isNewMessage && isOpenConversation) {
                            if (newConv.messageText && newConv.messageText.trim() !== "") {
                                setMessages((prev) => {
                                    // Prevent duplicate
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
                                            messageById: newConv.userId, // user sent it
                                            conversationId: newConv.conversationId,
                                            messageId: newConv.messageId,
                                            createdAt: new Date().toISOString(),
                                        },
                                    ];
                                });
                            }

                            // 🔔 Play sound for new message
                            play();
                        }
                    });

                    // ✅ STEP 4: Update sidebar + save to ref
                    prevConversationsRef.current = newConversations;
                    setConversations(newConversations);
                })
                .catch(err => console.error("❌ Fetch error:", err));
        };

        socket.on("receive_message", handleIncomingMessage);
        return () => socket.off("receive_message", handleIncomingMessage);
    }, [adminId]);

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
            console.log("🧑‍💼 Admin Connected:", socket.id);

            const email = localStorage.getItem("adminemail");
            const password = localStorage.getItem("adminpassword");

            if (email && password) {
                await fetch("https://chatbotapi.scrollosoft.com/users/admin-login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: email,
                        password: password,
                        socketId: socket.id,
                    }),
                });
                if (selectedIdRef.current) {
                    socket.emit("join_room", { conversationId: selectedIdRef.current });
                    console.log("🔁 Re-joined room:", selectedIdRef.current);
                }
                console.log("✅ Admin socket mapped");
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

    const formatMessageTime = (dateString: string) => {
        if (!dateString) return "";

        const now = new Date();
        const msgTime = new Date(dateString);

        const diffMs = now.getTime() - msgTime.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        // ✅ Less than 2 minutes
        if (diffMinutes < 2) return "Now";

        // ✅ Between 2 and 5 minutes
        if (diffMinutes >= 2 && diffMinutes <= 5) return `${diffMinutes} min ago`;

        // ✅ Less than 24 hours → show time
        if (diffHours < 24) {
            return msgTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        }

        // ✅ More than 24 hours → show day + time
        return msgTime.toLocaleString([], {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="human-chat-layout">
            <AdminSidebar onLogout={() => { localStorage.removeItem("isLoggedIn"); navigate("/login"); }} />
            <div className="chat-layout">
                <div className="chat-sidebar">
                    <h3>Conversations</h3>
                    <div className="chat-filters">
                        <button
                            className={statusFilter === "pending" ? "active" : ""}
                            onClick={() => setStatusFilter("pending")}
                        >
                            Pending <span> ({pendingCount})</span>
                        </button>

                        <button
                            className={statusFilter === "accepted" ? "active" : ""}
                            onClick={() => setStatusFilter("accepted")}
                        >
                            Accepted <span> ({acceptedCount})</span>
                        </button>

                        <button
                            className={statusFilter === "closed" ? "active" : ""}
                            onClick={() => setStatusFilter("closed")}
                        >
                            Closed <span> ({closedCount})</span>
                        </button>
                    </div>

                    {filteredConversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={`chat-item ${selectedConversation?.conversationId?.toString() === conv.conversationId?.toString() ? "active" : ""}`}
                            onClick={() => handleSelectConversation(conv)}
                        >
                            <div className="chat-item-header">
                                <span className="username">{conv.username}</span>
                                {/* {conv.messageStatus === "unread" && <span className="badge">New</span>} */}
                                {/* {conv.messageStatus === "unread" && (
                                    <span className="badge">New</span>
                                )} */}
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
                                {messages.map((msg, i) => (
                                    <div className={`msg-row ${Number(msg.messageById) === adminId ? "right" : "left"}`} key={i}>
                                        <div className={`chat-bubble ${Number(msg.messageById) === adminId ? "right" : "left"}`}>
                                            {/* Key names vary between API and Socket payload */}
                                            {msg.text || msg.messageText}
                                        </div>
                                        <div className="msg-time">
                                            {formatMessageTime(msg.createdAt)}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="chat-input">
                                <input type="text" value={input} disabled={selectedConversation?.status === "closed"} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type message..." />
                                <button onClick={sendMessage} disabled={selectedConversation?.status === "closed"}>Send Message</button>
                            </div>
                        </>
                    )}
                </div>
            </div>


        </div>
    );
};

export default HumanChat;