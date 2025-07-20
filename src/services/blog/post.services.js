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
export const deletePost = async ({ post_id }) => {

    const post = await db.post.findUnique({
        where: { post_id: post_id },
    }); // Utilise Prisma avec findUnique

    if (!post) {
        throw new NotFoundError('Cette post n\'existe pas!');
    }
    return db.post.update({
        where: {
            post_id: post_id,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir une post par ID
export async function getPostById({ post_id }) {
    try {
        const cacheKey = `cache:post:${post_id}`;
        const cachedPost = await redisClient.get(cacheKey);

        if (cachedPost) return JSON.parse(cachedPost);


        const post = await db.post.findUnique({
            where: { post_id: post_id },
        }); // Utilise Prisma avec findUnique

        if (!post) {
            throw new NotFoundError('Cette post n\'existe pas!');
        }

        await redisClient.setEx(cacheKey, 60, JSON.stringify(post)); // Cache for 60s
        return post;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createPost = async ({ body, user }) => {
    try {
        const createdpost = await db.post.create({
            data: {
                ...body,
                authorId: userId,
                categories: body.categoryIds?.length ? {
                    create: body.categoryIds.map((id) => ({ categoryId: id })),
                } : undefined,
                tags: body.tagIds?.length ? {
                    create: body.tagIds.map((id) => ({ tagId: id })),
                } : undefined,
            },
        });
        return createdpost;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listPosts = async (page = 0,
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
        const posts = await db.post.findMany({
            where: {
                OR: [
                    { status: { not: null } },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: { categories: { include: { category: true } }, tags: true },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.post.count({
            where: {
                OR: [
                    { status: { not: null } },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: posts,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};


export const listRecommandedPosts = async (page = 0,
    limit = 10,
    search = "",
    order = [], user = null) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "name" : sort.id || "name";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const posts = await db.post.findMany({
            where: {
                categories: {
                    some: { id: { in: user.preferences.blogCategories } },
                },
            },
            include: { categories: { include: { category: true } }, tags: true },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.post.count({
            where: {
                categories: {
                    some: { id: { in: user.preferences.blogCategories } },
                },
            },
        });

        return {
            data: posts,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};


export const listDeletedPosts = async (page = 0,
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
        const posts = await db.post.findMany({
            where: {
                OR: [
                    { status: { not: null } },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: { categories: { include: { category: true } }, tags: true },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.post.count({
            where: {
                OR: [
                    { status: { not: null } },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: posts,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une post
export const updatePost = async ({ body, user, post_id }) => {
    try {

        const updatedpost = await db.post.update({
            where: { post_id }, // Utiliser l'ID pour le recherche
            data: body
        });
        if (!updatedpost) {
            throw new BadRequestError("post non trouvée");
        }

        // Clear cache for all post-related keys
        const cacheKeys = await redisClient.keys('cache:/api/v1/youth/stag/post*');
        if (cacheKeys.length) await redisClient.del(cacheKeys);
        return updatedpost;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le post à jour");
    }
}
