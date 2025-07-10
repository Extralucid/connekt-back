import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    InternalServerError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";

// soft delete tokens after usage.
export const deleteTpuissance = async ({ idpuissance }) => {
    const tpuissance = await db.tpuissance.findUnique({
        where: { idpuissance: idpuissance },
    }); // Utilise Prisma avec findUnique

    if (!tpuissance) {
        throw new NotFoundError('Cette tpuissance n\'existe pas!');
    }
    return db.tpuissance.update({
        where: {
            idpuissance: idpuissance,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une tpuissance par ID
export async function getTpuissanceById(idpuissance) {
    try {

        const tpuissance = await db.tpuissance.findUnique({
            where: { idpuissance: idpuissance },
        }); // Utilise Prisma avec findUnique

        if (!tpuissance) {
            throw new NotFoundError('Cette tpuissance n\'existe pas!');
        }

        return tpuissance;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createTpuissance = async ({ body, user }) => {
    try {
        const existingTpuissance = await db.tpuissance.findFirst({
            where: {
                codepuissance: {
                    contains: body.codepuissance
                }
            }
        });
        if (existingTpuissance) {
            throw new DuplicateError('Ce tpuissance existe deja!');
        }
        const createdTpuissance = await db.tpuissance.create({ data: body });

        return createdTpuissance;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listTpuissances = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nompuissance" : sort.id || "nompuissance";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const tpuissances = await db.tpuissance.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nompuissance: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.tpuissance.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nompuissance: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: tpuissances,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedTpuissances = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nompuissance" : sort.id || "nompuissance";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const tpuissances = await db.tpuissance.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nompuissance: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.tpuissance.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nompuissance: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: tpuissances,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une tpuissance
export const updateTpuissance = async ({ body, user, idpuissance }) => {
    const {  codepuissance, nompuissance, age_from, age_to, descriptiontpuissance, published} = body;
    try {
        const updatedTpuissance = await db.tpuissance.update({
            where: { idpuissance }, // Utiliser l'ID pour le recherche
            data: {
                codepuissance,
                nompuissance,
                puissance_from,
                puissance_to,
                descriptiontpuissance,
                published
            }
        });

        if (!updatedTpuissance) {
            throw new BadRequestError("Tpuissance non trouvée");
        }

        return updatedTpuissance
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le tpuissance à jour");
    }
}
