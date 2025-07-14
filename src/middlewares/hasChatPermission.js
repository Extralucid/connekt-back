import db from '../db/connection.js';
import {
    BadRequestError} from '../../lib/appErrors.js';

export const hasChatPermission = (requiredRole) => {
  return async (req, res, next) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    const participant = await db.chatParticipant.findUnique({
      where: { userId_roomId: { userId, roomId } },
    });

    if (!participant || participant.role > requiredRole) {
      throw new BadRequestError({ message: 'Insufficient permissions' });
    }

    next();
  };
};