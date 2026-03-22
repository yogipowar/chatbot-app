import { useEffect, useState, useRef } from "react";
import "./HumanChat.css";
import AdminSidebar from "./AdminSidebar";
import { useNavigate } from "react-router-dom";
import { socket } from "../components/socket";
import { useSound } from 'react-sounds';
import notification from "../../public/notification1.mp3"

const HumanChat = () => {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");

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

            if (data.status && data.data.length > 0) {
                setConversations(data.data);

                // ✅ Get first conversation id (or selected logic)
                const firstConvId = data.data[0].id;

                console.log("📌 Conversation ID:", firstConvId);

                // ✅ Call message API immediately
                fetchMessages(firstConvId);
            }
        } catch (err) {
            console.error("❌ Error fetching conversations:", err);
        }
    };

    // --- API: Fetch Messages ---
    const fetchMessages = async (conversationId: number | string) => {
        try {
            const res = await fetch(
                `https://chatbotapi.scrollosoft.com/conversation/message-list?conversationId=${conversationId}`
            );
            const data = await res.json();

            console.log("💬 Messages:", data);

            if (data.status) {
                setMessages(data.data);
            }
        } catch (err) {
            console.error("❌ Error fetching messages:", err);
        }
    };

    const handleSelectConversation = (conv: any) => {
        const cid = conv.conversationId.toString();
        setSelectedConversation(conv);
        selectedIdRef.current = cid;
        fetchMessages(cid);
    };

    const sendMessage = async () => {
        if (!input.trim() || !selectedConversation) return;
        const text = input;
        const convId = selectedConversation.conversationId;

        setMessages((prev) => [...prev, { text, messageById: adminId }]);
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
    useEffect(() => {
        const attachListener = () => {
            console.log("🎧 Attaching listener with socket:", socket.id);
            // alert("socket received");
            const handleIncomingMessage = (data: any) => {
                console.log("📥 SOCKET EVENT:", data);

                fetchConversations();

                const currentOpenId = selectedIdRef.current?.toString();
                const incomingConvId = (data.conversationId || data.convId || data.id)?.toString();

                // 🔔 PLAY SOUND ONLY IF MESSAGE FROM USER
                if (String(data.messageById) !== String(adminId)) {
                    if (String(data.messageById) !== String(adminId)) {
                        // alert("sound on")
                        play();
                    }
                }


                if (currentOpenId && incomingConvId && currentOpenId === incomingConvId) {
                    fetchMessages(currentOpenId);
                }
            };

            socket.on("receive_message", handleIncomingMessage);

            return () => {
                socket.off("receive_message", handleIncomingMessage);
            };
        };

        if (socket.connected) {
            // ✅ already connected
            return attachListener();
        } else {
            // ⏳ wait for connect
            socket.once("connect", () => {
                attachListener();
            });
        }
    }, []);


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

                console.log("✅ Admin socket mapped");
            }
        };

        socket.on("connect", handleConnect);

        return () => {
            socket.off("connect", handleConnect);
        };
    }, []);

    return (
        <div className="human-chat-layout">
            <AdminSidebar onLogout={() => { localStorage.removeItem("isLoggedIn"); navigate("/"); }} />
            <div className="chat-layout">
                <div className="chat-sidebar">
                    <h3>Conversations</h3>
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={`chat-item ${selectedConversation?.conversationId?.toString() === conv.conversationId?.toString() ? "active" : ""}`}
                            onClick={() => handleSelectConversation(conv)}
                        >
                            <div className="chat-item-header">
                                <span className="username">User {conv.userId}</span>
                                {/* {conv.messageStatus === "unread" && <span className="badge">New</span>} */}
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
                            <div className="chat-header"><h4>User {selectedConversation.userId}</h4></div>
                            <div className="chat-messages">
                                {messages.map((msg, i) => (
                                    <div className={`msg-row ${Number(msg.messageById) === adminId ? "right" : "left"}`} key={i}>
                                        <div className={`chat-bubble ${Number(msg.messageById) === adminId ? "right" : "left"}`}>
                                            {/* Key names vary between API and Socket payload */}
                                            {msg.text || msg.messageText}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="chat-input">
                                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Type message..." />
                                <button onClick={sendMessage}>Send</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HumanChat;