import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    InternalServerError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";

// soft delete tokens after usage.
export const deleteCapitaux = async ({ idcapitaux }) => {
    const capitaux = await db.capitaux.findUnique({
        where: { idcapitaux: idcapitaux },
    }); // Utilise Prisma avec findUnique

    if (!capitaux) {
        throw new NotFoundError('Cette capitaux n\'existe pas!');
    }
    return db.capitaux.update({
        where: {
            idcapitaux: idcapitaux,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une capitaux par ID
export async function getCapitauxById(idcapitaux) {
    try {

        const capitaux = await db.capitaux.findUnique({
            where: { idcapitaux: idcapitaux },
        }); // Utilise Prisma avec findUnique

        if (!capitaux) {
            throw new NotFoundError('Cette capitaux n\'existe pas!');
        }

        return capitaux;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createCapitaux = async ({ body, user }) => {
    try {
        const existingCapitaux = await db.capitaux.findFirst({
            where: {
                nomcapitaux: {
                    contains: body.nomcapitaux
                }
            }
        });
        if (existingCapitaux) {
            throw new DuplicateError('Ce capitaux existe deja!');
        }
        const createdCapitaux = await db.capitaux.create({ data: body });
        return createdCapitaux;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listCapitauxs = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomcapitaux" : sort.id || "nomcapitaux";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const capitauxs = await db.capitaux.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomcapitaux: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.capitaux.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomcapitaux: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: capitauxs,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedCapitauxs = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomcapitaux" : sort.id || "nomcapitaux";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const capitauxs = await db.capitaux.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomcapitaux: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.capitaux.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomcapitaux: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: capitauxs,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une capitaux
export const updateCapitaux = async ({ body, user, idcapitaux }) => {
    const {  codecapitaux, nomcapitaux, valeurcapitaux, descriptioncapitaux, published} = body;
    try {
        const updatedCapitaux = await db.capitaux.update({
            where: { idcapitaux }, // Utiliser l'ID pour le recherche
            data: {
                codecapitaux,
                nomcapitaux,
                valeurcapitaux,
                descriptioncapitaux,
                published
            }
        });

        if (!updatedCapitaux) {
            throw new BadRequestError("Capitaux non trouvée");
        }

        return updatedCapitaux
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le capitaux à jour");
    }
}
