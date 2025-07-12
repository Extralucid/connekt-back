import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    InternalServerError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";
import { codeGenerator } from '../../utils/codeGenerator.js';

// soft delete tokens after usage.
export const deleteTopic = async ({ topic_id }) => {
    const topic = await db.topic.findUnique({
        where: { topic_id: topic_id },
    }); // Utilise Prisma avec findUnique

    if (!topic) {
        throw new NotFoundError('Cette topic n\'existe pas!');
    }
    return db.topic.update({
        where: {
            topic_id: topic_id,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir une topic par ID
export async function getTopicById({topic_id}) {
    try {

        const topic = await db.topic.findUnique({
            where: { topic_id: topic_id },
        }); // Utilise Prisma avec findUnique

        if (!topic) {
            throw new NotFoundError('Cette topic n\'existe pas!');
        }

        return topic;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createTopic = async ({ body, user }) => {
    try {
        const createdtopic = await db.topic.create({ data: body });
        return createdtopic;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listTopics = async (page = 0,
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
        const topics = await db.topic.findMany({
            where: {
                OR: [
                     { status: {not: null} },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.topic.count({
            where: {
                OR: [
                     { status: {not: null} },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: topics,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedTopics = async (page = 0,
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
        const topics = await db.topic.findMany({
            where: {
                OR: [
                    { status: {not: null} },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.topic.count({
            where: {
                OR: [
                    { status: {not: null} },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: topics,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une topic
export const updateTopic = async ({ body, user, topic_id }) => {
    try {

        const updatedtopic = await db.topic.update({
            where: { topic_id }, // Utiliser l'ID pour le recherche
            data: body
        });
        if (!updatedtopic) {
            throw new BadRequestError("topic non trouvée");
        }
        return updatedtopic;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le topic à jour");
    }
}
