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
export const deleteCategory = async ({ category_id }) => {
    const category = await db.category.findUnique({
        where: { category_id: category_id },
    }); // Utilise Prisma avec findUnique

    if (!category) {
        throw new NotFoundError('Cette category n\'existe pas!');
    }
    return db.category.update({
        where: {
            category_id: category_id,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir une category par ID
export async function getCategoryById({category_id}) {
    try {

        const category = await db.category.findUnique({
            where: { category_id: category_id },
        }); // Utilise Prisma avec findUnique

        if (!category) {
            throw new NotFoundError('Cette category n\'existe pas!');
        }

        return category;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createCategory = async ({ body, user }) => {
    try {
        const createdcategory = await db.category.create({ data: body });
        return createdcategory;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listCategorys = async (page = 0,
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
        const categorys = await db.category.findMany({
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

        const countTotal = await db.category.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: categorys,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedCategorys = async (page = 0,
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
        const categorys = await db.category.findMany({
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

        const countTotal = await db.category.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: categorys,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une category
export const updateCategory = async ({ body, user, category_id }) => {
    try {

        const updatedcategory = await db.category.update({
            where: { category_id }, // Utiliser l'ID pour le recherche
            data: body
        });
        if (!updatedcategory) {
            throw new BadRequestError("category non trouvée");
        }

        // Clear cache for all post-related keys
        const cacheKeys = await redisClient.keys('cache:/api/v1/youth/stag/category*');
        if (cacheKeys.length) await redisClient.del(cacheKeys);
        return updatedcategory;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le category à jour");
    }
}
