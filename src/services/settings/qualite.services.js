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
export const deleteQualite = async ({ idqualite }) => {
    const qualite = await db.qualite.findUnique({
        where: { idqualite: idqualite },
    }); // Utilise Prisma avec findUnique

    if (!qualite) {
        throw new NotFoundError('Cette qualite n\'existe pas!');
    }
    return db.qualite.update({
        where: {
            idqualite: idqualite,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une qualite par ID
export async function getQualiteById(idqualite) {
    try {

        const qualite = await db.qualite.findUnique({
            where: { idqualite: idqualite },
        }); // Utilise Prisma avec findUnique

        if (!qualite) {
            throw new NotFoundError('Cette qualite n\'existe pas!');
        }

        return qualite;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createQualite = async ({ body, user }) => {
    try {
        const existingQualite = await db.qualite.findFirst({
            where: {
                libellequalite: {
                    contains: body.libellequalite
                }
            }
        });
        if (existingQualite) {
            throw new DuplicateError('Ce qualite existe deja!');
        }
        //body.codequalite = `QLE-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`;
        const createdQualite = await db.qualite.create({ data: body });
        return createdQualite;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listQualites = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "libellequalite" : sort.id || "libellequalite";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const qualites = await db.qualite.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { libellequalite: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.qualite.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { libellequalite: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: qualites,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedQualites = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "libellequalite" : sort.id || "libellequalite";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const qualites = await db.qualite.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { libellequalite: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.qualite.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { libellequalite: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: qualites,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une qualite
export const updateQualite = async ({ body, user, idqualite }) => {
    const { codequalite, libellequalite, descriptionsqualite, published} = body;
    try {
        const updatedQualite = await db.qualite.update({
            where: { idqualite }, // Utiliser l'ID pour le recherche
            data: {
                codequalite,
                libellequalite,
                descriptionsqualite,
                published
            }
        });

        if (!updatedQualite) {
            throw new BadRequestError("Qualite non trouvée");
        }

        return updatedQualite
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le qualite à jour");
    }
}
