import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    InternalServerError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";

// soft delete tokens after usage.
export const deleteEnergie = async ({ idenergie }) => {
    const energie = await db.energie.findUnique({
        where: { idenergie: idenergie },
    }); // Utilise Prisma avec findUnique

    if (!energie) {
        throw new NotFoundError('Cette energie n\'existe pas!');
    }
    return db.energie.update({
        where: {
            idenergie: idenergie,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une energie par ID
export async function getEnergieById(idenergie) {
    try {

        const energie = await db.energie.findUnique({
            where: { idenergie: idenergie },
        }); // Utilise Prisma avec findUnique

        if (!energie) {
            throw new NotFoundError('Cette energie n\'existe pas!');
        }

        return energie;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createEnergie = async ({ body, user }) => {
    try {
        const existingEnergie = await db.energie.findFirst({
            where: {
                nomenergie: {
                    contains: body.nomenergie
                }
            }
        });
        if (existingEnergie) {
            throw new DuplicateError('Ce energie existe deja!');
        }
        const createdEnergie = await db.energie.create({ data: body });
        return createdEnergie;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listEnergies = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomenergie" : sort.id || "nomenergie";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const energies = await db.energie.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomenergie: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.energie.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomenergie: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: energies,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedEnergies = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomenergie" : sort.id || "nomenergie";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const energies = await db.energie.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomenergie: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.energie.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomenergie: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: energies,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une energie
export const updateEnergie = async ({ body, user, idenergie }) => {
    const {  codeenergie, nomenergie, descriptionenergie, published} = body;
    try {
        const updatedEnergie = await db.energie.update({
            where: { idenergie }, // Utiliser l'ID pour le recherche
            data: {
                codeenergie,
                nomenergie,
                descriptionenergie,
                published
            }
        });

        if (!updatedEnergie) {
            throw new BadRequestError("Energie non trouvée");
        }

        return updatedEnergie
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le energie à jour");
    }
}
