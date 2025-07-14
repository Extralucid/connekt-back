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
export const deleteTag = async ({ tag_id }) => {
    const tag = await db.tag.findUnique({
        where: { tag_id: tag_id },
    }); // Utilise Prisma avec findUnique

    if (!tag) {
        throw new NotFoundError('Cette tag n\'existe pas!');
    }
    return db.tag.update({
        where: {
            tag_id: tag_id,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir une tag par ID
export async function getTagById({tag_id}) {
    try {
        const cacheKey = `cache:tag:${tag_id}`;
        const cachedTag = await redisClient.get(cacheKey);

        if (cachedTag) return JSON.parse(cachedTag);

        const tag = await db.tag.findUnique({
            where: { tag_id: tag_id },
        }); // Utilise Prisma avec findUnique

        if (!tag) {
            throw new NotFoundError('Cette tag n\'existe pas!');
        }

        await redisClient.setEx(cacheKey, 60, JSON.stringify(tag)); // Cache for 60s
        return tag;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createTag = async ({ body, user }) => {
    try {
        const createdtag = await db.tag.create({ data: body });
        return createdtag;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listTags = async (page = 0,
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
        const tags = await db.tag.findMany({
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

        const countTotal = await db.tag.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: tags,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedTags = async (page = 0,
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
        const tags = await db.tag.findMany({
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

        const countTotal = await db.tag.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: tags,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une tag
export const updateTag = async ({ body, user, file, tag_id }) => {
    try {

        const updatedtag = await db.tag.update({
            where: { tag_id }, // Utiliser l'ID pour le recherche
            data: body
        });
        if (!updatedtag) {
            throw new BadRequestError("tag non trouvée");
        }

        // Clear cache for all post-related keys
        const cacheKeys = await redisClient.keys('cache:/api/v1/youth/stag/tag*');
        if (cacheKeys.length) await redisClient.del(cacheKeys);
        return updatedtag;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le tag à jour");
    }
}
