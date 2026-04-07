import express  from 'express';
const router = express.Router();
import ChatController  from '../controllers/chat.controller.js';
import { validate }  from '../middleware/validate.js';
import { verifyAccessToken, requireRole }  from '../middleware/auth.js';
import {
  createChatRoomSchema,
  updateChatRoomSchema,
  getChatRoomsQuerySchema,
  getChatRoomSchema,
  deleteChatRoomSchema,
  addParticipantSchema,
  removeParticipantSchema,
  updateParticipantRoleSchema,
  getParticipantsQuerySchema,
  sendMessageSchema,
  getMessagesQuerySchema,
  updateMessageSchema,
  deleteMessageSchema,
  addReactionSchema,
  removeReactionSchema,
  createInviteSchema,
  joinViaInviteSchema,
  getInvitesSchema,
  deleteInviteSchema,
  sendDirectMessageSchema,
  getDirectMessagesSchema,
  markDirectMessageReadSchema,
  getChatStatsSchema,
  getRoomStatsSchema,
  typingIndicatorSchema,
}  from '../schemas/chatSchema.js';

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: Real-time chat, group messaging, and direct messages
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatRoom:
 *       type: object
 *       properties:
 *         room_id:
 *           type: string
 *         name:
 *           type: string
 *         isGroup:
 *           type: boolean
 *         description:
 *           type: string
 *         participants:
 *           type: array
 *         messages:
 *           type: array
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     ChatMessage:
 *       type: object
 *       properties:
 *         message_id:
 *           type: string
 *         content:
 *           type: string
 *         sender:
 *           $ref: '#/components/schemas/User'
 *         replyTo:
 *           type: object
 *         documents:
 *           type: array
 *         reactions:
 *           type: array
 *         isEdited:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *     
 *     DirectMessage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         message:
 *           type: string
 *         sender:
 *           $ref: '#/components/schemas/User'
 *         receiver:
 *           $ref: '#/components/schemas/User'
 *         isRead:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 */

// ==================== CHAT ROOM ROUTES ====================

/**
 * @swagger
 * /api/chat/rooms:
 *   post:
 *     summary: Create a new chat room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               isGroup:
 *                 type: boolean
 *               description:
 *                 type: string
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Chat room created
 */
router.post(
  '/rooms',
  verifyAccessToken,
  validate(createChatRoomSchema),
  ChatController.createChatRoom
);

/**
 * @swagger
 * /api/chat/rooms:
 *   get:
 *     summary: Get user's chat rooms
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [direct, group]
 *     responses:
 *       200:
 *         description: Chat rooms retrieved
 */
router.get(
  '/rooms',
  verifyAccessToken,
  validate(getChatRoomsQuerySchema),
  ChatController.getUserChatRooms
);

/**
 * @swagger
 * /api/chat/rooms/{roomId}:
 *   get:
 *     summary: Get chat room by ID
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat room retrieved
 *       404:
 *         description: Room not found
 */
router.get(
  '/rooms/:roomId',
  verifyAccessToken,
  validate(getChatRoomSchema),
  ChatController.getChatRoomById
);

/**
 * @swagger
 * /api/chat/rooms/{roomId}:
 *   put:
 *     summary: Update chat room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat room updated
 */
router.put(
  '/rooms/:roomId',
  verifyAccessToken,
  validate(updateChatRoomSchema),
  ChatController.updateChatRoom
);

/**
 * @swagger
 * /api/chat/rooms/{roomId}:
 *   delete:
 *     summary: Delete chat room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat room deleted
 */
router.delete(
  '/rooms/:roomId',
  verifyAccessToken,
  validate(deleteChatRoomSchema),
  ChatController.deleteChatRoom
);

// ==================== PARTICIPANT ROUTES ====================

/**
 * @swagger
 * /api/chat/rooms/{roomId}/participants:
 *   post:
 *     summary: Add participant to room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [MEMBER, MODERATOR, ADMIN]
 *     responses:
 *       201:
 *         description: Participant added
 */
router.post(
  '/rooms/:roomId/participants',
  verifyAccessToken,
  validate(addParticipantSchema),
  ChatController.addParticipant
);

/**
 * @swagger
 * /api/chat/rooms/{roomId}/participants/{userId}:
 *   delete:
 *     summary: Remove participant from room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Participant removed
 */
router.delete(
  '/rooms/:roomId/participants/:userId',
  verifyAccessToken,
  validate(removeParticipantSchema),
  ChatController.removeParticipant
);

/**
 * @swagger
 * /api/chat/rooms/{roomId}/participants/{userId}/role:
 *   put:
 *     summary: Update participant role
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [MEMBER, MODERATOR, ADMIN]
 *     responses:
 *       200:
 *         description: Role updated
 */
router.put(
  '/rooms/:roomId/participants/:userId/role',
  verifyAccessToken,
  validate(updateParticipantRoleSchema),
  ChatController.updateParticipantRole
);

/**
 * @swagger
 * /api/chat/rooms/{roomId}/participants:
 *   get:
 *     summary: Get room participants
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Participants retrieved
 */
router.get(
  '/rooms/:roomId/participants',
  verifyAccessToken,
  validate(getParticipantsQuerySchema),
  ChatController.getRoomParticipants
);

// ==================== MESSAGE ROUTES ====================

/**
 * @swagger
 * /api/chat/rooms/{roomId}/messages:
 *   post:
 *     summary: Send message to room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               replyToId:
 *                 type: string
 *               documentIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post(
  '/rooms/:roomId/messages',
  verifyAccessToken,
  validate(sendMessageSchema),
  ChatController.sendMessage
);

/**
 * @swagger
 * /api/chat/rooms/{roomId}/messages:
 *   get:
 *     summary: Get room messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Messages retrieved
 */
