import "../styles/chatbot.css";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";

function ChatLayout() {
  return (
    <div className="chat-container">

      <ChatSidebar />

      <div className="chat-main">
        <ChatHeader />
        <ChatMessages />
        <ChatInput />
      </div>

    </div>
  );
}

export default ChatLayout;