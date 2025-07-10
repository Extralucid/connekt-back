import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    InternalServerError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";

// soft delete tokens after usage.
export const deleteGarantie = async ({ idgarantie }) => {
    const garantie = await db.garantie.findUnique({
        where: { idgarantie: idgarantie },
    }); // Utilise Prisma avec findUnique

    if (!garantie) {
        throw new NotFoundError('Cette garantie n\'existe pas!');
    }
    return db.garantie.update({
        where: {
            idgarantie: idgarantie,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une garantie par ID
export async function getGarantieById(idgarantie) {
    try {

        const garantie = await db.garantie.findUnique({
            where: { idgarantie: idgarantie },
        }); // Utilise Prisma avec findUnique

        if (!garantie) {
            throw new NotFoundError('Cette garantie n\'existe pas!');
        }

        return garantie;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createGarantie = async ({ body, user }) => {
    try {
        const existingGarantie = await db.garantie.findFirst({
            where: {
                nomgarantie: {
                    contains: body.nomgarantie
                }
            }
        });
        if (existingGarantie) {
            throw new DuplicateError('Ce garantie existe deja!');
        }
        const createdGarantie = await db.garantie.create({ data: body });
        return createdGarantie;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listGaranties = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomgarantie" : sort.id || "nomgarantie";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const garanties = await db.garantie.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomgarantie: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.garantie.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomgarantie: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: garanties,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedGaranties = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomgarantie" : sort.id || "nomgarantie";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const garanties = await db.garantie.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomgarantie: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.garantie.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomgarantie: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: garanties,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une garantie
export const updateGarantie = async ({ body, user, idgarantie }) => {
    const {  codegarantie, nomgarantie, photogarantie, descriptiongarantie, published} = body;
    try {
        const updatedGarantie = await db.garantie.update({
            where: { idgarantie }, // Utiliser l'ID pour le recherche
            data: {
                codegarantie,
                nomgarantie,
                photogarantie,
                descriptiongarantie,
                published
            }
        });

        if (!updatedGarantie) {
            throw new BadRequestError("Garantie non trouvée");
        }

        return updatedGarantie
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le garantie à jour");
    }
}
