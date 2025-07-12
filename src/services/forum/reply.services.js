import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    InternalServerError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";
import { codeGenerator } from '../../utils/codeGenerator.js';

// soft delete tokens after usage.
export const deleteReply = async ({ reply_id }) => {
    const reply = await db.reply.findUnique({
        where: { reply_id: reply_id },
    }); // Utilise Prisma avec findUnique

    if (!reply) {
        throw new NotFoundError('Cette reply n\'existe pas!');
    }
    return db.reply.update({
        where: {
            reply_id: reply_id,
        },
        data: {
            isAcceptedAnswer: true
        }
    });
}

// Obtenir une reply par ID
export async function getReplyById({reply_id}) {
    try {

        const reply = await db.reply.findUnique({
            where: { reply_id: reply_id },
        }); // Utilise Prisma avec findUnique

        if (!reply) {
            throw new NotFoundError('Cette reply n\'existe pas!');
        }

        return reply;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createReply = async ({ body, user }) => {
    try {
        const createdreply = await db.reply.create({ data: body });
        return createdreply;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listReplys = async (page = 0,
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
        const replys = await db.reply.findMany({
            where: {
                OR: [
                    { isAcceptedAnswer: false },
                    search ? { content: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.reply.count({
            where: {
                OR: [
                    { isAcceptedAnswer: false },
                    search ? { content: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: replys,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedReplys = async (page = 0,
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
        const replys = await db.reply.findMany({
            where: {
                OR: [
                    { isAcceptedAnswer: true },
                    search ? { content: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.reply.count({
            where: {
                OR: [
                    { isAcceptedAnswer: true },
                    search ? { content: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: replys,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une reply
export const updateReply = async ({ body, user, reply_id }) => {
    try {

        const updatedreply = await db.reply.update({
            where: { reply_id }, // Utiliser l'ID pour le recherche
            data: body
        });
        if (!updatedreply) {
            throw new BadRequestError("reply non trouvée");
        }
        return updatedreply;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le reply à jour");
    }
}
