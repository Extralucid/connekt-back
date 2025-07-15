import db from '../../db/connection.js';
import {
    BadRequestError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";
import redisClient from '../../config/redis.js';

// soft delete tokens after usage.
export const deleteBook = async ({ tutorial_id }) => {

    const tutorial = await db.tutorial.findUnique({
        where: { tutorial_id: tutorial_id },
    }); // Utilise Prisma avec findUnique

    if (!tutorial) {
        throw new NotFoundError('Cette tutorial n\'existe pas!');
    }
    return db.tutorial.update({
        where: {
            tutorial_id: tutorial_id,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir une tutorial par ID
export async function getBookById({ tutorial_id }) {
    try {
        const cacheKey = `cache:tutorial:${tutorial_id}`;
        const cachedBook = await redisClient.get(cacheKey);

        if (cachedBook) return JSON.parse(cachedBook);


        const tutorial = await db.tutorial.findUnique({
            where: { tutorial_id: tutorial_id },
            include: { categories: true }
        }); // Utilise Prisma avec findUnique

        if (!tutorial) {
            throw new NotFoundError('Cette tutorial n\'existe pas!');
        }

        await redisClient.setEx(cacheKey, 60, JSON.stringify(tutorial)); // Cache for 60s
        return tutorial;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createBook = async ({ body, user }) => {
    try {
        const createdtutorial = await db.tutorial.create({
            data: {
                ...body,
                categories: body.categoryIds?.length ? {
                    create: body.categoryIds.map((id) => ({ tutorial_id: id })),
                } : undefined,

            },
            include: { categories: true }
        });
        return createdtutorial;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listBooks = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "title" : sort.id || "title";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const tutorials = await db.tutorial.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { title: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: { categories: true },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.tutorial.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { title: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: tutorials,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedBooks = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "title" : sort.id || "title";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const tutorials = await db.tutorial.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { title: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: { categories: { include: { category: true } }, tags: true },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.tutorial.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { title: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: tutorials,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une tutorial
export const updateBook = async ({ body, user, tutorial_id }) => {
    try {

        const updatedtutorial = await db.tutorial.update({
            where: { tutorial_id }, // Utiliser l'ID pour le recherche
            data: {
                title: body.title,
                description: body.description,
                price: body.price,
                categories: {
                    set: body.categories?.map((tutorial_id) => ({ tutorial_id: tutorial_id })) || [], // Replace categories
                },
            },
            include: { categories: true }, // Return updated tutorial with categories

        });
        if (!updatedtutorial) {
            throw new BadRequestError("tutorial non trouvée");
        }

        // Clear cache for all tutorial-related keys
        const cacheKeys = await redisClient.keys('cache:/api/v1/youth/stag/tutorial*');
        if (cacheKeys.length) await redisClient.del(cacheKeys);
        return updatedtutorial;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le tutorial à jour");
    }
}

