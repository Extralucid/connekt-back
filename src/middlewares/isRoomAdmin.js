import db from '../db/connection.js';
import {
    BadRequestError} from '../../lib/appErrors.js';
export const isRoomAdmin = async (req, res, next) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    const participant = await db.chatParticipant.findUnique({
        where: { userId_roomId: { userId, roomId } },
    });

    if (!participant?.isAdmin) {
        throw new BadRequestError({ message: 'Only group admins can modify members' });
    }
    next();
};