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
export const deletePrime = async ({ idprime }) => {
    const prime = await db.prime.findUnique({
        where: { idprime: idprime },
    }); // Utilise Prisma avec findUnique

    if (!prime) {
        throw new NotFoundError('Cette prime n\'existe pas!');
    }
    return db.prime.update({
        where: {
            idprime: idprime,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une prime par ID
export async function getPrimeById(idprime) {
    try {

        const prime = await db.prime.findUnique({
            where: { idprime: idprime },
        }); // Utilise Prisma avec findUnique

        if (!prime) {
            throw new NotFoundError('Cette prime n\'existe pas!');
        }

        return prime;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createPrime = async ({ body, user }) => {
    try {
        const existingPrime = await db.prime.findFirst({
            where: {
                nomprime: {
                    contains: body.nomprime
                }
            }
        });
        if (existingPrime) {
            throw new DuplicateError('Ce prime existe deja!');
        }
        //body.codeprime = `ACT-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`;
        const createdPrime = await db.prime.create({ data: body });
        return createdPrime;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listPrimes = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomprime" : sort.id || "nomprime";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const primes = await db.prime.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomprime: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.prime.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomprime: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: primes,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedPrimes = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomprime" : sort.id || "nomprime";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const primes = await db.prime.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomprime: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.prime.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomprime: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: primes,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une prime
export const updatePrime = async ({ body, user, idprime }) => {
    const {   nomprime,
        codeprime,
        valeurprime,
        tageId,
        packId,
        puissId ,
        capitauxId,
        franchiseId, published } = body;
    try {
        const updatedPrime = await db.prime.update({
            where: { idprime }, // Utiliser l'ID pour le recherche
            data: {
                nomprime,
                codeprime,
                valeurprime,
                tageId,
                packId,
                puissId ,
                capitauxId,
                franchiseId,
                published
            }
        });

        if (!updatedPrime) {
            throw new BadRequestError("Prime non trouvée");
        }

        return updatedPrime
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le prime à jour");
    }
}
