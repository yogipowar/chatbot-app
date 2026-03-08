import ChatMessage from "./ChatMessage";

function ChatMessages() {

  const messages = [
    { role: "bot", text: "Hello! How can I help you?" },
    { role: "user", text: "Explain React Hooks" }
  ];

  return (
    <div className="chat-messages">

      {messages.map((msg, index) => (
        <ChatMessage key={index} message={msg} />
      ))}

    </div>
  );
}

export default ChatMessages;