import db from '../../db/connection.js';
import {
    BadRequestError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";
import redisClient from '../../config/redis.js';

// soft delete tokens after usage.
export const deleteTutorialCategory = async ({ tutcat_id }) => {
    const tutorialCategory = await db.tutorialCategory.findUnique({
        where: { tutcat_id: tutcat_id },
    }); // Utilise Prisma avec findUnique

    if (!tutorialCategory) {
        throw new NotFoundError('Cette Category n\'existe pas!');
    }
    return db.tutorialCategory.update({
        where: {
            tutcat_id: tutcat_id,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir une tutorialCategory par ID
export async function getTutorialCategoryById({ tutcat_id }) {
    try {

        const cacheKey = `cache:tutorialCategory:${tutcat_id}`;
        const cachedTutorialCategory = await redisClient.get(cacheKey);

        if (cachedTutorialCategory) return JSON.parse(cachedTutorialCategory);

        const tutorialCategory = await db.tutorialCategory.findUnique({
            where: { tutcat_id: tutcat_id },
        }); // Utilise Prisma avec findUnique

        if (!tutorialCategory) {
            throw new NotFoundError('Cette tutorialCategory n\'existe pas!');
        }

        await redisClient.setEx(cacheKey, 60, JSON.stringify(tutorialCategory)); // Cache for 60s
        return tutorialCategory;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createTutorialCategory = async ({ body, user }) => {
    try {
        const createdtutorialCategory = await db.tutorialCategory.create({ data: body });
        return createdtutorialCategory;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listTutorialCategorys = async (page = 0,
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
        const tutorialCategorys = await db.tutorialCategory.findMany({
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

        const countTotal = await db.tutorialCategory.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: tutorialCategorys,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedTutorialCategorys = async (page = 0,
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
        const tutorialCategorys = await db.tutorialCategory.findMany({
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

        const countTotal = await db.tutorialCategory.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: tutorialCategorys,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une tutorialCategory
export const updateTutorialCategory = async ({ body, user, tutcat_id }) => {
    try {

        const updatedtutorialCategory = await db.tutorialCategory.update({
            where: { tutcat_id }, // Utiliser l'ID pour le recherche
            data: body
        });
        if (!updatedtutorialCategory) {
            throw new BadRequestError("tutorialCategory non trouvée");
        }

        // Clear cache for all book-related keys
        const cacheKeys = await redisClient.keys('cache:/api/v1/youth/stag/tutorialCategory*');
        if (cacheKeys.length) await redisClient.del(cacheKeys);
        return updatedtutorialCategory;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le tutorialCategory à jour");
    }
}