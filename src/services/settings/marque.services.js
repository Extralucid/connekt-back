import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    InternalServerError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";

// soft delete tokens after usage.
export const deleteMarque = async ({ idmarque }) => {
    const marque = await db.marque.findUnique({
        where: { idmarque: idmarque },
    }); // Utilise Prisma avec findUnique

    if (!marque) {
        throw new NotFoundError('Cette marque n\'existe pas!');
    }
    return db.marque.update({
        where: {
            idmarque: idmarque,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une marque par ID
export async function getMarqueById(idmarque) {
    try {

        const marque = await db.marque.findUnique({
            where: { idmarque: idmarque },
        }); // Utilise Prisma avec findUnique

        if (!marque) {
            throw new NotFoundError('Cette marque n\'existe pas!');
        }

        return marque;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createMarque = async ({ body, user }) => {
    try {
        const existingMarque = await db.marque.findFirst({
            where: {
                nommarque: {
                    contains: body.nommarque
                }
            }
        });
        if (existingMarque) {
            throw new DuplicateError('Ce marque existe deja!');
        }
        const createdMarque = await db.marque.create({ data: body });
        return createdMarque;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listMarques = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nommarque" : sort.id || "nommarque";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const marques = await db.marque.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nommarque: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.marque.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nommarque: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: marques,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedMarques = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nommarque" : sort.id || "nommarque";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const marques = await db.marque.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nommarque: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.marque.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nommarque: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: marques,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une marque
export const updateMarque = async ({ body, user, idmarque }) => {
    const {  codemarque, nommarque, descriptionmarque, published} = body;
    try {
        const updatedMarque = await db.marque.update({
            where: { idmarque }, // Utiliser l'ID pour le recherche
            data: {
                codemarque,
                nommarque,
                descriptionmarque,
                published
            }
        });

        if (!updatedMarque) {
            throw new BadRequestError("Marque non trouvée");
        }

        return updatedMarque
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le marque à jour");
    }
}
