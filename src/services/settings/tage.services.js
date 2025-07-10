import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    InternalServerError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";

// soft delete tokens after usage.
export const deleteTage = async ({ idtage }) => {
    const tage = await db.tage.findUnique({
        where: { idtage: idtage },
    }); // Utilise Prisma avec findUnique

    if (!tage) {
        throw new NotFoundError('Cette tage n\'existe pas!');
    }
    return db.tage.update({
        where: {
            idtage: idtage,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une tage par ID
export async function getTageById(idtage) {
    try {

        const tage = await db.tage.findUnique({
            where: { idtage: idtage },
        }); // Utilise Prisma avec findUnique

        if (!tage) {
            throw new NotFoundError('Cette tage n\'existe pas!');
        }

        return tage;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createTage = async ({ body, user }) => {
    try {
        const existingTage = await db.tage.findFirst({
            where: {
                nomtage: {
                    contains: body.nomtage
                }
            }
        });
        if (existingTage) {
            throw new DuplicateError('Ce tage existe deja!');
        }
        const createdTage = await db.tage.create({ data: body });

        if (createdTage && body.packs) {
            let packs = body.packs;
            packs.forEach(async element => {
                let createdElement = await db.packTage.create({
                    data: {
                        isActive: element.isActive,
                        packId: createdPack.idpack,
                        tageId: element.tageId
                    }
                })
                console.log(createdElement);
                
            });
        }
        return createdTage;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listTages = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomtage" : sort.id || "nomtage";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const tages = await db.tage.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomtage: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.tage.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomtage: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: tages,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedTages = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomtage" : sort.id || "nomtage";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const tages = await db.tage.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomtage: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.tage.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomtage: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: tages,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une tage
export const updateTage = async ({ body, user, idtage }) => {
    const {  codetage, nomtage, age_from, age_to, descriptiontage, published} = body;
    try {
        const updatedTage = await db.tage.update({
            where: { idtage }, // Utiliser l'ID pour le recherche
            data: {
                codetage,
                nomtage,
                age_from,
                age_to,
                descriptiontage,
                published
            }
        });

        if (!updatedTage) {
            throw new BadRequestError("Tage non trouvée");
        }
        if (body.packs) {
            let packs = body.packs;
            packs.forEach(async element => {
                let updateddElement = await db.packTage.update({where: { tageId: idtage, packId: element.packId },
                    data: {
                        isActive: element.isActive
                    }
                })
                console.log(updateddElement);
                
            });
        }

        return updatedTage
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le tage à jour");
    }
}
