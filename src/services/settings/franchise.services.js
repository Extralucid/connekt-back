import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    InternalServerError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";

// soft delete tokens after usage.
export const deleteFranchise = async ({ idfranchise }) => {
    const franchise = await db.franchise.findUnique({
        where: { idfranchise: idfranchise },
    }); // Utilise Prisma avec findUnique

    if (!franchise) {
        throw new NotFoundError('Cette franchise n\'existe pas!');
    }
    return db.franchise.update({
        where: {
            idfranchise: idfranchise,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une franchise par ID
export async function getFranchiseById(idfranchise) {
    try {

        const franchise = await db.franchise.findUnique({
            where: { idfranchise: idfranchise },
        }); // Utilise Prisma avec findUnique

        if (!franchise) {
            throw new NotFoundError('Cette franchise n\'existe pas!');
        }

        return franchise;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createFranchise = async ({ body, user }) => {
    try {
        const existingFranchise = await db.franchise.findFirst({
            where: {
                nomfranchise: {
                    contains: body.nomfranchise
                }
            }
        });
        if (existingFranchise) {
            throw new DuplicateError('Ce franchise existe deja!');
        }
        const createdFranchise = await db.franchise.create({ data: body });
        return createdFranchise;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listFranchises = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomfranchise" : sort.id || "nomfranchise";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const franchises = await db.franchise.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomfranchise: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.franchise.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomfranchise: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: franchises,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedFranchises = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomfranchise" : sort.id || "nomfranchise";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const franchises = await db.franchise.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomfranchise: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.franchise.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomfranchise: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: franchises,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une franchise
export const updateFranchise = async ({ body, user, idfranchise }) => {
    const {  codefranchise, nomfranchise, valeurafranchise, descriptionfranchise, published} = body;
    try {
        const updatedFranchise = await db.franchise.update({
            where: { idfranchise }, // Utiliser l'ID pour le recherche
            data: {
                codefranchise,
                nomfranchise,
                valeurafranchise,
                descriptionfranchise,
                published
            }
        });

        if (!updatedFranchise) {
            throw new BadRequestError("Franchise non trouvée");
        }

        return updatedFranchise
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le franchise à jour");
    }
}
