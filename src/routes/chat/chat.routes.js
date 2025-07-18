import router from 'express';
import { createInviteHandler, acceptInviteHandler,listAllChatAuditLogHandler, getChatRoomHandler, createChatRoomHandler, listAllChatsHandler, addToGroupHandler, removeFromGroupHandler, listChatMessagesHandler, changeChatUserRoleHandler } from '../../controllers/chat/chat.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { cache } from '../../middlewares/cacheMiddleware.js';
import { isRoomAdmin } from '../../middlewares/isRoomAdmin.js';
import { hasChatPermission } from '../../middlewares/hasChatPermission.js';

const chatRoutes = router.Router();

const chatRoute = () => {
    // 1:1 or group chat
    chatRoutes.post('/rooms', authentication, createChatRoomHandler);

    // Get user's chats
    chatRoutes.get('/rooms', authentication, listAllChatsHandler);

    // Get messages in a room
    chatRoutes.get('/rooms/:roomId/messages', authentication, listChatMessagesHandler);

    // Accept invitation in a room
    chatRoutes.get('/invites/:token/accept', authentication, acceptInviteHandler);

    // preview  room details
    chatRoutes.get('/invites/:token/details', authentication, getChatRoomHandler);

    // Generate invite link
    chatRoutes.post('/rooms/:roomId/invites', authentication, createInviteHandler);

    // Add user to group (admin-only)
    chatRoutes.post('/rooms/:roomId/participants', authentication, hasChatPermission('MODERATOR'), addToGroupHandler);

    chatRoutes.delete(
        '/rooms/:roomId/participants/:userId',
        authentication,
        isRoomAdmin,
        removeFromGroupHandler
    );

    chatRoutes.post(
        '/rooms/:roomId/participants/:userId',
        authentication,
        isRoomAdmin,
        changeChatUserRoleHandler
    );

    chatRoutes.get(
        '/rooms/:roomId/logs',
        authentication,
        hasChatPermission('ADMIN'), // Only admins can view logs
        listAllChatAuditLogHandler
    );

    return chatRoutes;
};

export default chatRoute;
