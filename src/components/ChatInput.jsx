import { useState } from "react";

function ChatInput() {

  const [text, setText] = useState("");

  const sendMessage = () => {
    if (!text) return;
    console.log(text);
    setText("");
  };

  return (
    <div className="chat-input-container">

      <input
        type="text"
        placeholder="Type your message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={sendMessage}>
        Send
      </button>

    </div>
  );
}

export default ChatInput;