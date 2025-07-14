
import { createChatRoom, addToGroup, removeFromGroup } from '../services/chat/chat.services.js';
import db from '../db/connection.js';

export function socketBlock({ io, onlineUsers }) {

    io.on('connection', (socket) => {

        console.log('User connected:', socket.id);

        // 1. Listen for user login (store socketId)
        socket.on('user-online', (userId) => {
            onlineUsers.set(userId, socket.id);
        });

        // When a user joins a room (for real-time chat)
        socket.on('join-room', (roomId) => {
            socket.join(roomId);
        });

        // When a user leaves a room
        socket.on('leave-room', (roomId) => {
            socket.leave(roomId);
        });

        // user joinin the conversation
        // socket.on('add_user', async ({ user_id }) => {
        //     const socket_id = socket.id;
        //     const users = await addUser({ user_id, socket_id });
        //     io.emit('get_users', users);
        // });

        // 2. Handle sending messages
        socket.on('send-message', async (data) => {
            const { roomId, senderId, content } = data;
            const message = await db.chatMessage.create({
                data: { roomId, senderId, content },
                include: { sender: true },
            });

            // Emit to all room participants
            const participants = await db.chatParticipant.findMany({
                where: { roomId },
                select: { userId: true },
            });

            participants.forEach(({ userId }) => {
                const recipientSocketId = onlineUsers.get(userId);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('new-message', message);
                }
            });
        });

        // 3. Handle disconnections
        socket.on('disconnect', () => {
            onlineUsers.forEach((value, key) => {
                if (value === socket.id) onlineUsers.delete(key);
            });
        });

    });
}
