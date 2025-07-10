import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    InternalServerError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";

// soft delete tokens after usage.
export const deleteModele = async ({ idmodele }) => {
    const modele = await db.modele.findUnique({
        where: { idmodele: idmodele },
    }); // Utilise Prisma avec findUnique

    if (!modele) {
        throw new NotFoundError('Cette modele n\'existe pas!');
    }
    return db.modele.update({
        where: {
            idmodele: idmodele,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir les parametres de creations d'marques
export async function createModeleData() {
    try {

        return {
            marques: await db.marque.findMany({ where: { isDeleted: false } })
        };
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}

// Obtenir les parametres de modification d'modele
export async function updateModeleData(idmodele) {
    try {
        const modele = await db.modele.findUnique({
            where: { idmodele: idmodele }, include: {
                Marque: true
            }
        }); // Utilise Prisma avec findUnique

        if (!modele) {
            throw new NotFoundError('cet modele n\'existe pas!');
        }

        return {
            modele: modele,
            marques: await db.marque.findMany({ where: { isDeleted: false } })
        };
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


// Obtenir une modele par ID
export async function getModeleById(idmodele) {
    try {

        const modele = await db.modele.findUnique({
            where: { idmodele: idmodele },
            include: {
                Marque: true
            }
        }); // Utilise Prisma avec findUnique

        if (!modele) {
            throw new NotFoundError('Cette modele n\'existe pas!');
        }

        return modele;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createModele = async ({ body, user }) => {
    try {
        const existingModele = await db.modele.findFirst({
            where: {
                nommodele: {
                    contains: body.nommodele
                }
            }
        });
        if (existingModele) {
            throw new DuplicateError('Ce modele existe deja!');
        }
        const createdModele = await db.modele.create({ data: body });
        return createdModele;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listModeles = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nommodele" : sort.id || "nommodele";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const modeles = await db.modele.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nommodele: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: {
                Marque: true
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.modele.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nommodele: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: modeles,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedModeles = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nommodele" : sort.id || "nommodele";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const modeles = await db.modele.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nommodele: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: {
                Marque: true
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.modele.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nommodele: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: modeles,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une modele
export const updateModele = async ({ body, user, idmodele }) => {
    const {  codemodele, nommodele, descriptionmodele, published, marqueId} = body;
    try {
        const updatedModele = await db.modele.update({
            where: { idmodele }, // Utiliser l'ID pour le recherche
            data: {
                codemodele,
                nommodele,
                descriptionmodele,
                published,
                marqueId
            }
        });

        if (!updatedModele) {
            throw new BadRequestError("Modele non trouvée");
        }

        return updatedModele
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le modele à jour");
    }
}
