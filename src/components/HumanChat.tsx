import { useEffect, useState } from "react";
import "./HumanChat.css";
import AdminSidebar from "./AdminSidebar";
import { useNavigate } from "react-router-dom";

interface Conversation {
    id: number;
    userId: number;
    status: string;
    messageText: string;
    messageCreatedAt: string;
    conversationId: number;
    messageStatus: string;
}

const HumanChat = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const adminId = 13;
    const navigate = useNavigate();


    const fetchConversations = async () => {
        setLoading(true);

        try {
            const res = await fetch(
                `https://chatbotapi.scrollosoft.com/conversation/admin-conversation-list?adminId=${adminId}`
            );

            const data = await res.json();

            console.log("Admin Conversations:", data);

            if (data?.status) {
                const sortedData = (data.data || []).sort(
                    (a: { messageCreatedAt: string | number | Date; }, b: { messageCreatedAt: string | number | Date; }) =>
                        new Date(b.messageCreatedAt).getTime() -
                        new Date(a.messageCreatedAt).getTime()
                );

                setConversations(sortedData);
            }
        } catch (error) {
            console.error("Error:", error);
        }

        setLoading(false);
    };

    const handleSelectConversation = async (conv: any) => {
        setSelectedConversation(conv);

        try {
            const res = await fetch(
                `https://chatbotapi.scrollosoft.com/conversation/message-list?conversationId=${conv.conversationId}`
            );

            const data = await res.json();

            if (data?.status) {
                setMessages(data.data || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || !selectedConversation) return;

        const text = input;

        // 🔥 Optimistic UI
        setMessages((prev) => [
            ...prev,
            { text, messageById: adminId }
        ]);

        setInput("");

        try {
            await fetch(
                "https://chatbotapi.scrollosoft.com/conversation/send-message",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message: text,
                        messageById: adminId,
                        conversationId: selectedConversation.conversationId
                    })
                }
            );
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        navigate("/");
    };

    return (
        <>
            <div className="human-chat-layout">
                <AdminSidebar onLogout={handleLogout} />
                <div className="chat-layout">

                    {/* 🔹 LEFT SIDEBAR */}
                    <div className="chat-sidebar">
                        <h3>Conversations</h3>

                        {conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`chat-item ${selectedConversation?.conversationId === conv.conversationId
                                    ? "active"
                                    : ""
                                    }`}
                                onClick={() => handleSelectConversation(conv)}
                            >
                                <div className="chat-item-header">
                                    <span>User {conv.userId}</span>

                                    {conv.messageStatus === "unread" && (
                                        <span className="badge">New</span>
                                    )}
                                </div>

                                <p>{conv.messageText}</p>
                            </div>
                        ))}
                    </div>

                    {/* 🔹 RIGHT CHAT AREA */}
                    <div className="chat-main">
                        {!selectedConversation ? (
                            <div className="no-chat">
                                Select a conversation
                            </div>
                        ) : (
                            <>
                                {/* HEADER */}
                                <div className="chat-header">
                                    <h4>User {selectedConversation.userId}</h4>
                                </div>

                                {/* MESSAGES */}
                                <div className="chat-messages">
                                    {messages.map((msg, i) => {
                                        const isAdmin = msg.messageById === adminId;

                                        return (
                                            <div
                                                key={i}
                                                className={`chat-bubble ${isAdmin ? "right" : "left"}`}
                                            >
                                                {msg.text}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* INPUT */}
                                <div className="chat-input">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type message..."
                                    />

                                    <button onClick={sendMessage}>Send</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default HumanChat;