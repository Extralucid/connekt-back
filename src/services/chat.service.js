import prisma  from '../config/database.js';
import redis  from '../config/redis.js';
import { v4 as uuidv4 }  from 'uuid';

class ChatService {
  // ==================== CHAT ROOM MANAGEMENT ====================
  
  static async createChatRoom(userId, roomData) {
    const { participantIds, isGroup, name, description } = roomData;
    
    // For direct messages, check if room already exists
    if (!isGroup && participantIds.length === 1) {
      const existingRoom = await this.findDirectMessageRoom(userId, participantIds[0]);
      if (existingRoom) {
        return existingRoom;
      }
    }
    
    const room = await prisma.chatRoom.create({
      data: {
        room_id: uuidv4(),
        name: isGroup ? name : null,
        isGroup: isGroup || false,
        description: isGroup ? description : null,
        participants: {
          create: [
            { userId, role: 'ADMIN' },
            ...participantIds.map(participantId => ({
              userId: participantId,
              role: isGroup ? 'MEMBER' : 'ADMIN',
            })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                display_name: true,
                profile_picture_url: true,
                username: true,
              },
            },
          },
        },
      },
    });
    
    await redis.del(`user:${userId}:rooms`);
    await redis.del(`user:${participantIds[0]}:rooms`);
    
