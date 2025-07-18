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
export const deleteJob = async ({ job_id }) => {

    const job = await db.job.findUnique({
        where: { job_id: job_id },
    }); // Utilise Prisma avec findUnique

    if (!job) {
        throw new NotFoundError('Cette job n\'existe pas!');
    }
    return db.job.update({
        where: {
            job_id: job_id,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir une job par ID
export async function getJobById({ job_id, user }) {
    try {
        const cacheKey = `cache:job:${job_id}`;
        const cachedJob = await redisClient.get(cacheKey);

        if (cachedJob) {
            await db.jobView.create({
                data: {
                    jobId: job_id,
                    userId: user.id, // Null if anonymous
                    ipAddress: user.ip,
                },
            });
            return JSON.parse(cachedJob);
        }


        const job = await db.job.findUnique({
            where: { job_id: job_id },
            include: { categories: { include: { categorie: true } }, skills: true },
        }); // Utilise Prisma avec findUnique

        if (!job) {
            throw new NotFoundError('Cette job n\'existe pas!');
        }

        await redisClient.setEx(cacheKey, 60, JSON.stringify(job)); // Cache for 60s

        // Track a job view (middleware)
        await db.jobView.create({
            data: {
                jobId: job_id,
                userId: user?.id, // Null if anonymous
                ipAddress: user.ip,
            },
        });

        return job;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createJob = async ({ body, user }) => {
    try {
        const createdjob = await db.job.create({
            data: {
                ...body,
                authorId: user.id,
                categories: body.categorieIds?.length ? {
                    create: body.categorieIds.map((id) => ({ categorieId: id })),
                } : undefined,
                skills: body.skillIds?.length ? {
                    create: body.skillIds.map((id) => ({ skillId: id })),
                } : undefined,
            },
        });
        return createdjob;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listJobs = async (page = 0,
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
        const jobs = await db.job.findMany({
            where: {
                OR: [
                    { status: { not: null } },
                    search ? { title: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: { categories: { include: { categorie: true } }, skills: true },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.job.count({
            where: {
                OR: [
                    { status: { not: null } },
                    search ? { title: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: jobs,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listRecommendedJobs = async (page = 0,
    limit = 10,
    search = "",
    order = [], user=null) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "title" : sort.id || "title";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const jobs = await db.job.findMany({
            where: {
               categories: {
                    some: { id: { in: user.preferences.jobCategories } },
                },
            },
            include: { categories: { include: { categorie: true } }, skills: true },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.job.count({
            where: {
               categories: {
                    some: { id: { in: user.preferences.jobCategories } },
                },
            },
        });

        return {
            data: jobs,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};


export const listDeletedJobs = async (page = 0,
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
        const jobs = await db.job.findMany({
            where: {
                OR: [
                    { status: { not: null } },
                    search ? { title: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: { categories: { include: { categorie: true } }, skills: true },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.job.count({
            where: {
                OR: [
                    { status: { not: null } },
                    search ? { title: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: jobs,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Cache popular jobs (TTL: 1 hour)
export const cachePopularJobs = async () => {
    const cacheKey = 'cache:popular_jobs';
    const cachedJobs = await redisClient.get(cacheKey);

    if (cachedJobs) return JSON.parse(cachedJobs);

    const jobs = await db.job.findMany({
        where: { expiryDate: { gt: new Date() } },
        orderBy: { views: { _count: 'desc' } },
        take: 10,
        include: { employer: true },
    });

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(jobs)); // Cache for 1h
    return jobs;
};

// Mettre à jour une job
export const updateJob = async ({ body, user, job_id }) => {
    try {

        const updatedjob = await db.job.update({
            where: { job_id }, // Utiliser l'ID pour le recherche
            data: body
        });

        // 2. Handle Categories (Many-to-Many)
        if (body.categorieIds) {
            // Delete existing connections and recreate
            await db.jobCategory.deleteMany({ where: { jobId } });
            await db.jobCategory.createMany({
                data: body.categorieIds.map((categorieId) => ({
                    jobId,
                    categorieId,
                })),
            });
        }

        // 3. Handle Skills (Many-to-Many)
        if (data.skillIds) {
            await db.jobSkill.deleteMany({ where: { jobId } });
            await db.jobSkill.createMany({
                data: data.skillIds.map((skillId) => ({
                    jobId,
                    skillId,
                })),
            });
        }

         // Clear cache for all job-related keys
        const cacheKeys = await redisClient.keys('cache:/api/v1/youth/stag/job*');
        if (cacheKeys.length) await redisClient.del(cacheKeys);
        //return updatedjob;

        // 4. Return the updated job with relations
        return db.job.findUnique({
            where: { id: jobId },
            include: {
                categories: { include: { categorie: true } },
                skills: { include: { skill: true } },
            },
        });
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le job à jour");
    }
}
