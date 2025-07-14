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
export const deleteSkill = async ({ skill_id }) => {
    const skill = await db.skill.findUnique({
        where: { skill_id: skill_id },
    }); // Utilise Prisma avec findUnique

    if (!skill) {
        throw new NotFoundError('Cette skill n\'existe pas!');
    }
    return db.skill.update({
        where: {
            skill_id: skill_id,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir une skill par ID
export async function getSkillById({skill_id}) {
    try {

        const cacheKey = `cache:skill:${skill_id}`;
        const cachedSkill = await redisClient.get(cacheKey);

        if (cachedSkill) return JSON.parse(cachedSkill);

        const skill = await db.skill.findUnique({
            where: { skill_id: skill_id },
        }); // Utilise Prisma avec findUnique

        if (!skill) {
            throw new NotFoundError('Cette skill n\'existe pas!');
        }

        await redisClient.setEx(cacheKey, 60, JSON.stringify(skill)); // Cache for 60s
        return skill;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createSkill = async ({ body, user }) => {
    try {
        const createdskill = await db.skill.create({ data: body });
        return createdskill;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listSkills = async (page = 0,
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
        const skills = await db.skill.findMany({
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

        const countTotal = await db.skill.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: skills,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedSkills = async (page = 0,
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
        const skills = await db.skill.findMany({
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

        const countTotal = await db.skill.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: skills,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une skill
export const updateSkill = async ({ body, user, skill_id }) => {
    try {

        const updatedskill = await db.skill.update({
            where: { skill_id }, // Utiliser l'ID pour le recherche
            data: body
        });
        if (!updatedskill) {
            throw new BadRequestError("skill non trouvée");
        }

        // Clear cache for all post-related keys
        const cacheKeys = await redisClient.keys('cache:/api/v1/youth/stag/skill*');
        if (cacheKeys.length) await redisClient.del(cacheKeys);
        return updatedskill;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le skill à jour");
    }
}