    return room;
  }
  
  static async findDirectMessageRoom(userId1, userId2) {
    const rooms = await prisma.chatRoom.findMany({
      where: {
        isGroup: false,
        participants: {
          every: {
            userId: { in: [userId1, userId2] },
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                display_name: true,
                profile_picture_url: true,
                username: true,
              },
            },
          },
        },
      },
    });
    
    // Find room that has exactly these two participants
    const room = rooms.find(r => r.participants.length === 2);
    return room || null;
  }
  
  static async getUserChatRooms(userId, filters, pagination) {
    const { type, sortBy = 'updatedAt', sortOrder = 'desc' } = filters;
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;
    
    const cacheKey = `user:${userId}:rooms:${page}:${limit}:${type}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const where = {
      participants: {
        some: { userId },
      },
    };
    
    if (type === 'direct') where.isGroup = false;
    if (type === 'group') where.isGroup = true;
    
    const [rooms, total] = await Promise.all([
      prisma.chatRoom.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  display_name: true,
                  profile_picture_url: true,
                  username: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  display_name: true,
                  profile_picture_url: true,
                },
              },
            },
          },
        },
      }),
      prisma.chatRoom.count({ where }),
    ]);
    
    // Get unread counts for each room
    for (const room of rooms) {
      const unreadCount = await prisma.chatMessage.count({
        where: {
          roomId: room.room_id,
          senderId: { not: userId },
          createdAt: { gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
        },
      });
      room.unreadCount = unreadCount;
      
      // Get last message
      if (room.messages.length > 0) {
        room.lastMessage = room.messages[0];
      }
      delete room.messages;
    }
    
    const result = {
      rooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    
    await redis.setex(cacheKey, 300, JSON.stringify(result));
    
    return result;
  }
  
  static async getChatRoomById(roomId, userId) {
    const cacheKey = `room:${roomId}:user:${userId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const room = await prisma.chatRoom.findUnique({
      where: { room_id: roomId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                display_name: true,
                profile_picture_url: true,
                username: true,
                lastActiveAt: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                display_name: true,
                profile_picture_url: true,
              },
            },
          },
        },
      },
    });
    
    if (!room) return null;
    
    // Check if user is participant
    const isParticipant = room.participants.some(p => p.userId === userId);
    if (!isParticipant) return null;
    
    await redis.setex(cacheKey, 300, JSON.stringify(room));
    
    return room;
  }
  
  static async updateChatRoom(roomId, userId, updateData) {
    // Check if user is admin of the room
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });
    
    if (!participant || (participant.role !== 'ADMIN' && participant.role !== 'OWNER')) {
      throw new Error('Unauthorized to update this room');
    }
    
    const room = await prisma.chatRoom.update({
      where: { room_id: roomId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });
    
    await redis.del(`room:${roomId}:*`);
    await this.clearUserRoomsCache(userId);
    
    return room;
  }
  
  static async deleteChatRoom(roomId, userId) {
    // Check if user is admin
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });
    
    if (!participant || participant.role !== 'ADMIN') {
      throw new Error('Unauthorized to delete this room');
    }
    
    await prisma.chatRoom.delete({
      where: { room_id: roomId },
    });
    
    await redis.del(`room:${roomId}:*`);
    await this.clearUserRoomsCache(userId);
    
    return true;
  }
  
  // ==================== PARTICIPANT MANAGEMENT ====================
  
  static async addParticipant(roomId, userId, participantData) {
    // Check if requesting user is admin
    const requester = await prisma.chatParticipant.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });
    
    if (!requester || (requester.role !== 'ADMIN' && requester.role !== 'OWNER')) {
      throw new Error('Unauthorized to add participants');
    }
    
    const participant = await prisma.chatParticipant.create({
      data: {
        participant_id: uuidv4(),
        roomId,
        userId: participantData.userId,
        role: participantData.role || 'MEMBER',
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
            username: true,
          },
        },
      },
    });
    
    await this.clearRoomCache(roomId);
    await this.clearUserRoomsCache(participantData.userId);
    
    return participant;
  }
  
  static async removeParticipant(roomId, userId, targetUserId) {
    // Check if requesting user is admin
    const requester = await prisma.chatParticipant.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });
    
    if (!requester || (requester.role !== 'ADMIN' && requester.role !== 'OWNER')) {
      throw new Error('Unauthorized to remove participants');
    }
    
    // Cannot remove owner
    const target = await prisma.chatParticipant.findUnique({
      where: {
        userId_roomId: {
          userId: targetUserId,
          roomId,
        },
      },
    });
    
    if (target.role === 'OWNER') {
      throw new Error('Cannot remove room owner');
    }
    
    await prisma.chatParticipant.delete({
      where: {
        userId_roomId: {
          userId: targetUserId,
          roomId,
        },
      },
    });
    
    await this.clearRoomCache(roomId);
    await this.clearUserRoomsCache(targetUserId);
    
    return true;
  }
  
  static async updateParticipantRole(roomId, userId, targetUserId, newRole) {
    // Check if requesting user is admin
    const requester = await prisma.chatParticipant.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });
    
    if (!requester || (requester.role !== 'ADMIN' && requester.role !== 'OWNER')) {
      throw new Error('Unauthorized to change roles');
    }
    
    // Cannot change owner's role
    const target = await prisma.chatParticipant.findUnique({
      where: {
        userId_roomId: {
          userId: targetUserId,
          roomId,
        },
      },
    });
    
    if (target.role === 'OWNER') {
      throw new Error('Cannot change owner role');
    }
    
    const participant = await prisma.chatParticipant.update({
      where: {
        userId_roomId: {
          userId: targetUserId,
          roomId,
        },
      },
      data: { role: newRole },
    });
    
    await this.clearRoomCache(roomId);
    
    return participant;
  }
  
  static async getRoomParticipants(roomId, userId, pagination) {
    // Check if user is participant
    const isParticipant = await prisma.chatParticipant.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });
    
    if (!isParticipant) {
      throw new Error('Not a participant of this room');
    }
    
    const { page = 1, limit = 50 } = pagination;
    const skip = (page - 1) * limit;
    
    const [participants, total] = await Promise.all([
      prisma.chatParticipant.findMany({
        where: { roomId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              display_name: true,
              profile_picture_url: true,
              username: true,
              lastActiveAt: true,
            },
          },
        },
        orderBy: { joinedAt: 'asc' },
      }),
      prisma.chatParticipant.count({ where: { roomId } }),
    ]);
    
    return {
      participants,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  
  // ==================== MESSAGE MANAGEMENT ====================
  
  static async sendMessage(roomId, userId, messageData) {
    // Check if user is participant
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });
    
    if (!participant) {
      throw new Error('Not a participant of this room');
    }
    
    const message = await prisma.chatMessage.create({
      data: {
        message_id: uuidv4(),
        roomId,
        senderId: userId,
        content: messageData.content,
        replyToId: messageData.replyToId,
      },
      include: {
        sender: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
            username: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                display_name: true,
                profile_picture_url: true,
              },
            },
          },
        },
      },
    });
    
    // Add documents if provided
    if (messageData.documentIds && messageData.documentIds.length > 0) {
      await Promise.all(
        messageData.documentIds.map(async (documentId) => {
          await prisma.chatDocument.create({
            data: {
              id: uuidv4(),
              messageId: message.message_id,
              documentId,
            },
          });
        })
      );
      
      // Fetch documents for response
      const documents = await prisma.chatDocument.findMany({
        where: { messageId: message.message_id },
        include: { document: true },
      });
      message.documents = documents.map(d => d.document);
    }
    
    // Update room's updatedAt
    await prisma.chatRoom.update({
      where: { room_id: roomId },
      data: { updatedAt: new Date() },
    });
    
    await this.clearRoomCache(roomId);
    await this.clearMessagesCache(roomId);
    
    return message;
  }
  
  static async getMessages(roomId, userId, pagination) {
    // Check if user is participant
    const isParticipant = await prisma.chatParticipant.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });
    
    if (!isParticipant) {
      throw new Error('Not a participant of this room');
    }
    
    const { page = 1, limit = 50, before, after } = pagination;
    const skip = (page - 1) * limit;
    
    const where = { roomId, isDeleted: false };
    if (before) where.createdAt = { lt: new Date(before) };
    if (after) where.createdAt = { gt: new Date(after) };
    
    const cacheKey = `messages:${roomId}:${page}:${limit}:${before}:${after}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const [messages, total] = await Promise.all([
      prisma.chatMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: {
              id: true,
              display_name: true,
              profile_picture_url: true,
              username: true,
            },
          },
          replyTo: {
            include: {
              sender: {
                select: {
                  id: true,
                  display_name: true,
                  profile_picture_url: true,
                },
              },
            },
          },
          documents: {
            include: {
              document: true,
            },
          },
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  display_name: true,
                  profile_picture_url: true,
                },
              },
            },
          },
        },
      }),
      prisma.chatMessage.count({ where }),
    ]);
    
    const result = {
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    };
    
    await redis.setex(cacheKey, 300, JSON.stringify(result));
    
    return result;
  }
  
  static async updateMessage(messageId, userId, content) {
    const message = await prisma.chatMessage.findUnique({
      where: { message_id: messageId },
    });
    
    if (!message) throw new Error('Message not found');
    if (message.senderId !== userId) {
      throw new Error('Unauthorized to edit this message');
    }
    
    const updatedMessage = await prisma.chatMessage.update({
      where: { message_id: messageId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
      },
    });
    
    await this.clearMessagesCache(message.roomId);
    
    return updatedMessage;
  }
  
  static async deleteMessage(messageId, userId, isAdmin = false) {
    const message = await prisma.chatMessage.findUnique({
      where: { message_id: messageId },
      include: {
        room: {
          include: {
            participants: {
              where: { userId },
              select: { role: true },
            },
          },
        },
      },
    });
    
    if (!message) throw new Error('Message not found');
    
    const isModerator = message.room.participants[0]?.role === 'ADMIN' || 
                        message.room.participants[0]?.role === 'MODERATOR';
    
    if (message.senderId !== userId && !isModerator && !isAdmin) {
      throw new Error('Unauthorized to delete this message');
    }
    
    await prisma.chatMessage.update({
      where: { message_id: messageId },
      data: {
        isDeleted: true,
        content: '[Message deleted]',
        deletedAt: new Date(),
      },
    });
    
    await this.clearMessagesCache(message.roomId);
    
    return true;
  }
  
  // ==================== MESSAGE REACTIONS ====================
  
  static async addReaction(messageId, userId, reaction) {
    const message = await prisma.chatMessage.findUnique({
      where: { message_id: messageId },
    });
    
    if (!message) throw new Error('Message not found');
    
    const existingReaction = await prisma.messageReaction.findUnique({
      where: {
        messageId_userId_reaction: {
          messageId,
          userId,
          reaction,
        },
      },
    });
    
    if (existingReaction) {
      // Remove reaction if already exists (toggle)
      await prisma.messageReaction.delete({
        where: {
          messageId_userId_reaction: {
            messageId,
            userId,
            reaction,
          },
        },
      });
      return { added: false, reaction: null };
    }
    
    const newReaction = await prisma.messageReaction.create({
      data: {
        id: uuidv4(),
        messageId,
        userId,
        reaction,
      },
      include: {
        user: {
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
          },
        },
      },
    });
    
    await this.clearMessagesCache(message.roomId);
    
    return { added: true, reaction: newReaction };
  }
  
  static async removeReaction(messageId, userId, reaction) {
    await prisma.messageReaction.delete({
      where: {
        messageId_userId_reaction: {
          messageId,
          userId,
          reaction,
        },
      },
    });
    
    const message = await prisma.chatMessage.findUnique({
      where: { message_id: messageId },
      select: { roomId: true },
    });
    
    await this.clearMessagesCache(message.roomId);
    
    return true;
  }
  
  // ==================== CHAT INVITES ====================
  
  static async createInvite(roomId, userId, inviteData) {
    // Check if user is admin
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });
    
    if (!participant || (participant.role !== 'ADMIN' && participant.role !== 'OWNER')) {
      throw new Error('Unauthorized to create invites');
    }
    
    const token = uuidv4();
    const invite = await prisma.chatInvite.create({
      data: {
        invite_id: uuidv4(),
        roomId,
        creatorId: userId,
        token,
        expiresAt: inviteData.expiresAt ? new Date(inviteData.expiresAt) : null,
        maxUses: inviteData.maxUses || null,
      },
    });
    
    return invite;
  }
  
  static async joinViaInvite(token, userId) {
    const invite = await prisma.chatInvite.findUnique({
      where: { token },
      include: { room: true },
    });
    
    if (!invite) throw new Error('Invalid invite token');
    
    // Check expiration
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new Error('Invite has expired');
    }
    
    // Check max uses
    if (invite.maxUses && invite.usedCount >= invite.maxUses) {
      throw new Error('Invite has reached maximum uses');
    }
    
    // Check if already a participant
    const existingParticipant = await prisma.chatParticipant.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId: invite.roomId,
        },
      },
    });
    
    if (existingParticipant) {
      throw new Error('Already a member of this room');
    }
    
    // Add participant
    const participant = await prisma.chatParticipant.create({
      data: {
        participant_id: uuidv4(),
        roomId: invite.roomId,
        userId,
        role: 'MEMBER',
      },
    });
    
    // Increment invite usage
    await prisma.chatInvite.update({
      where: { invite_id: invite.invite_id },
      data: { usedCount: { increment: 1 } },
    });
    
    await this.clearRoomCache(invite.roomId);
    await this.clearUserRoomsCache(userId);
    
    return participant;
  }
  
  static async getRoomInvites(roomId, userId) {
    // Check if user is admin
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId,
        },
      },
    });
    
    if (!participant || (participant.role !== 'ADMIN' && participant.role !== 'OWNER')) {
      throw new Error('Unauthorized to view invites');
    }
    
    const invites = await prisma.chatInvite.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
    });
    
    return invites;
  }
  
  static async deleteInvite(inviteId, userId) {
    const invite = await prisma.chatInvite.findUnique({
      where: { invite_id: inviteId },
      include: { room: true },
    });
    
    if (!invite) throw new Error('Invite not found');
    
    // Check if user is admin of the room
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId: invite.roomId,
        },
      },
    });
    
    if (!participant || (participant.role !== 'ADMIN' && participant.role !== 'OWNER')) {
      throw new Error('Unauthorized to delete invite');
    }
    
    await prisma.chatInvite.delete({
      where: { invite_id: inviteId },
    });
    
    return true;
  }
  
  // ==================== DIRECT MESSAGES ====================
  
  static async sendDirectMessage(senderId, receiverId, messageData) {
    // Find or create DM room
    let room = await this.findDirectMessageRoom(senderId, receiverId);
    
    if (!room) {
      room = await this.createChatRoom(senderId, {
        isGroup: false,
        participantIds: [receiverId],
      });
    }
    
    const message = await this.sendMessage(room.room_id, senderId, messageData);
    
    return { room, message };
  }
  
  static async getDirectMessages(userId, otherUserId, pagination) {
    const room = await this.findDirectMessageRoom(userId, otherUserId);
    
    if (!room) {
      return { messages: [], pagination: { total: 0 } };
    }
    
    const messages = await this.getMessages(room.room_id, userId, pagination);
    
    // Mark messages as read
    await prisma.directMessage.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    
    return messages;
  }
  
  static async markDirectMessageRead(messageId, userId) {
    const message = await prisma.directMessage.findUnique({
      where: { id: messageId },
    });
    
    if (!message) throw new Error('Message not found');
    if (message.receiverId !== userId) {
      throw new Error('Unauthorized');
    }
    
    await prisma.directMessage.update({
      where: { id: messageId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    
    return true;
  }
  
  static async getUnreadCount(userId) {
    const unreadCount = await prisma.directMessage.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
    
    // Also count unread group messages (simplified)
    const rooms = await prisma.chatParticipant.findMany({
      where: { userId },
      select: { roomId: true },
    });
    
    let groupUnread = 0;
    for (const room of rooms) {
      const lastRead = await redis.get(`user:${userId}:room:${room.roomId}:lastRead`);
      const unreadMessages = await prisma.chatMessage.count({
        where: {
          roomId: room.roomId,
          senderId: { not: userId },
          createdAt: { gt: lastRead ? new Date(lastRead) : new Date(0) },
        },
      });
      groupUnread += unreadMessages;
    }
    
    return {
      direct: unreadCount,
      group: groupUnread,
      total: unreadCount + groupUnread,
    };
  }
  
  // ==================== TYPING INDICATORS (Redis) ====================
  
  static async setTyping(userId, roomId, isTyping) {
    const key = `typing:${roomId}:${userId}`;
    if (isTyping) {
      await redis.setex(key, 5, 'true');
    } else {
      await redis.del(key);
    }
    return true;
  }
  
  static async getTypingUsers(roomId) {
    const keys = await redis.keys(`typing:${roomId}:*`);
    const userIds = keys.map(key => key.split(':')[2]);
    
    if (userIds.length === 0) return [];
    
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        display_name: true,
        profile_picture_url: true,
        username: true,
      },
    });
    
    return users;
  }
  
  // ==================== STATISTICS ====================
  
  static async getChatStats(userId, period = 'month') {
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'day':
        dateFilter = { gte: new Date(now.setHours(0, 0, 0, 0)) };
        break;
      case 'week':
        dateFilter = { gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case 'month':
        dateFilter = { gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
      case 'year':
        dateFilter = { gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
      default:
        dateFilter = {};
    }
    
    const [totalMessages, totalRooms, directMessages, groupMessages, activeRooms] = await Promise.all([
      prisma.chatMessage.count({
        where: {
          senderId: userId,
          ...(period !== 'all' && { createdAt: dateFilter }),
        },
      }),
      prisma.chatParticipant.count({
        where: { userId },
      }),
      prisma.chatMessage.count({
        where: {
          senderId: userId,
          room: { isGroup: false },
          ...(period !== 'all' && { createdAt: dateFilter }),
        },
      }),
      prisma.chatMessage.count({
        where: {
          senderId: userId,
          room: { isGroup: true },
          ...(period !== 'all' && { createdAt: dateFilter }),
        },
      }),
      prisma.chatRoom.count({
        where: {
          participants: { some: { userId } },
          updatedAt: dateFilter,
        },
      }),
    ]);
    
    return {
      period,
      totalMessages,
      totalRooms,
      directMessages,
      groupMessages,
      activeRooms,
      averageMessagesPerDay: period !== 'all' ? (totalMessages / 30).toFixed(2) : null,
    };
  }
  
  static async getRoomStats(roomId, period = 'month') {
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'day':
        dateFilter = { gte: new Date(now.setHours(0, 0, 0, 0)) };
        break;
      case 'week':
        dateFilter = { gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case 'month':
        dateFilter = { gte: new Date(now.setMonth(now.getMonth() - 1)) };
        break;
      case 'year':
        dateFilter = { gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
      default:
        dateFilter = {};
    }
    
    const [totalMessages, totalParticipants, uniqueSenders, messagesByUser] = await Promise.all([
      prisma.chatMessage.count({
        where: {
          roomId,
          ...(period !== 'all' && { createdAt: dateFilter }),
        },
      }),
      prisma.chatParticipant.count({
        where: { roomId },
      }),
      prisma.chatMessage.groupBy({
        by: ['senderId'],
        where: {
          roomId,
          ...(period !== 'all' && { createdAt: dateFilter }),
        },
      }),
      prisma.chatMessage.groupBy({
        by: ['senderId'],
        where: {
          roomId,
          ...(period !== 'all' && { createdAt: dateFilter }),
        },
        _count: true,
        orderBy: { _count: { senderId: 'desc' } },
        take: 5,
      }),
    ]);
    
    // Get top contributors details
    const topContributors = await Promise.all(
      messagesByUser.map(async (stat) => {
        const user = await prisma.user.findUnique({
          where: { id: stat.senderId },
          select: {
            id: true,
            display_name: true,
            profile_picture_url: true,
          },
        });
        return {
          ...user,
          messageCount: stat._count,
        };
      })
    );
    
    return {
      period,
      totalMessages,
      totalParticipants,
      activeParticipants: uniqueSenders.length,
      topContributors,
      averageMessagesPerParticipant: totalParticipants > 0 ? (totalMessages / totalParticipants).toFixed(2) : 0,
    };
  }
  
  // ==================== CACHE HELPER METHODS ====================
  
  static async clearRoomCache(roomId) {
    const keys = await redis.keys(`room:${roomId}:*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
  
  static async clearMessagesCache(roomId) {
    const keys = await redis.keys(`messages:${roomId}:*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
  
  static async clearUserRoomsCache(userId) {
    const keys = await redis.keys(`user:${userId}:rooms:*`);
    if (keys.length > 0) {
      await redis.del(keys);
    }
  }
}

export default ChatService;