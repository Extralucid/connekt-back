import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    InternalServerError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";


// Obtenir une parametre par ID
export async function getParametreById(idparametre) {
    try {

        const parametre = await db.parametre.findUnique({
            where: { idparametre: idparametre },
        }); // Utilise Prisma avec findUnique

        if (!parametre) {
            throw new NotFoundError('Cette parametre n\'existe pas!');
        }

        return parametre;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createParametre = async ({ body, user }) => {
    try {
        const existingParametre = await db.parametre.findFirst({
            where: {
                nomcompagnie: {
                    contains: body.nomcompagnie
                }
            }
        });
        if (existingParametre) {
            throw new BadRequestError('Ce parametre existe deja!');
        }
        const createdParametre = await db.parametre.create({ data: body });
        return createdParametre;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listParametres = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomcompagnie" : sort.id || "nomcompagnie";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const parametres = await db.parametre.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomcompagnie: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.parametre.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomcompagnie: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: parametres,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};


// Mettre à jour une parametre
export const updateParametre = async ({ body, user, idparametre }) => {
    try {
        const updatedParametre = await db.parametre.update({
            where: { idparametre }, // Utiliser l'ID pour la recherche
            data: body
        });

        if (!updatedParametre) {
            throw new BadRequestError("Parametre non trouvée");
        }

        return updatedParametre
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le parametre à jour");
    }
}
