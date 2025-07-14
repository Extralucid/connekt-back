import appResponse from '../../../lib/appResponse.js';

import { createInvite, acceptInvite, createChatRoom, getChatMessages, addToGroup, removeFromGroup, getChatRooms, getRoomById } from '../../services/chat/chat.services.js';
import { getAuditLogs, logChatAction } from '../../services/log/auditLogService.js';


export const createInviteHandler = async (req, res) => {
    const { body, user } = req;
    const userId = user.id;
    const { expiresAt, maxUses } = body;

    const response = await createInvite({ roomId, userId, expiresAt, maxUses });

    res.send(appResponse('Chat Invite created successfully', response));
};
export const getChatRoomHandler = async (req, res) => {
    const room_id = req.params.id;

    const response = await getRoomById({ room_id });

    res.send(appResponse('Room fetched successfully', response));
};

export const acceptInviteHandler = async (req, res) => {
    const token = req.params.token;
    const userId = req.user.id;

    const response = await acceptInvite({ token, userId });

    res.send(appResponse('Chat accepted successfully', response));
};
export const listChatMessagesHandler = async (req, res) => {
    const { page = 1, limit = 10, search = "", order = [] } = req.query;
    const roomId = req.params.roomId;

    const response = await getChatMessages(Number(page), Number(limit), search, order, roomId);

    res.send(appResponse('room messages listed successfully', response));
};

export const listAllChatsHandler = async (req, res) => {
    const { page = 1, limit = 10, search = "", order = [] } = req.query;

    const response = await getChatRooms(Number(page), Number(limit), search, order);

    res.send(appResponse('Chats listed successfully', response));
};

export const listAllChatAuditLogHandler = async (req, res) => {
    const { page = 1, limit = 10, search = "", order = [] } = req.query;
    const roomId = req.params.roomId;

    const response = await getAuditLogs(Number(page), Number(limit), search, order);

    res.send(appResponse('Chats listed successfully', response));
};

export const addToGroupHandler = async (req, res) => {
    const { body, user } = req;

    const response = await addToGroup(body);
    // In `addToGroup` controller:
    await logChatAction('USER_ADDED', body.roomId, user.id, {
        targetId: body.userId,
        metadata: { role: 'MEMBER' }, // Optional context
    });
    res.send(appResponse('user added successfully', response));
};

export const removeFromGroupHandler = async (req, res) => {
    const { body, user } = req;
    const { roomId, userId } = body;

    const response = await removeFromGroup({ roomId, userId, user });

    res.send(appResponse('user removed successfully', response));
};

export const createChatRoomHandler = async (req, res) => {
    const { body } = req;

    const response = await createChatRoom(body);

    res.send(appResponse('ChatRoom created successfully', response));
};