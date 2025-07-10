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
export const deleteAssure = async ({ idassure }) => {
    const assure = await db.assure.findUnique({
        where: { idassure: idassure },
    }); // Utilise Prisma avec findUnique

    if (!assure) {
        throw new NotFoundError('Cette assure n\'existe pas!');
    }
    return db.assure.update({
        where: {
            idassure: idassure,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une assure par ID
export async function getAssureById(idassure) {
    try {

        const assure = await db.assure.findUnique({
            where: { idassure: idassure },
        }); // Utilise Prisma avec findUnique

        if (!assure) {
            throw new NotFoundError('Cette assure n\'existe pas!');
        }

        return assure;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createAssure = async ({ body, user }) => {
    try {
        const existingAssure = await db.assure.findFirst({
            where: {
                phoneassure: {
                    contains: body.phoneassure
                }
            }
        });
        if (existingAssure) {
            throw new DuplicateError('Ce assure existe deja!');
        }
        body.codeassure = `ASR-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`;
        const createdAssure = await db.assure.create({ data: body });
        return createdAssure;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listAssures = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomassure" : sort.id || "nomassure";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const assures = await db.assure.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomassure: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.assure.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomassure: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: assures,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedAssures = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomassure" : sort.id || "nomassure";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const assures = await db.assure.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomassure: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.assure.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomassure: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: assures,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une assure
export const updateAssure = async ({ body, user, idassure }) => {
    const { nomassure,
        prenomassure,
        emailassure,
        siteassure,
        phoneassure,
        faxassure,
        gsmassure,
        descriptionassure,
        adresseassure, qualiteId, professionId, published } = body;
    try {
        const updatedAssure = await db.assure.update({
            where: { idassure }, // Utiliser l'ID pour le recherche
            data: {
                nomassure,
                prenomassure,
                emailassure,
                siteassure,
                phoneassure,
                faxassure,
                gsmassure,
                descriptionassure,
                adresseassure, 
                qualiteId, 
                professionId, 
                published
            }
        });

        if (!updatedAssure) {
            throw new BadRequestError("Assure non trouvée");
        }

        return updatedAssure
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le assure à jour");
    }
}
