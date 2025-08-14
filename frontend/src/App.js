import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    socket.emit('getMessages');

    socket.on('messages', (data) => {
      setMessages(data);
    });

    socket.on('newMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('messages');
      socket.off('newMessage');
    };
  }, []);

  const sendMessage = () => {
    if (text.trim()) {
      socket.emit('sendMessage', { username, text });
      setText('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Chat</h2>
      <input 
        placeholder="Your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <div style={{ margin: '20px 0', border: '1px solid #ccc', height: '300px', overflowY: 'auto' }}>
        {messages.map((msg) => (
          <div key={msg._id}>
            <b>{msg.username}</b>: {msg.text}
          </div>
        ))}
      </div>
      <input 
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
