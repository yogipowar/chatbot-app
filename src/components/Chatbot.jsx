import { useState } from "react";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };

    setMessages((prev) => [...prev, userMessage]);

    // Fake bot reply
    setTimeout(() => {
      const botMessage = { sender: "bot", text: "Hello! How can I help you?" };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);

    setInput("");
  };

  return (
    <div style={{ width: "400px", margin: "auto" }}>
      <h2>Chatbot</h2>

      <div style={{ height: "300px", border: "1px solid #ccc", padding: "10px", overflowY: "auto" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
            <p><b>{msg.sender}:</b> {msg.text}</p>
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type message..."
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chatbot;