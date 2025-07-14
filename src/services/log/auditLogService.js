import db from '../../db/connection.js';

export const logChatAction = async (action, roomId, actorId, options) => {
    return db.chatAuditLog.create({
        data: {
            action,
            roomId,
            actorId,
            targetId: options?.targetId,
            metadata: options?.metadata
        }
    })
}



export const getAuditLogs = async (page = 0,
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
        const logs = await db.chatAuditLog.findMany({
            where: { roomId: roomId },
            include: { actor: true, target: true },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.chatAuditLog.count({
            where: { roomId: roomId },
        });

        return {
            data: logs,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};
