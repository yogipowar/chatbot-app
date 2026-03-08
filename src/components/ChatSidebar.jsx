function ChatSidebar() {
  return (
    <div className="chat-sidebar">

      <button className="new-chat-btn">+ New Chat</button>

      <div className="chat-history">
        <div className="chat-item">React Help</div>
        <div className="chat-item">API Question</div>
      </div>

    </div>
  );
}

export default ChatSidebar;