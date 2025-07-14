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
export const deleteCategorie = async ({ cat_id }) => {
    const categorie = await db.categorie.findUnique({
        where: { cat_id: cat_id },
    }); // Utilise Prisma avec findUnique

    if (!categorie) {
        throw new NotFoundError('Cette categorie n\'existe pas!');
    }
    return db.categorie.update({
        where: {
            cat_id: cat_id,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir une categorie par ID
export async function getCategorieById({cat_id}) {
    try {

        const cacheKey = `cache:categorie:${cat_id}`;
        const cachedCategorie = await redisClient.get(cacheKey);

        if (cachedCategorie) return JSON.parse(cachedCategorie);

        const categorie = await db.categorie.findUnique({
            where: { cat_id: cat_id },
        }); // Utilise Prisma avec findUnique

        if (!categorie) {
            throw new NotFoundError('Cette categorie n\'existe pas!');
        }

        await redisClient.setEx(cacheKey, 60, JSON.stringify(categorie)); // Cache for 60s
        return categorie;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createCategorie = async ({ body, user }) => {
    try {
        const createdcategorie = await db.categorie.create({ data: body });
        return createdcategorie;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listCategories = async (page = 0,
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
        const categories = await db.categorie.findMany({
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

        const countTotal = await db.categorie.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: categories,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedCategories = async (page = 0,
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
        const categories = await db.categorie.findMany({
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

        const countTotal = await db.categorie.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: categories,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une categorie
export const updateCategorie = async ({ body, user, cat_id }) => {
    try {

        const updatedcategorie = await db.categorie.update({
            where: { cat_id }, // Utiliser l'ID pour le recherche
            data: body
        });
        if (!updatedcategorie) {
            throw new BadRequestError("categorie non trouvée");
        }

        // Clear cache for all post-related keys
        const cacheKeys = await redisClient.keys('cache:/api/v1/youth/stag/categorie*');
        if (cacheKeys.length) await redisClient.del(cacheKeys);
        return updatedcategorie;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le categorie à jour");
    }
}
