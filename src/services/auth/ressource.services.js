import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    InternalServerError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";

// soft delete tokens after usage.
export const deleteRessource = async ({ idressource }) => {
    const ressource = await db.ressource.findFirst({
        where: { idressource: idressource },
    }); // Utilise Prisma avec findUnique

    if (!ressource) {
        throw new NotFoundError('Cette ressource n\'existe pas!');
    }
    return db.ressource.update({
        where: {
            idressource: idressource,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une ressource par ID
export async function getRessourceById(idressource) {
    try {

        const ressource = await db.ressource.findFirst({
            where: { idressource: idressource },
        }); // Utilise Prisma avec findUnique

        if (!ressource) {
            throw new NotFoundError('Cette ressource n\'existe pas!');
        }

        return ressource;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createRessource = async ({ body }) => {
    try {
        const existingRessource = await db.ressource.findFirst({
            where: {
                nomressource: body.nomressource
            }
        });
        if (existingRessource) {
            throw new BadRequestError('Cette ressource existe deja!');
        }
        const createdRessource = await db.ressource.create({ data: body });
        return createdRessource;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listRessources = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
        console.log(search);
        
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomressource" : sort.id || "nomressource";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const ressources = await db.ressource.findMany({
            where: {
                AND: [
                    { isDeleted: false },
                    search ? { nomressource: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.ressource.count({
            where: {
                AND: [
                    { isDeleted: false },
                    search ? { nomressource: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: ressources,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedRessources = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomressource" : sort.id || "nomressource";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const ressources = await db.ressource.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomressource: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.ressource.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomressource: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: ressources,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une ressource
export const updateRessource = async ({ body, idressource }) => {
    const { rcode, nomressource, descriptionressource} = body;
    try {
        const updatedRessource = await db.ressource.update({
            where: { idressource }, // Utiliser l'ID pour la recherche
            data: {
                rcode,
                nomressource,
                descriptionressource,
                published
            }
        });

        if (!updatedRessource) {
            throw new BadRequestError("Ressource non trouvée");
        }

        return updatedRessource
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre la ressource à jour");
    }
}
