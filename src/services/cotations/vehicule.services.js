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
export const deleteVehicule = async ({ idvehicule }) => {
    const vehicule = await db.vehicule.findUnique({
        where: { idvehicule: idvehicule },
    }); // Utilise Prisma avec findUnique

    if (!vehicule) {
        throw new NotFoundError('cet vehicule n\'existe pas!');
    }
    return db.vehicule.update({
        where: {
            idvehicule: idvehicule,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une vehicule par ID
export async function getVehiculeById(idvehicule) {
    try {

        const vehicule = await db.vehicule.findUnique({
            where: { idvehicule: idvehicule },
            include: {
                Marque: true,
                Modele: true,
                Energie: true,
                Puissance: true
            }
        }); // Utilise Prisma avec findUnique

        if (!vehicule) {
            throw new NotFoundError('cet vehicule n\'existe pas!');
        }

        return vehicule;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}

// Obtenir les parametres de creations d'vehicule
export async function createVehiculeData() {
    try {

        return {
            marques: await db.marque.findMany({ where: { isDeleted: false } }),
            modeles: await db.modele.findMany({ where: { isDeleted: false } }),
            energies: await db.energie.findMany({ where: { isDeleted: false } }),
            puissances: await db.tpuissance.findMany({ where: { isDeleted: false } })
        };
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}

// Obtenir les parametres de modification d'vehicule
export async function updateVehiculeData(idvehicule) {
    try {
        const vehicule = await db.vehicule.findUnique({
            where: { idvehicule: idvehicule }, include: {
                Marque: true,
                Modele: true,
                Puissance: true,
                Energie: true
            }
        }); // Utilise Prisma avec findUnique

        if (!vehicule) {
            throw new NotFoundError('cet vehicule n\'existe pas!');
        }

        return {
            vehicule: vehicule,
            marques: await db.marque.findMany({ where: { isDeleted: false } }),
            modeles: await db.modele.findMany({ where: { isDeleted: false } }),
            energies: await db.energie.findMany({ where: { isDeleted: false } }),
            puissances: await db.tpuissance.findMany({ where: { isDeleted: false } })
        };
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}



export const createVehicule = async ({ body, user }) => {
    try {

        const createdVehicule = await db.vehicule.create({
            data: {
                codevehicule: `VHE-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`,
                dateMiseCirdulation: body.dateMiseCirdulation,
                valeurNeuve: body.valeurNeuve,
                valeurvenale: body.valeurvenale,
                typeTransport: body.typeTransport,
                nbPlace: body.nbPlace,
                nbPlaceAssure: body.nbPlaceAssure,
                nbPlaceSupprime: body.nbPlaceSupprime,
                immatriculation: body.immatriculation,
                marqueId: body.marqueId,
                modeleId: body.modeleId,
                energieId: body.energieId,
                puissanceId: body.puissanceId,
                vehiculeId: createdVehicule.vehiculeId,
                descriptionVehicule: body.descriptionVehicule,
                photo1: '',
                photo2: '',
                photo3: '',
                photo4: ''
            }
        });

        return createdVehicule;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listVehicules = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "codevehicule" : sort.id || "codevehicule";
        const orderVehicule = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const vehicules = await db.vehicule.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { codevehicule: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderVehicule,
            },
            include: {
                Marque: true,
                Modele: true,
                Puissance: true,
                Energie: true
            }
        });

        const countTotal = await db.vehicule.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { codevehicule: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: {
                Marque: true,
                Modele: true,
                Puissance: true,
                Energie: true
            }
        });

        return {
            data: vehicules,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedVehicules = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "codevehicule" : sort.id || "codevehicule";
        const orderVehicule = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const vehicules = await db.vehicule.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { codevehicule: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: {
                Marque: true,
                Modele: true,
                Puissance: true,
                Energie: true
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderVehicule,
            },
        });

        const countTotal = await db.vehicule.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { codevehicule: { contains: search, mode: "insensitive" } } : {},
                ],
                include: {
                    Marque: true,
                    Modele: true,
                    Puissance: true,
                    Energie: true
                }
            },
        });

        return {
            data: vehicules,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une vehicule
export const updateVehicule = async ({ body, user, idvehicule }) => {
    try {
        const updatedVehicule = await db.vehicule.update({
            where: { idvehicule }, // Utiliser l'ID pour la recherche
            data: {
                dateMiseCirdulation: body.dateMiseCirdulation,
                valeurNeuve: body.valeurNeuve,
                valeurvenale: body.valeurvenale,
                typeTransport: body.typeTransport,
                nbPlace: body.nbPlace,
                nbPlaceAssure: body.nbPlaceAssure,
                nbPlaceSupprime: body.nbPlaceSupprime,
                immatriculation: body.immatriculation,
                marqueId: body.marqueId,
                modeleId: body.modeleId,
                energieId: body.energieId,
                puissanceId: body.puissanceId,
                descriptionVehicule: body.descriptionVehicule,
                photo1: '',
                photo2: '',
                photo3: '',
                photo4: ''
            }
        });

        return updatedVehicule
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre la vehicule à jour");
    }
}
