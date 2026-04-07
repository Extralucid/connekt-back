import ChatService  from '../services/chat.service.js';

class ChatController {
  // ==================== CHAT ROOM CONTROLLERS ====================
  
  static async createChatRoom(req, res, next) {
    try {
      const room = await ChatService.createChatRoom(req.userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Chat room created successfully',
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getUserChatRooms(req, res, next) {
    try {
      const result = await ChatService.getUserChatRooms(req.userId, req.query, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getChatRoomById(req, res, next) {
    try {
      const { roomId } = req.params;
      const room = await ChatService.getChatRoomById(roomId, req.userId);
      
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Chat room not found',
        });
      }
      
      res.json({
        success: true,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateChatRoom(req, res, next) {
    try {
      const { roomId } = req.params;
      const room = await ChatService.updateChatRoom(roomId, req.userId, req.body);
      
      res.json({
        success: true,
        message: 'Chat room updated successfully',
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteChatRoom(req, res, next) {
    try {
      const { roomId } = req.params;
      await ChatService.deleteChatRoom(roomId, req.userId);
      
      res.json({
        success: true,
        message: 'Chat room deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== PARTICIPANT CONTROLLERS ====================
  
  static async addParticipant(req, res, next) {
    try {
      const { roomId } = req.params;
      const participant = await ChatService.addParticipant(roomId, req.userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Participant added successfully',
        data: participant,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async removeParticipant(req, res, next) {
    try {
      const { roomId, userId } = req.params;
      await ChatService.removeParticipant(roomId, req.userId, userId);
      
      res.json({
        success: true,
        message: 'Participant removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateParticipantRole(req, res, next) {
    try {
      const { roomId, userId } = req.params;
      const participant = await ChatService.updateParticipantRole(
        roomId,
        req.userId,
        userId,
        req.body.role
      );
      
      res.json({
        success: true,
        message: 'Participant role updated successfully',
        data: participant,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getRoomParticipants(req, res, next) {
    try {
      const { roomId } = req.params;
      const result = await ChatService.getRoomParticipants(roomId, req.userId, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== MESSAGE CONTROLLERS ====================
  
  static async sendMessage(req, res, next) {
    try {
      const { roomId } = req.params;
      const message = await ChatService.sendMessage(roomId, req.userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getMessages(req, res, next) {
    try {
      const { roomId } = req.params;
      const result = await ChatService.getMessages(roomId, req.userId, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async updateMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const message = await ChatService.updateMessage(messageId, req.userId, req.body.content);
      
      res.json({
        success: true,
        message: 'Message updated successfully',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteMessage(req, res, next) {
    try {
      const { messageId } = req.params;
      const isAdmin = req.user.userRoles?.some(r => 
        ['ADMIN', 'SUPER_ADMIN'].includes(r.role.name)
      );
      
      await ChatService.deleteMessage(messageId, req.userId, isAdmin);
      
      res.json({
        success: true,
        message: 'Message deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== REACTION CONTROLLERS ====================
  
  static async addReaction(req, res, next) {
    try {
      const { messageId } = req.params;
      const { reaction } = req.body;
      
      const result = await ChatService.addReaction(messageId, req.userId, reaction);
      
      res.json({
        success: true,
        message: result.added ? 'Reaction added' : 'Reaction removed',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async removeReaction(req, res, next) {
    try {
      const { messageId, reaction } = req.params;
      await ChatService.removeReaction(messageId, req.userId, reaction);
      
      res.json({
        success: true,
        message: 'Reaction removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== INVITE CONTROLLERS ====================
  
  static async createInvite(req, res, next) {
    try {
      const { roomId } = req.params;
      const invite = await ChatService.createInvite(roomId, req.userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Invite created successfully',
        data: {
          token: invite.token,
          inviteUrl: `${process.env.APP_URL}/join/${invite.token}`,
          expiresAt: invite.expiresAt,
          maxUses: invite.maxUses,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async joinViaInvite(req, res, next) {
    try {
      const { token } = req.params;
      const participant = await ChatService.joinViaInvite(token, req.userId);
      
      res.json({
        success: true,
        message: 'Joined chat room successfully',
        data: participant,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getRoomInvites(req, res, next) {
    try {
      const { roomId } = req.params;
      const invites = await ChatService.getRoomInvites(roomId, req.userId);
      
      res.json({
        success: true,
        data: invites,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async deleteInvite(req, res, next) {
    try {
      const { inviteId } = req.params;
      await ChatService.deleteInvite(inviteId, req.userId);
      
      res.json({
        success: true,
        message: 'Invite deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== DIRECT MESSAGE CONTROLLERS ====================
  
  static async sendDirectMessage(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await ChatService.sendDirectMessage(req.userId, userId, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Direct message sent successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getDirectMessages(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await ChatService.getDirectMessages(req.userId, userId, req.query);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async markDirectMessageRead(req, res, next) {
    try {
      const { messageId } = req.params;
      await ChatService.markDirectMessageRead(messageId, req.userId);
      
      res.json({
        success: true,
        message: 'Message marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getUnreadCount(req, res, next) {
    try {
      const unreadCount = await ChatService.getUnreadCount(req.userId);
      
      res.json({
        success: true,
        data: unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== STATS CONTROLLERS ====================
  
  static async getChatStats(req, res, next) {
    try {
      const { period = 'month' } = req.query;
      const stats = await ChatService.getChatStats(req.userId, period);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getRoomStats(req, res, next) {
    try {
      const { roomId } = req.params;
      const { period = 'month' } = req.query;
      const stats = await ChatService.getRoomStats(roomId, period);
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
  
  // ==================== TYPING INDICATOR ====================
  
  static async setTyping(req, res, next) {
    try {
      const { roomId } = req.params;
      const { isTyping } = req.body;
      
      await ChatService.setTyping(req.userId, roomId, isTyping);
      
      res.json({
        success: true,
        message: isTyping ? 'Typing...' : 'Stopped typing',
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getTypingUsers(req, res, next) {
    try {
      const { roomId } = req.params;
      const users = await ChatService.getTypingUsers(roomId);
      
      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default ChatController;