import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    InternalServerError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";

// soft delete tokens after usage.
export const deleteStatut = async ({ idstatut }) => {
    const statut = await db.statut.findUnique({
        where: { idstatut: idstatut },
    }); // Utilise Prisma avec findUnique

    if (!statut) {
        throw new NotFoundError('Cette statut n\'existe pas!');
    }
    return db.statut.update({
        where: {
            idstatut: idstatut,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une statut par ID
export async function getStatutById(idstatut) {
    try {

        const statut = await db.statut.findUnique({
            where: { idstatut: idstatut },
        }); // Utilise Prisma avec findUnique

        if (!statut) {
            throw new NotFoundError('Cette statut n\'existe pas!');
        }

        return statut;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createStatut = async ({ body, user }) => {
    try {
        const existingStatut = await db.statut.findFirst({
            where: {
                nomstatut: {
                    contains: body.nomstatut
                }
            }
        });
        if (existingStatut) {
            throw new DuplicateError('Ce statut existe deja!');
        }
        const createdStatut = await db.statut.create({ data: body });
        return createdStatut;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listStatuts = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomstatut" : sort.id || "nomstatut";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const statuts = await db.statut.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomstatut: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.statut.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomstatut: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: statuts,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedStatuts = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomstatut" : sort.id || "nomstatut";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const statuts = await db.statut.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomstatut: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.statut.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomstatut: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: statuts,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une statut
export const updateStatut = async ({ body, user, idstatut }) => {
    const { rcode, nomstatut, descriptionstatut, published} = body;
    try {
        const updatedStatut = await db.statut.update({
            where: { idstatut }, // Utiliser l'ID pour le recherche
            data: {
                rcode,
                nomstatut,
                descriptionstatut,
                published
            }
        });

        if (!updatedStatut) {
            throw new BadRequestError("Statut non trouvée");
        }

        return updatedStatut
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le statut à jour");
    }
}