router.get(
  '/rooms/:roomId/messages',
  verifyAccessToken,
  validate(getMessagesQuerySchema),
  ChatController.getMessages
);

/**
 * @swagger
 * /api/chat/messages/{messageId}:
 *   put:
 *     summary: Update message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message updated
 */
router.put(
  '/messages/:messageId',
  verifyAccessToken,
  validate(updateMessageSchema),
  ChatController.updateMessage
);

/**
 * @swagger
 * /api/chat/messages/{messageId}:
 *   delete:
 *     summary: Delete message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.delete(
  '/messages/:messageId',
  verifyAccessToken,
  validate(deleteMessageSchema),
  ChatController.deleteMessage
);

// ==================== REACTION ROUTES ====================

/**
 * @swagger
 * /api/chat/messages/{messageId}/reactions:
 *   post:
 *     summary: Add reaction to message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reaction
 *             properties:
 *               reaction:
 *                 type: string
 *                 example: 👍
 *     responses:
 *       200:
 *         description: Reaction added
 */
router.post(
  '/messages/:messageId/reactions',
  verifyAccessToken,
  validate(addReactionSchema),
  ChatController.addReaction
);

/**
 * @swagger
 * /api/chat/messages/{messageId}/reactions/{reaction}:
 *   delete:
 *     summary: Remove reaction from message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: reaction
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reaction removed
 */
router.delete(
  '/messages/:messageId/reactions/:reaction',
  verifyAccessToken,
  validate(removeReactionSchema),
  ChatController.removeReaction
);

// ==================== INVITE ROUTES ====================

/**
 * @swagger
 * /api/chat/rooms/{roomId}/invites:
 *   post:
 *     summary: Create invite link for room
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               maxUses:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Invite created
 */
router.post(
  '/rooms/:roomId/invites',
  verifyAccessToken,
  validate(createInviteSchema),
  ChatController.createInvite
);

/**
 * @swagger
 * /api/chat/join/{token}:
 *   post:
 *     summary: Join room via invite token
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Joined successfully
 */
router.post(
  '/join/:token',
  verifyAccessToken,
  validate(joinViaInviteSchema),
  ChatController.joinViaInvite
);

/**
 * @swagger
 * /api/chat/rooms/{roomId}/invites:
 *   get:
 *     summary: Get room invites
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invites retrieved
 */
router.get(
  '/rooms/:roomId/invites',
  verifyAccessToken,
  validate(getInvitesSchema),
  ChatController.getRoomInvites
);

/**
 * @swagger
 * /api/chat/invites/{inviteId}:
 *   delete:
 *     summary: Delete invite
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inviteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invite deleted
 */
router.delete(
  '/invites/:inviteId',
  verifyAccessToken,
  validate(deleteInviteSchema),
  ChatController.deleteInvite
);

// ==================== DIRECT MESSAGE ROUTES ====================

/**
 * @swagger
 * /api/chat/direct/{userId}:
 *   post:
 *     summary: Send direct message to user
 *     tags: [Direct Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               replyToId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post(
  '/direct/:userId',
  verifyAccessToken,
  validate(sendDirectMessageSchema),
  ChatController.sendDirectMessage
);

/**
 * @swagger
 * /api/chat/direct/{userId}:
 *   get:
 *     summary: Get direct messages with user
 *     tags: [Direct Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Messages retrieved
 */
router.get(
  '/direct/:userId',
  verifyAccessToken,
  validate(getDirectMessagesSchema),
  ChatController.getDirectMessages
);

/**
 * @swagger
 * /api/chat/direct/messages/{messageId}/read:
 *   put:
 *     summary: Mark direct message as read
 *     tags: [Direct Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message marked as read
 */
router.put(
  '/direct/messages/:messageId/read',
  verifyAccessToken,
  validate(markDirectMessageReadSchema),
  ChatController.markDirectMessageRead
);

/**
 * @swagger
 * /api/chat/unread/count:
 *   get:
 *     summary: Get unread messages count
 *     tags: [Direct Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved
 */
router.get(
  '/unread/count',
  verifyAccessToken,
  ChatController.getUnreadCount
);

// ==================== TYPING INDICATOR ROUTES ====================

/**
 * @swagger
 * /api/chat/rooms/{roomId}/typing:
 *   post:
 *     summary: Set typing indicator
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isTyping
 *             properties:
 *               isTyping:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Typing status updated
 */
router.post(
  '/rooms/:roomId/typing',
  verifyAccessToken,
  validate(typingIndicatorSchema),
  ChatController.setTyping
);

/**
 * @swagger
 * /api/chat/rooms/{roomId}/typing:
 *   get:
 *     summary: Get users currently typing
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Typing users retrieved
 */
router.get(
  '/rooms/:roomId/typing',
  verifyAccessToken,
  ChatController.getTypingUsers
);

// ==================== STATS ROUTES ====================

/**
 * @swagger
 * /api/chat/stats:
 *   get:
 *     summary: Get user chat statistics
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year, all]
 *           default: month
 *     responses:
 *       200:
 *         description: Chat statistics retrieved
 */
router.get(
  '/stats',
  verifyAccessToken,
  validate(getChatStatsSchema),
  ChatController.getChatStats
);

/**
 * @swagger
 * /api/chat/rooms/{roomId}/stats:
 *   get:
 *     summary: Get room statistics
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year, all]
 *           default: month
 *     responses:
 *       200:
 *         description: Room statistics retrieved
 */
router.get(
  '/rooms/:roomId/stats',
  verifyAccessToken,
  validate(getRoomStatsSchema),
  ChatController.getRoomStats
);

export default router;