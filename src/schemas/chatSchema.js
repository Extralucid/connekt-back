import { z }  from 'zod';

// ==================== CHAT ROOM SCHEMAS ====================

// Create Chat Room Schema
const createChatRoomSchema = z.object({
  body: z.object({
    name: z.string()
      .min(3, 'Room name must be at least 3 characters')
      .max(100, 'Room name cannot exceed 100 characters')
      .optional(),
    isGroup: z.boolean()
      .default(false),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
    participantIds: z.array(z.string().uuid())
      .min(1, 'At least one participant is required')
      .max(100, 'Maximum 100 participants per group'),
  }),
});

// Update Chat Room Schema
const updateChatRoomSchema = z.object({
  params: z.object({
    roomId: z.string()
      .uuid('Invalid room ID'),
  }),
  body: z.object({
    name: z.string()
      .min(3, 'Room name must be at least 3 characters')
      .max(100, 'Room name cannot exceed 100 characters')
      .optional(),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional(),
  }),
});

// Get Chat Rooms Query Schema
const getChatRoomsQuerySchema = z.object({
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .default('20'),
    type: z.enum(['direct', 'group'])
      .optional(),
  }),
});

// Get Chat Room by ID Schema
const getChatRoomSchema = z.object({
  params: z.object({
    roomId: z.string()
      .uuid('Invalid room ID'),
  }),
});

// Delete Chat Room Schema
const deleteChatRoomSchema = z.object({
  params: z.object({
    roomId: z.string()
      .uuid('Invalid room ID'),
  }),
});

// ==================== CHAT PARTICIPANT SCHEMAS ====================

// Add Participant Schema
const addParticipantSchema = z.object({
  params: z.object({
    roomId: z.string()
      .uuid('Invalid room ID'),
  }),
  body: z.object({
    userId: z.string()
      .uuid('Invalid user ID'),
    role: z.enum(['MEMBER', 'MODERATOR', 'ADMIN'])
      .default('MEMBER'),
  }),
});

// Remove Participant Schema
const removeParticipantSchema = z.object({
  params: z.object({
    roomId: z.string()
      .uuid('Invalid room ID'),
    userId: z.string()
      .uuid('Invalid user ID'),
  }),
});

// Update Participant Role Schema
const updateParticipantRoleSchema = z.object({
  params: z.object({
    roomId: z.string()
      .uuid('Invalid room ID'),
    userId: z.string()
      .uuid('Invalid user ID'),
  }),
  body: z.object({
    role: z.enum(['MEMBER', 'MODERATOR', 'ADMIN']),
  }),
});

// Get Participants Query Schema
const getParticipantsQuerySchema = z.object({
  params: z.object({
    roomId: z.string()
      .uuid('Invalid room ID'),
  }),
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .default('50'),
  }),
});

// ==================== CHAT MESSAGE SCHEMAS ====================

// Send Message Schema
const sendMessageSchema = z.object({
  params: z.object({
    roomId: z.string()
      .uuid('Invalid room ID'),
  }),
  body: z.object({
    content: z.string()
      .min(1, 'Message cannot be empty')
      .max(5000, 'Message cannot exceed 5000 characters'),
    replyToId: z.string()
      .uuid('Invalid message ID')
      .optional(),
    documentIds: z.array(z.string().uuid())
      .max(10, 'Maximum 10 documents per message')
      .optional(),
  }),
});

// Get Messages Query Schema
const getMessagesQuerySchema = z.object({
  params: z.object({
    roomId: z.string()
      .uuid('Invalid room ID'),
  }),
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .default('50'),
    before: z.string()
      .datetime()
      .optional(),
    after: z.string()
      .datetime()
      .optional(),
  }),
});

// Update Message Schema
const updateMessageSchema = z.object({
  params: z.object({
    messageId: z.string()
      .uuid('Invalid message ID'),
  }),
  body: z.object({
    content: z.string()
      .min(1, 'Message cannot be empty')
      .max(5000, 'Message cannot exceed 5000 characters'),
  }),
});

// Delete Message Schema
const deleteMessageSchema = z.object({
  params: z.object({
    messageId: z.string()
      .uuid('Invalid message ID'),
  }),
});

// ==================== MESSAGE REACTION SCHEMAS ====================

