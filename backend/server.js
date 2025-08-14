require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected!'))
    .catch(err => console.log(err));

// Socket.io
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Lấy tin nhắn cũ
    socket.on('getMessages', async () => {
        const messages = await Message.find().sort({ createdAt: 1 });
        socket.emit('messages', messages);
    });

    // Nhận tin nhắn mới
    socket.on('sendMessage', async (data) => {
        const newMsg = new Message({
            username: data.username,
            text: data.text
        });
        await newMsg.save();

        // Gửi lại cho tất cả client
        io.emit('newMessage', newMsg);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
});
