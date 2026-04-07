import ChatService  from '../services/chat.service.js';
import jwt  from 'jsonwebtoken';

class ChatSocket {
  constructor(io) {
    this.io = io;
    this.userSockets = new Map(); // userId -> socketId
    this.roomUsers = new Map(); // roomId -> Set of userIds
  }
  
  initialize() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }
        
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        socket.userId = decoded.userId;
        
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });
    
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      
      // Store user socket
      this.userSockets.set(socket.userId, socket.id);
      
      // Join user to their personal room for direct messages
      socket.join(`user:${socket.userId}`);
      
      // Handle joining chat rooms
      socket.on('join-room', async (data) => {
        const { roomId } = data;
        
        // Verify user is participant
        const isParticipant = await this.verifyParticipant(socket.userId, roomId);
        if (isParticipant) {
          socket.join(`room:${roomId}`);
          
          // Track user in room
          if (!this.roomUsers.has(roomId)) {
            this.roomUsers.set(roomId, new Set());
          }
          this.roomUsers.get(roomId).add(socket.userId);
          
          // Notify room that user joined
          socket.to(`room:${roomId}`).emit('user-joined', {
            userId: socket.userId,
            timestamp: new Date(),
          });
          
          // Send online users in room
          const onlineUsers = Array.from(this.roomUsers.get(roomId) || []);
          socket.emit('online-users', { roomId, users: onlineUsers });
        }
      });
      
      // Handle leaving chat rooms
      socket.on('leave-room', (data) => {
        const { roomId } = data;
        socket.leave(`room:${roomId}`);
        
        // Remove user from room tracking
        if (this.roomUsers.has(roomId)) {
          this.roomUsers.get(roomId).delete(socket.userId);
          if (this.roomUsers.get(roomId).size === 0) {
            this.roomUsers.delete(roomId);
          }
        }
        
        socket.to(`room:${roomId}`).emit('user-left', {
          userId: socket.userId,
          timestamp: new Date(),
        });
      });
      
      // Handle sending messages
      socket.on('send-message', async (data, callback) => {
        try {
          const { roomId, content, replyToId, documentIds } = data;
          
          const message = await ChatService.sendMessage(
            roomId,
            socket.userId,
            { content, replyToId, documentIds }
          );
          
          // Emit to all users in the room
          this.io.to(`room:${roomId}`).emit('new-message', message);
          
          // Send notifications to offline users
          await this.sendMessageNotifications(roomId, message);
          
          callback({ success: true, message });
        } catch (error) {
          callback({ success: false, error: error.message });
        }
      });
      
      // Handle typing indicators
      socket.on('typing', async (data) => {
        const { roomId, isTyping } = data;
        
        await ChatService.setTyping(socket.userId, roomId, isTyping);
        
        socket.to(`room:${roomId}`).emit('user-typing', {
          userId: socket.userId,
          isTyping,
          timestamp: new Date(),
        });
      });
      
      // Handle message reactions
      socket.on('add-reaction', async (data, callback) => {
        try {
          const { messageId, reaction } = data;
          
          const result = await ChatService.addReaction(messageId, socket.userId, reaction);
          
          const message = await prisma.chatMessage.findUnique({
            where: { message_id: messageId },
            select: { roomId: true },
          });
          
          if (message) {
            this.io.to(`room:${message.roomId}`).emit('message-reaction', {
              messageId,
              reaction: result.reaction,
              added: result.added,
              userId: socket.userId,
            });
          }
          
          callback({ success: true });
        } catch (error) {
          callback({ success: false, error: error.message });
        }
      });
      
      // Handle message editing
      socket.on('edit-message', async (data, callback) => {
        try {
          const { messageId, content } = data;
          
          const message = await ChatService.updateMessage(messageId, socket.userId, content);
          
          this.io.to(`room:${message.roomId}`).emit('message-edited', {
            messageId,
            content,
            editedAt: new Date(),
          });
          
          callback({ success: true });
        } catch (error) {
          callback({ success: false, error: error.message });
        }
      });
      
      // Handle message deletion
      socket.on('delete-message', async (data, callback) => {
        try {
          const { messageId } = data;
          
          const isAdmin = false; // Check admin status
          await ChatService.deleteMessage(messageId, socket.userId, isAdmin);
          
          const message = await prisma.chatMessage.findUnique({
            where: { message_id: messageId },
            select: { roomId: true },
          });
          
          if (message) {
            this.io.to(`room:${message.roomId}`).emit('message-deleted', {
              messageId,
              deletedAt: new Date(),
            });
          }
          
          callback({ success: true });
        } catch (error) {
          callback({ success: false, error: error.message });
        }
      });
      
      // Handle direct messages
      socket.on('send-direct-message', async (data, callback) => {
        try {
          const { receiverId, content, replyToId } = data;
          
          const result = await ChatService.sendDirectMessage(
            socket.userId,
            receiverId,
            { content, replyToId }
          );
          
          // Emit to sender
          socket.emit('direct-message-sent', result.message);
          
          // Emit to receiver if online
          const receiverSocket = this.userSockets.get(receiverId);
          if (receiverSocket) {
            this.io.to(receiverSocket).emit('direct-message-received', result.message);
          }
          
          callback({ success: true, message: result.message });
        } catch (error) {
          callback({ success: false, error: error.message });
        }
      });
      
      // Handle marking messages as read
      socket.on('mark-read', async (data) => {
        const { roomId } = data;
        
        // Update last read timestamp in Redis
        const key = `user:${socket.userId}:room:${roomId}:lastRead`;
        await redis.setex(key, 86400, new Date().toISOString());
        
        socket.to(`room:${roomId}`).emit('messages-read', {
          userId: socket.userId,
          readAt: new Date(),
        });
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        
        // Remove from user sockets
        this.userSockets.delete(socket.userId);
        
        // Remove from all rooms
        for (const [roomId, users] of this.roomUsers.entries()) {
          if (users.has(socket.userId)) {
            users.delete(socket.userId);
            this.io.to(`room:${roomId}`).emit('user-left', {
              userId: socket.userId,
              timestamp: new Date(),
            });
            
            if (users.size === 0) {
              this.roomUsers.delete(roomId);
            }
          }
        }
      });
    });
  }
  
  async verifyParticipant(userId, roomId) {
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });
    return !!participant;
  }
  
  async sendMessageNotifications(roomId, message) {
    // Get all participants except sender
    const participants = await prisma.chatParticipant.findMany({
      where: {
        roomId,
        userId: { not: message.senderId },
      },
      include: {
        user: {
          select: {
            id: true,
            deviceTokens: {
              where: { isActive: true },
            },
          },
        },
      },
    });
    
    // Send push notifications to offline users
    for (const participant of participants) {
      const isOnline = this.userSockets.has(participant.userId);
      
      if (!isOnline && participant.user.deviceTokens.length > 0) {
        // Send push notification via FCM/APNS
        await this.sendPushNotification(participant.user.deviceTokens, {
          title: `New message in ${message.room.name || 'Chat'}`,
          body: `${message.sender.display_name}: ${message.content.substring(0, 100)}`,
          data: {
            type: 'chat_message',
            roomId,
            messageId: message.message_id,
          },
        });
      }
    }
  }
  
  async sendPushNotification(tokens, notification) {
    // Implement push notification logic here
    // This would integrate with Firebase Cloud Messaging or Apple Push Notification Service
    console.log(`Sending push notification to ${tokens.length} devices`, notification);
  }
}

export default ChatSocket;