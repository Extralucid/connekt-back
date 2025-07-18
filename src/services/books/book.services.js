import db from '../../db/connection.js';
import {
    BadRequestError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";
import redisClient from '../../config/redis.js';

// soft delete tokens after usage.
export const deleteBook = async ({ book_id }) => {

    const book = await db.book.findUnique({
        where: { book_id: book_id },
    }); // Utilise Prisma avec findUnique

    if (!book) {
        throw new NotFoundError('Cette book n\'existe pas!');
    }
    return db.book.update({
        where: {
            book_id: book_id,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir une book par ID
export async function getBookById({ book_id }) {
    try {
        const cacheKey = `cache:book:${book_id}`;
        const cachedBook = await redisClient.get(cacheKey);

        if (cachedBook) return JSON.parse(cachedBook);


        const book = await db.book.findUnique({
            where: { book_id: book_id },
            include: { categories: true }
        }); // Utilise Prisma avec findUnique

        if (!book) {
            throw new NotFoundError('Cette book n\'existe pas!');
        }

        await redisClient.setEx(cacheKey, 60, JSON.stringify(book)); // Cache for 60s
        return book;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createBook = async ({ body, user }) => {
    try {
        const createdbook = await db.book.create({
            data: {
                ...body,
                categories: body.categoryIds?.length ? {
                    create: body.categoryIds.map((id) => ({ bookcat_id: id })),
                } : undefined,

            },
            include: { categories: true }
        });
        return createdbook;
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
        const books = await db.book.findMany({
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

        const countTotal = await db.book.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { title: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: books,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listRecommendedBooks = async (page = 0,
    limit = 10,
    search = "",
    order = [], user = null) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "title" : sort.id || "title";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const books = await db.book.findMany({
            where: {
                categories: {
                    some: { id: { in: user.preferences.bookCategories } },
                },
                //search ? { title: { contains: search, mode: "insensitive" } } : {},
            },
            include: { categories: true },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.book.count({
            where: {
                categories: {
                    some: { id: { in: user.preferences.bookCategories } },
                },
            },
        });

        return {
            data: books,
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
        const books = await db.book.findMany({
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

        const countTotal = await db.book.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { title: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: books,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une book
export const updateBook = async ({ body, user, book_id }) => {
    try {

        const updatedbook = await db.book.update({
            where: { book_id }, // Utiliser l'ID pour le recherche
            data: {
                title: body.title,
                description: body.description,
                price: body.price,
                categories: {
                    set: body.categories?.map((bookcat_id) => ({ bookcat_id: bookcat_id })) || [], // Replace categories
                },
            },
            include: { categories: true }, // Return updated book with categories

        });
        if (!updatedbook) {
            throw new BadRequestError("book non trouvée");
        }

        // Clear cache for all book-related keys
        const cacheKeys = await redisClient.keys('cache:/api/v1/youth/stag/book*');
        if (cacheKeys.length) await redisClient.del(cacheKeys);
        return updatedbook;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le book à jour");
    }
}

