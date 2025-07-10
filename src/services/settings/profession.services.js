import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    InternalServerError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";
import { codeGenerator } from '../../utils/codeGenerator.js';

// soft delete tokens after usage.
export const deleteProfession = async ({ idprofession }) => {
    const profession = await db.profession.findUnique({
        where: { idprofession: idprofession },
    }); // Utilise Prisma avec findUnique

    if (!profession) {
        throw new NotFoundError('Cette profession n\'existe pas!');
    }
    return db.profession.update({
        where: {
            idprofession: idprofession,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une profession par ID
export async function getProfessionById(idprofession) {
    try {

        const profession = await db.profession.findUnique({
            where: { idprofession: idprofession },
        }); // Utilise Prisma avec findUnique

        if (!profession) {
            throw new NotFoundError('Cette profession n\'existe pas!');
        }

        return profession;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createProfession = async ({ body, user }) => {
    try {
        const existingProfession = await db.profession.findFirst({
            where: {
                libelleprofession: {
                    contains: body.libelleprofession
                }
            }
        });
        if (existingProfession) {
            throw new DuplicateError('Ce profession existe deja!');
        }
        //body.codeprofession = `PFN-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`;
        const createdProfession = await db.profession.create({ data: body });
        return createdProfession;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listProfessions = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "libelleprofession" : sort.id || "libelleprofession";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const professions = await db.profession.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { libelleprofession: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.profession.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { libelleprofession: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: professions,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedProfessions = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "libelleprofession" : sort.id || "libelleprofession";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const professions = await db.profession.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { libelleprofession: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.profession.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { libelleprofession: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: professions,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une profession
export const updateProfession = async ({ body, user, idprofession }) => {
    const {  codeprofession, libelleprofession, descriptionsprofession, published} = body;
    try {
        const updatedProfession = await db.profession.update({
            where: { idprofession }, // Utiliser l'ID pour le recherche
            data: {
                codeprofession,
                libelleprofession,
                descriptionsprofession,
                published
            }
        });

        if (!updatedProfession) {
            throw new BadRequestError("Profession non trouvée");
        }

        return updatedProfession
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le profession à jour");
    }
}