// Add Reaction Schema
const addReactionSchema = z.object({
  params: z.object({
    messageId: z.string()
      .uuid('Invalid message ID'),
  }),
  body: z.object({
    reaction: z.string()
      .min(1, 'Reaction cannot be empty')
      .max(10, 'Reaction too long'),
  }),
});

// Remove Reaction Schema
const removeReactionSchema = z.object({
  params: z.object({
    messageId: z.string()
      .uuid('Invalid message ID'),
    reaction: z.string(),
  }),
});

// ==================== CHAT INVITE SCHEMAS ====================

// Create Invite Schema
const createInviteSchema = z.object({
  params: z.object({
    roomId: z.string()
      .uuid('Invalid room ID'),
  }),
  body: z.object({
    expiresAt: z.string()
      .datetime()
      .optional(),
    maxUses: z.number()
      .int()
      .min(1, 'Max uses must be at least 1')
      .max(1000, 'Max uses cannot exceed 1000')
      .optional(),
  }),
});

// Join via Invite Schema
const joinViaInviteSchema = z.object({
  params: z.object({
    token: z.string(),
  }),
});

// Get Invites Schema
const getInvitesSchema = z.object({
  params: z.object({
    roomId: z.string()
      .uuid('Invalid room ID'),
  }),
});

// Delete Invite Schema
const deleteInviteSchema = z.object({
  params: z.object({
    inviteId: z.string()
      .uuid('Invalid invite ID'),
  }),
});

// ==================== DIRECT MESSAGE SCHEMAS ====================

// Send Direct Message Schema
const sendDirectMessageSchema = z.object({
  params: z.object({
    userId: z.string()
      .uuid('Invalid user ID'),
  }),
  body: z.object({
    content: z.string()
      .min(1, 'Message cannot be empty')
      .max(5000, 'Message cannot exceed 5000 characters'),
    replyToId: z.string()
      .uuid('Invalid message ID')
      .optional(),
  }),
});

// Get Direct Messages Schema
const getDirectMessagesSchema = z.object({
  params: z.object({
    userId: z.string()
      .uuid('Invalid user ID'),
  }),
  query: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .default('50'),
    before: z.string()
      .datetime()
      .optional(),
  }),
});

// Mark Direct Message as Read Schema
const markDirectMessageReadSchema = z.object({
  params: z.object({
    messageId: z.string()
      .uuid('Invalid message ID'),
  }),
});

// ==================== TYPING INDICATOR SCHEMAS ====================

// Typing Indicator Schema (WebSocket)
const typingIndicatorSchema = z.object({
  roomId: z.string()
    .uuid('Invalid room ID'),
  isTyping: z.boolean(),
});

// ==================== CHAT STATS SCHEMAS ====================

// Get Chat Stats Schema
const getChatStatsSchema = z.object({
  query: z.object({
    period: z.enum(['day', 'week', 'month', 'year', 'all'])
      .default('month'),
  }),
});

// Get Room Stats Schema
const getRoomStatsSchema = z.object({
  params: z.object({
    roomId: z.string()
      .uuid('Invalid room ID'),
  }),
  query: z.object({
    period: z.enum(['day', 'week', 'month', 'year', 'all'])
      .default('month'),
  }),
});

export {
  // Chat Room schemas
  createChatRoomSchema,
  updateChatRoomSchema,
  getChatRoomsQuerySchema,
  getChatRoomSchema,
  deleteChatRoomSchema,
  
  // Participant schemas
  addParticipantSchema,
  removeParticipantSchema,
  updateParticipantRoleSchema,
  getParticipantsQuerySchema,
  
  // Message schemas
  sendMessageSchema,
  getMessagesQuerySchema,
  updateMessageSchema,
  deleteMessageSchema,
  
  // Reaction schemas
  addReactionSchema,
  removeReactionSchema,
  
  // Invite schemas
  createInviteSchema,
  joinViaInviteSchema,
  getInvitesSchema,
  deleteInviteSchema,
  
  // Direct Message schemas
  sendDirectMessageSchema,
  getDirectMessagesSchema,
  markDirectMessageReadSchema,
  
  // Typing indicator
  typingIndicatorSchema,
  
  // Stats schemas
  getChatStatsSchema,
  getRoomStatsSchema,
};