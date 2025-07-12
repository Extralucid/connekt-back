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
export const deletecategory = async ({ category_id }) => {
    const category = await db.category.findUnique({
        where: { category_id: category_id },
    }); // Utilise Prisma avec findUnique

    if (!category) {
        throw new NotFoundError('Cette category n\'existe pas!');
    }
    return db.category.update({
        where: {
            category_id: category_id,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir les parametres de creations d'category
export async function createcategoryData() {
    try {

        return {
            tcategorys: await db.tcategory.findMany({ where: { isDeleted: false } })
        };
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}

// Obtenir les parametres de modification d'cotation
export async function updatecategoryData(category_id) {
    try {
        const category = await db.category.findUnique({
            where: { category_id: category_id }, include: {
                Tcategory: true,
            }
        }); // Utilise Prisma avec findUnique

        if (!category) {
            throw new NotFoundError('cet category n\'existe pas!');
        }

        return {
            category: category,
            tcategorys: await db.tcategory.findMany({ where: { isDeleted: false } })
        };
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}

// Obtenir une category par ID
export async function getcategoryById(category_id) {
    try {

        const category = await db.category.findUnique({
            where: { category_id: category_id },
            include: {
                Tcategory: true,
            }
        }); // Utilise Prisma avec findUnique

        if (!category) {
            throw new NotFoundError('Cette category n\'existe pas!');
        }

        return category;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createcategory = async ({ body, user, file }) => {
    try {

        body.codecategory = `DCM-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`;
        if (!file) {
            throw new BadRequestError("category non trouvée");
        }
        const createdcategory = await db.category.create({ data: body });
        return createdcategory;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listcategorys = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomcategory" : sort.id || "nomcategory";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const categorys = await db.category.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomcategory: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: {
                Tcategory: true,
                Assure: true
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.category.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomcategory: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: categorys,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedcategorys = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomcategory" : sort.id || "nomcategory";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const categorys = await db.category.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomcategory: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: {
                Tcategory: true,
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.category.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomcategory: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: categorys,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une category
export const updatecategory = async ({ body, user, file, category_id }) => {
    try {

        const updatedcategory = await db.category.update({
            where: { category_id }, // Utiliser l'ID pour le recherche
            data: {
                descriptioncategory: descriptioncategory,
                tdocId: tdocId,
                published: published
            }
        });
        if (!updatedcategory) {
            throw new BadRequestError("category non trouvée");
        }
        return updatedcategory;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le category à jour");
    }
}
