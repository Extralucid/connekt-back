import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    InternalServerError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";
import { codeGenerator } from '../../utils/codeGenerator.js';
import redisClient from '../../config/redis.js';
import pkg from 'bcryptjs';
import { logChatAction } from '../log/auditLogService.js';
const { decodeBase64 } = pkg;

export const createInvite = async ({ roomId, creatorId, expiresAt, maxUses }) => {
    try {
        const token = crypto.randomBytes(16).toString('hex'); // Or JWT

        const invite = await decodeBase64.chatInvite.create({
            data: {
                roomId,
                creatorId,
                token,
                expiresAt: expiresAt,
                maxUses: maxUses,
            },
        });
        io.to(roomId).emit('invite-created', invite)
        return `${process.env.FRONTEND_URL}/join/${token}`; // Return full URL
    } catch (err) {
        throw new BadRequestError(err.message)
    }
};

export const acceptInvite = async ({ token, userId }) => {
    try {
        const invite = await db.chatInvite.findUnique({ where: { token } });

        // Validate
        if (!invite || invite.usedCount >= invite.maxUses || invite.expiresAt < new Date()) {
            throw new BadRequestError('Invalid or expired invite');
        }

        // Add user to group
        await db.$transaction([
            db.chatParticipant.create({
                data: { userId, roomId: invite.roomId, role: 'MEMBER' },
            }),
            db.chatInvite.update({
                where: { id: invite.id },
                data: { usedCount: { increment: 1 } },
            }),
        ]);

        // Notify group
        // In `acceptInvite` service:
        await logChatAction('INVITE_USED', invite.roomId, userId, {
            metadata: { inviteId: invite.id },
        });
        io.to(invite.roomId).emit('user-joined', { userId, roomId: invite.roomId });

        return invite.roomId;
    } catch (err) {
        throw new BadRequestError(err.message)
    }

};

export const createChatRoom = async (body) => {
    try {
        // For 1:1 chats, reuse existing room if it exists
        if (!body.isGroup && body.userIds.length === 2) {
            const existingRoom = await db.chatRoom.findFirst({
                where: {
                    isGroup: false,
                    participants: {
                        every: { userId: { in: body.userIds } },
                    },
                },
            });
            if (existingRoom) return existingRoom;
        }

        const room = await db.chatRoom.create({
            data: {
                ...body,
                participants: {
                    create: body.userIds.map((userId) => ({ userId })),
                },
            },
        });

        return room;
    } catch (err) {
        throw new BadRequestError(err.message)
    }
};

// Obtenir une room par ID
export async function getRoomById({ room_id }) {
    try {
        const cacheKey = `cache:room:${room_id}`;
        const cachedRoom = await redisClient.get(cacheKey);

        if (cachedRoom) return JSON.parse(cachedRoom);


        const room = await db.chatRoom.findUnique({
            where: { room_id: room_id },
            include: { participants: true }
        }); // Utilise Prisma avec findUnique

        if (!room) {
            throw new NotFoundError('Cette room n\'existe pas!');
        }

        await redisClient.setEx(cacheKey, 60, JSON.stringify(room)); // Cache for 60s
        return room;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}

export const getChatMessages = async (page = 0,
    limit = 10,
    search = "",
    order = [], roomId) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "content" : sort.id || "content";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const messages = await db.chatMessage.findMany({
            where: { roomId: roomId },
            include: { sender: true },
            skip: Number(offset),
            take: Number(limit),
            orderBy: { createdAt: 'asc' },
        });

        const countTotal = await db.chatMessage.count({
            where: { roomId: roomId },
        });

        return {
            data: messages,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};


export const getChatRooms = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "content" : sort.id || "content";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const chats = await db.chatRoom.findMany({
            where: {
                OR: [
                    { isGroup: { not: null } },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.chatMessage.count({
            where: {
                OR: [
                    { isGroup: { not: null } },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: chats,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const addToGroup = async ({ userId, roomId }) => {
    try {
        // Check if user is already in the group
        const existingParticipant = await db.chatParticipant.findUnique({
            where: { userId_roomId: { userId, roomId } },
        });

        if (existingParticipant) {
            throw new BadRequestError('User already in group');
            //return res.status(400).json({ message: 'User already in group' });
        }

        // Add user
        const participant = await db.chatParticipant.create({
            data: { userId, roomId, isAdmin: false }, // New members are non-admins by default
            include: { user: true },
        });

        // Notify group via Socket.io
        io.to(roomId).emit('user-added', participant);

        return participant;
    } catch (err) {
        throw new BadRequestError(err.message)

    }

};

export const removeFromGroup = async ({ roomId, userId, user }) => {
    try {
        // Prevent self-removal (optional)
        if (userId === user.id) {
            return res.status(400).json({ message: 'Admins cannot remove themselves' });
        }

        // Delete participant
        await db.chatParticipant.delete({
            where: { userId_roomId: { userId, roomId } },
        });

        // Notify group
        io.to(roomId).emit('user-removed', { userId, roomId });


        return {};
    } catch (err) {
        throw new BadRequestError(err.message)

    }

};