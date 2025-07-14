import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    InternalServerError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";

// soft delete tokens after usage.
export const deleteTdocument = async ({ idtdoc }) => {
    const tdocument = await db.tdocument.findUnique({
        where: { idtdoc: idtdoc },
    }); // Utilise Prisma avec findUnique

    if (!tdocument) {
        throw new NotFoundError('Cette tdocument n\'existe pas!');
    }
    return db.tdocument.update({
        where: {
            idtdoc: idtdoc,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une tdocument par ID
export async function getTdocumentById(idtdoc) {
    try {

        const tdocument = await db.tdocument.findUnique({
            where: { idtdoc: idtdoc },
        }); // Utilise Prisma avec findUnique

        if (!tdocument) {
            throw new NotFoundError('Cette tdocument n\'existe pas!');
        }

        return tdocument;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createTdocument = async ({ body, user }) => {
    try {
        const existingTdocument = await db.tdocument.findFirst({
            where: {
                nomtdoc: {
                    contains: body.nomtdoc
                }
            }
        });
        if (existingTdocument) {
            throw new DuplicateError('Ce tdocument existe deja!');
        }
        const createdTdocument = await db.tdocument.create({ data: body });
        return createdTdocument;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listTdocuments = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomtdoc" : sort.id || "nomtdoc";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const tdocuments = await db.tdocument.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomtdoc: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.tdocument.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomtdoc: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: tdocuments,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedTdocuments = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomtdoc" : sort.id || "nomtdoc";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const tdocuments = await db.tdocument.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomtdoc: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.tdocument.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomtdoc: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: tdocuments,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une tdocument
export const updateTdocument = async ({ body, user, idtdoc }) => {
    const {  codetdoc, nomtdoc, descriptiontdoc, published} = body;
    try {
        const updatedTdocument = await db.tdocument.update({
            where: { idtdoc }, // Utiliser l'ID pour le recherche
            data: {
                codetdoc,
                nomtdoc,
                descriptiontdoc,
                published
            }
        });

        if (!updatedTdocument) {
            throw new BadRequestError("Tdocument non trouvée");
        }

        return updatedTdocument
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le tdocument à jour");
    }
}
