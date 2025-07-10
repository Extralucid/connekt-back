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
export const deleteAgence = async ({ idagence }) => {
    const agence = await db.agence.findUnique({
        where: { idagence: idagence },
    }); // Utilise Prisma avec findUnique

    if (!agence) {
        throw new NotFoundError('Cette agence n\'existe pas!');
    }
    return db.agence.update({
        where: {
            idagence: idagence,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une agence par ID
export async function getAgenceById(idagence) {
    try {

        const agence = await db.agence.findUnique({
            where: { idagence: idagence },
        }); // Utilise Prisma avec findUnique

        if (!agence) {
            throw new NotFoundError('Cette agence n\'existe pas!');
        }

        return agence;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createAgence = async ({ body, user }) => {
    try {
        const existingAgence = await db.agence.findFirst({
            where: {
                nomagence: {
                    contains: body.nomagence
                }
            }
        });
        if (existingAgence) {
            throw new DuplicateError('Ce agence existe deja!');
        }
        //body.codeagence = `ACT-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`;
        const createdAgence = await db.agence.create({ data: body });
        return createdAgence;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listAgences = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomagence" : sort.id || "nomagence";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const agences = await db.agence.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomagence: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.agence.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomagence: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: agences,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedAgences = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomagence" : sort.id || "nomagence";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const agences = await db.agence.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomagence: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.agence.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomagence: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: agences,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une agence
export const updateAgence = async ({ body, user, idagence }) => {
    const { nomagence,
        codeagence,
        responsableagence,
        emailagence,
        siteagence,
        phoneagence,
        faxagence,
        longitudeagence,
        latitudeagence,
        descriptionagence,
        adresseagence, published } = body;
    try {
        const updatedAgence = await db.agence.update({
            where: { idagence }, // Utiliser l'ID pour le recherche
            data: {
                nomagence,
                codeagence,
                responsableagence,
                emailagence,
                siteagence,
                phoneagence,
                faxagence,
                longitudeagence,
                latitudeagence,
                descriptionagence,
                adresseagence,
                published
            }
        });

        if (!updatedAgence) {
            throw new BadRequestError("Agence non trouvée");
        }

        return updatedAgence
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le agence à jour");
    }
}
