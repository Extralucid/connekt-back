import db from '../../db/connection.js';
import {
    BadRequestError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";
import redisClient from '../../config/redis.js';

// soft delete tokens after usage.
export const deleteApplication = async ({ app_id }) => {

    const application = await db.application.findUnique({
        where: { app_id: app_id },
    }); // Utilise Prisma avec findUnique

    if (!application) {
        throw new NotFoundError('Cette application n\'existe pas!');
    }
    return db.application.update({
        where: {
            app_id: app_id,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir une application par ID
export async function getApplicationById({ app_id }) {
    try {
        const cacheKey = `cache:application:${app_id}`;
        const cachedApplication = await redisClient.get(cacheKey);

        if (cachedApplication) return JSON.parse(cachedApplication);


        const application = await db.application.findUnique({
            where: { app_id: app_id },
        }); // Utilise Prisma avec findUnique

        if (!application) {
            throw new NotFoundError('Cette application n\'existe pas!');
        }

        await redisClient.setEx(cacheKey, 60, JSON.stringify(application)); // Cache for 60s
        return application;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createApplication = async ({ body, user }) => {
    try {
        const createdapplication = await db.application.create({
            data: {
                ...body,
                userId: user.id,
                documents: body.docIds?.length ? {
                    create: body.docIds.map((id) => ({ docId: id })),
                } : undefined,

            },
        });
        return createdapplication;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

// 
export const getApplicationTimeline = async ({appId}) => {
    try {
        const timeline = await db.applicationEvent.findMany({
            where: { applicationId: Number(appId) },
            orderBy: { createdAt: 'asc' },
            include: { createdBy: { select: { name: true } } }, // Show actor name
        });
        return timeline;
    } catch (error) {
        throw new BadRequestError('Failed to fetch timeline' );
    }
};

export const listApplications = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "status" : sort.id || "status";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const applications = await db.application.findMany({
            where: {
                OR: [
                    { status: { not: null } },
                    search ? { status: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: { job: true, user: true },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.application.count({
            where: {
                OR: [
                    { status: { not: null } },
                    search ? { status: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: applications,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedApplications = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "status" : sort.id || "status";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const applications = await db.application.findMany({
            where: {
                OR: [
                    { status: { not: null } },
                    search ? { status: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: { job: true, user: true },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.application.count({
            where: {
                OR: [
                    { status: { not: null } },
                    search ? { status: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: applications,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une application
export const updateApplication = async ({ body, user, app_id }) => {
    try {

        const updatedapplication = await db.application.update({
            where: { app_id }, // Utiliser l'ID pour le recherche
            data: body
        });

        // 2. Handle Categories (Many-to-Many)
        if (body.docIds) {
            // Delete existing connections and recreate
            await db.applicationDoc.deleteMany({ where: { appId: app_id } });
            await db.applicationDoc.createMany({
                data: body.docIds.map((docId) => ({
                    app_id,
                    docId,
                })),
            });
        }
        if (!updatedapplication) {
            throw new BadRequestError("application non trouvée");
        }

        // Clear cache for all application-related keys
        const cacheKeys = await redisClient.keys('cache:/api/v1/youth/stag/application*');
        if (cacheKeys.length) await redisClient.del(cacheKeys);
        return updatedapplication;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le application à jour");
    }
}
