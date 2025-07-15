
import db from '../../db/connection.js';
import {
    BadRequestError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";
import redisClient from '../../config/redis.js';


// soft delete tokens after usage.
export const deleteBookCategory = async ({ bookcat_id }) => {
    const bookCategory = await db.bookCategory.findUnique({
        where: { bookcat_id: bookcat_id },
    }); // Utilise Prisma avec findUnique

    if (!bookCategory) {
        throw new NotFoundError('Cette bookCategory n\'existe pas!');
    }
    return db.bookCategory.update({
        where: {
            bookcat_id: bookcat_id,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir une bookCategory par ID
export async function getBookCategoryById({ bookcat_id }) {
    try {

        const cacheKey = `cache:bookCategory:${bookcat_id}`;
        const cachedBookCategory = await redisClient.get(cacheKey);

        if (cachedBookCategory) return JSON.parse(cachedBookCategory);

        const bookCategory = await db.bookCategory.findUnique({
            where: { bookcat_id: bookcat_id },
        }); // Utilise Prisma avec findUnique

        if (!bookCategory) {
            throw new NotFoundError('Cette bookCategory n\'existe pas!');
        }

        await redisClient.setEx(cacheKey, 60, JSON.stringify(bookCategory)); // Cache for 60s
        return bookCategory;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createBookCategory = async ({ body, user }) => {
    try {
        const createdbookCategory = await db.bookCategory.create({ data: body });
        return createdbookCategory;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listBookCategorys = async (page = 0,
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
        const bookCategorys = await db.bookCategory.findMany({
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

        const countTotal = await db.bookCategory.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: bookCategorys,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedBookCategorys = async (page = 0,
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
        const bookCategorys = await db.bookCategory.findMany({
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

        const countTotal = await db.bookCategory.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: bookCategorys,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une bookCategory
export const updateBookCategory = async ({ body, user, bookcat_id }) => {
    try {

        const updatedbookCategory = await db.bookCategory.update({
            where: { bookcat_id }, // Utiliser l'ID pour le recherche
            data: body
        });
        if (!updatedbookCategory) {
            throw new BadRequestError("bookCategory non trouvée");
        }

        // Clear cache for all book-related keys
        const cacheKeys = await redisClient.keys('cache:/api/v1/youth/stag/bookCategory*');
        if (cacheKeys.length) await redisClient.del(cacheKeys);
        return updatedbookCategory;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le bookCategory à jour");
    }
}
