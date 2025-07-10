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
export const deleteActivite = async ({ idactivite }) => {
    const activite = await db.activite.findUnique({
        where: { idactivite: idactivite },
    }); // Utilise Prisma avec findUnique

    if (!activite) {
        throw new NotFoundError('Cette activite n\'existe pas!');
    }
    return db.activite.update({
        where: {
            idactivite: idactivite,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une activite par ID
export async function getActiviteById(idactivite) {
    try {

        const activite = await db.activite.findUnique({
            where: { idactivite: idactivite },
        }); // Utilise Prisma avec findUnique

        if (!activite) {
            throw new NotFoundError('Cette activite n\'existe pas!');
        }

        return activite;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createActivite = async ({ body, user }) => {
    try {
        const existingActivite = await db.activite.findFirst({
            where: {
                libelleactivite: {
                    contains: body.libelleactivite
                }
            }
        });
        if (existingActivite) {
            throw new DuplicateError('Ce activite existe deja!');
        }
        //body.codeactivite = `ACT-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`;
        const createdActivite = await db.activite.create({ data: body });
        return createdActivite;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listActivites = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "libelleactivite" : sort.id || "libelleactivite";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const activites = await db.activite.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { libelleactivite: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.activite.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { libelleactivite: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: activites,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedActivites = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "libelleactivite" : sort.id || "libelleactivite";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const activites = await db.activite.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { libelleactivite: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.activite.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { libelleactivite: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: activites,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une activite
export const updateActivite = async ({ body, user, idactivite }) => {
    const { codeactivite, libelleactivite, dateactivite, descriptionactivite, published} = body;
    try {
        const updatedActivite = await db.activite.update({
            where: { idactivite }, // Utiliser l'ID pour le recherche
            data: {
                codeactivite,
                libelleactivite,
                dateactivite,
                descriptionactivite,
                published
            }
        });

        if (!updatedActivite) {
            throw new BadRequestError("Activite non trouvée");
        }

        return updatedActivite
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le activite à jour");
    }
}
