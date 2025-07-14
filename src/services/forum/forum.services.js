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
export const deleteForum = async ({ forum_id }) => {
    const forum = await db.forum.findUnique({
        where: { forum_id: forum_id },
    }); // Utilise Prisma avec findUnique

    if (!forum) {
        throw new NotFoundError('Cette forum n\'existe pas!');
    }
    return db.forum.update({
        where: {
            forum_id: forum_id,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir une forum par ID
export async function getForumById({ forum_id }) {
    try {

        const cacheKey = `cache:forum:${post_id}`;
        const cachedForum = await redisClient.get(cacheKey);

        if (cachedForum) return JSON.parse(cachedForum);
        
        const forum = await db.forum.findUnique({
            where: { forum_id: forum_id },
        }); // Utilise Prisma avec findUnique

        if (!forum) {
            throw new NotFoundError('Cette forum n\'existe pas!');
        }

        await redisClient.setEx(cacheKey, 60, JSON.stringify(forum)); // Cache for 60s
        return forum;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createForum = async ({ body, user }) => {
    try {
        const createdforum = await db.forum.create({ data: body });
        return createdforum;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listForums = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "name" : sort.id || "name";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const forums = await db.forum.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.forum.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: forums,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedForums = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "name" : sort.id || "name";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const forums = await db.forum.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.forum.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: forums,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une forum
export const updateForum = async ({ body, user, forum_id }) => {
    try {

        const updatedforum = await db.forum.update({
            where: { forum_id }, // Utiliser l'ID pour le recherche
            data: body
        });
        if (!updatedforum) {
            throw new BadRequestError("forum non trouvée");
        }
        // Clear cache for all post-related keys
        const cacheKeys = await redisClient.keys('cache:/api/v1/youth/stag/forum*');
        if (cacheKeys.length) await redisClient.del(cacheKeys);
        return updatedforum;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le forum à jour");
    }
}
