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
export const deleteTag = async ({ tag_id }) => {
    const tag = await db.tag.findUnique({
        where: { tag_id: tag_id },
    }); // Utilise Prisma avec findUnique

    if (!tag) {
        throw new NotFoundError('Cette tag n\'existe pas!');
    }
    return db.tag.update({
        where: {
            tag_id: tag_id,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir une tag par ID
export async function getTagById({tag_id}) {
    try {

        const tag = await db.tag.findUnique({
            where: { tag_id: tag_id },
        }); // Utilise Prisma avec findUnique

        if (!tag) {
            throw new NotFoundError('Cette tag n\'existe pas!');
        }

        return tag;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createTag = async ({ body, user }) => {
    try {
        const createdtag = await db.tag.create({ data: body });
        return createdtag;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listTags = async (page = 0,
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
        const tags = await db.tag.findMany({
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

        const countTotal = await db.tag.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: tags,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedTags = async (page = 0,
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
        const tags = await db.tag.findMany({
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

        const countTotal = await db.tag.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { name: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: tags,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une tag
export const updateTag = async ({ body, user, file, tag_id }) => {
    try {

        const updatedtag = await db.tag.update({
            where: { tag_id }, // Utiliser l'ID pour le recherche
            data: body
        });
        if (!updatedtag) {
            throw new BadRequestError("tag non trouvée");
        }
        return updatedtag;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le tag à jour");
    }
}
