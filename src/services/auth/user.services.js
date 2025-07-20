import { BadRequestError } from '../../../lib/appErrors.js';
import bcrypt from 'bcrypt';
import db from '../../db/connection.js';
import _ from "lodash";
import { codeGenerator } from '../../utils/codeGenerator.js';
import redisClient from '../../config/redis.js';


// soft delete tokens after usage.
export const deleteUser = async ({ id }) => {
    const user = await db.user.findUnique({
        where: { id: id },
    }); // Utilise Prisma avec findUnique

    if (!user) {
        throw new NotFoundError('cet user n\'existe pas!');
    }
    return db.user.update({
        where: {
            id: id,
        },
        data: {
            isDeleted: true
        }
    });
}

function findUserByEmail(email) {
    return db.user.findFirst({
        where: {
            OR: [
                { email: email },
                { phone: email }
            ],
        },
    });
}


export async function findUserById(id) {
    return await db.user.findUnique({
        where: {
            id,
        },
    });
}

// Obtenir une user par ID
export async function getUserById(id) {
    try {

        const user = await db.user.findUnique({
            where: { id: id },
        }); // Utilise Prisma avec findUnique

        if (!user) {
            throw new NotFoundError('cet user n\'existe pas!');
        }

        return user;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}

// Obtenir les parametres de creations d'user
export async function createUserData() {
    try {

        return {
            ressources: await db.ressource.findMany({ where: { isDeleted: false } }),
            agences: await db.agence.findMany({ where: { isDeleted: false } })
        };
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}

// Obtenir les parametres de modification d'user
export async function updateUserData(id) {
    try {
        const user = await db.user.findUnique({
            where: { id: id }
        }); // Utilise Prisma avec findUnique

        if (!user) {
            throw new NotFoundError('cet user n\'existe pas!');
        }

        return {
            user: user,
        };
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}

export const submitReview = async (body, userId) => {
    const { employerId, rating, title, review, pros, cons } = body;
    try {
        const newReview = await db.companyReview.create({
            data: {
                employerId,
                userId: userId,
                rating,
                title,
                review,
                pros,
                cons,
                isApproved: false, // Await moderation
            },
        });

        // Clear cached reviews for this employer
        await redisClient.del(`reviews:employer:${employerId}`);
        return newReview;
    } catch (error) {
        throw new BadRequestError('Failed to submit review');
    }
};

// reviewController.js
export const getEmployerReviews = async ({ userId }) => {
    const cacheKey = `reviews:employer:${id}`;
    try {
        // Check cache
        const cachedReviews = await redisClient.get(cacheKey);
        if (cachedReviews) return JSON.parse(cachedReviews);

        const reviews = await db.companyReview.findMany({
            where: {
                employerId: Number(userId),
                isApproved: true, // Only show approved reviews
            },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        });

        // Cache for 1 hour
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(reviews));
        return reviews;
    } catch (error) {
        throw new BadRequestError('Failed to fetch reviews');
    }
};


export const createUser = async ({ body }) => {
    try {
        console.log(body);

        if (!body.email || !body.password) {
            throw new BadRequestError('You must provide an email and a password.');
        }

        const existingUser = await findUserByEmail(body.email);

        if (existingUser) {
            throw new BadRequestError('Email already in use.');
        }

        const user = await db.user.create({
            data: {
                email: body.email,
                phone: body.phone,
                password: await bcrypt.hash(body.password, 12),
                codeuser: `USR-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`,
                unom: body.unom,
                uprenom: body.uprenom,
                avatar: body.avatar,
                ressourceId: body.ressourceId,
                agenceId: body.agenceId,
                isDeleted: false,
            }
        });
        delete user.password;
        return user;
    } catch (err) {
        console.log(err);
        throw new BadRequestError('Email already in use.');
    }
};

export const listUsers = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "codeuser" : sort.id || "codeuser";
        const orderUser = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const users = await db.user.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { codeuser: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderUser,
            }
        });

        const countTotal = await db.user.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { codeuser: { contains: search, mode: "insensitive" } } : {},
                ],
            }
        });

        return {
            data: users,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedUsers = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "codeuser" : sort.id || "codeuser";
        const orderUser = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const users = await db.user.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { codeuser: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderUser,
            },
        });

        const countTotal = await db.user.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { codeuser: { contains: search, mode: "insensitive" } } : {},
                ]
            },
        });

        return {
            data: users,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une user
export const updateUser = async ({ body, id }) => {
    try {
        const updatedUser = await db.user.update({
            where: { id }, // Utiliser l'ID pour la recherche
            data: {
                email: body.email,
                phone: body.phone,
                unom: body.unom,
                uprenom: body.uprenom,
                avatar: body.avatar,
                ressourceId: body.ressourceId,
                agenceId: body.agenceId,
            }
        });

        return updatedUser
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre la user à jour");
    }
}

