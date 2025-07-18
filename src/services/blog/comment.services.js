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

// soft delete tokens after usage.
export const deleteComment = async ({ comment_id }) => {
    const comment = await db.comment.findUnique({
        where: { comment_id: comment_id },
    }); // Utilise Prisma avec findUnique

    if (!comment) {
        throw new NotFoundError('Cette comment n\'existe pas!');
    }
    return db.comment.update({
        where: {
            comment_id: comment_id,
        },
        data: {
            isApproved: false
        }
    });
}

// Obtenir une comment par ID
export async function getCommentById({comment_id}) {
    try {

        const cacheKey = `cache:comment:${comment_id}`;
        const cachedComment = await redisClient.get(cacheKey);

        if (cachedComment) return JSON.parse(cachedComment);

        const comment = await db.comment.findUnique({
            where: { comment_id: comment_id },
        }); // Utilise Prisma avec findUnique

        if (!comment) {
            throw new NotFoundError('Cette comment n\'existe pas!');
        }

        await redisClient.setEx(cacheKey, 60, JSON.stringify(comment)); // Cache for 60s
        return comment;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createComment = async ({ body, user }) => {
    try {
        const createdComment = await db.comment.create({ data: body });
        return createdComment;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listComments = async (page = 0,
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
        const comments = await db.comment.findMany({
            where: {
                OR: [
                    { isApproved: false },
                    search ? { content: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.comment.count({
            where: {
                OR: [
                    { isApproved: false },
                    search ? { content: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: comments,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedComments = async (page = 0,
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
        const comments = await db.comment.findMany({
            where: {
                OR: [
                    { isApproved: true },
                    search ? { content: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.comment.count({
            where: {
                OR: [
                    { isApproved: true },
                    search ? { content: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: comments,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une comment
export const updateComment = async ({ body, user, comment_id }) => {
    try {

        const updatedComment = await db.comment.update({
            where: { comment_id }, // Utiliser l'ID pour le recherche
            data: body
        });
        if (!updatedComment) {
            throw new BadRequestError("comment non trouvée");
        }

        // Clear cache for all post-related keys
        const cacheKeys = await redisClient.keys('cache:/api/v1/youth/stag/comment*');
        if (cacheKeys.length) await redisClient.del(cacheKeys);
        return updatedComment;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le comment à jour");
    }
}
