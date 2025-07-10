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
export const deleteCotation = async ({ idcotation }) => {
    const cotation = await db.cotation.findUnique({
        where: { idcotation: idcotation },
    }); // Utilise Prisma avec findUnique

    if (!cotation) {
        throw new NotFoundError('cet cotation n\'existe pas!');
    }
    return db.cotation.update({
        where: {
            idcotation: idcotation,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une cotation par ID
export async function getCotationById(idcotation) {
    try {

        const cotation = await db.cotation.findUnique({
            where: { idcotation: idcotation },
            include: {
                Assure: true,
                Statut: true,
                Prestataire: true,
                Prime: true,
                Vehicule: true
            }
        }); // Utilise Prisma avec findUnique

        if (!cotation) {
            throw new NotFoundError('cet cotation n\'existe pas!');
        }

        return cotation;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}

// Obtenir les parametres de creations d'cotation
export async function createCotationData() {
    try {

        return {
            primes: await db.prime.findMany({ where: { isDeleted: false } }),
            statuts: await db.statut.findMany({ where: { isDeleted: false } }),
            garanties: await db.garantie.findMany({ where: { isDeleted: false } })
        };
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}

// Obtenir les parametres de modification d'cotation
export async function updateCotationData(idcotation) {
    try {
        const cotation = await db.cotation.findUnique({
            where: { idcotation: idcotation }, include: {
                Assure: true,
                Statut: true,
                Prestataire: true,
                Prime: true,
                Vehicule: true
            }
        }); // Utilise Prisma avec findUnique

        if (!cotation) {
            throw new NotFoundError('cet cotation n\'existe pas!');
        }

        return {
            cotation: cotation,
            primes: await db.prime.findMany({ where: { isDeleted: false } }),
            statuts: await db.statut.findMany({ where: { isDeleted: false } }),
            garanties: await db.garantie.findMany({ where: { isDeleted: false } })
        };
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}



export const createCotation = async ({ body, user }) => {
    try {
        let existingAssure = await db.assure.findFirst({
            where: {
                phoneassure: {
                    contains: body.assure.phoneassure
                }
            }
        });
        if (!existingCotation) {
            existingAssure = await db.assure.create({
                data: {
                    codeassure: `ASR-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`,
                    nomassure: body.assure.nomassure,
                    prenomassure: body.assure.prenomassure,
                    emailassure: body.assure.emailassure,
                    siteassure: body.assure.siteassure,
                    phoneassure: body.assure.phoneassure,
                    gsmassure: body.assure.gsmassure,
                    faxassure: body.assure.faxassure,
                    descriptionassure: body.assure.descriptionassure,
                    adresseassure: body.assure.adresseassure,
                    activiteId: body.assure.activiteId,
                    qualiteId: body.assure.qualiteId,
                    professionId: body.assure.professionId
                }
            });
        }

        const statuts = await db.statut.findFirst({ where: { codestatut: 'EN_ATTENTE' } });
        const createdCotation = await db.cotation.create({
            data: {
                codecotation: `CTN-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`,
                typecotation: body.typecotation,
                dureMois: body.dureMois,
                dureeJours: body.dureeJours,
                dateEffet: body.dateEffet,
                dateEcheance: body.dateEcheance,
                reductionBNS: body.reductionBNS,
                reductionCommerciale: body.reductionCommerciale,
                descriptioncotation: body.descriptioncotation,
                lieuCotation: body.lieuCotation,
                assureId: existingAssure.assureId,
                statutId: statuts.idstatut,
                prestataireId: body.prestataireId,
                primeId: body.primeId
            }
        });

        if (createdCotation && body.vehicules) {
            let vehicules = body.vehicules;
            vehicules.forEach(async element => {
                let VehiculeCreated = await db.vehicule.create({
                    data: {
                        codevehicule: `VHE-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`,
                        dateMiseCirdulation: element.dateMiseCirdulation,
                        valeurNeuve: element.valeurNeuve,
                        valeurvenale: element.valeurvenale,
                        typeTransport: element.typeTransport,
                        nbPlace: element.nbPlace,
                        nbPlaceAssure: element.nbPlaceAssure,
                        nbPlaceSupprime: element.nbPlaceSupprime,
                        immatriculation: element.immatriculation,
                        marqueId: element.marqueId,
                        modeleId: element.modeleId,
                        energieId: element.energieId,
                        puissanceId: element.puissanceId,
                        cotationId: createdCotation.cotationId,
                        descriptionVehicule: element.descriptionVehicule,
                        photo1: '',
                        photo2: '',
                        photo3: '',
                        photo4: ''
                    }
                })
                console.log(VehiculeCreated);

            });
        }


        return createdCotation;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listCotations = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "codecotation" : sort.id || "codecotation";
        const orderCotation = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const cotations = await db.cotation.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { codecotation: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: {
                Assure: true,
                Statut: true,
                Prestataire: true,
                Prime: true,
                Vehicule: true
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderCotation,
            },
        });

        const countTotal = await db.cotation.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { codecotation: { contains: search, mode: "insensitive" } } : {},
                ],
            }
        });

        return {
            data: cotations,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedCotations = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "codecotation" : sort.id || "codecotation";
        const orderCotation = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const cotations = await db.cotation.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { codecotation: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: {
                Assure: true,
                Statut: true,
                Prestataire: true,
                Prime: true,
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderCotation,
            },
        });

        const countTotal = await db.cotation.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { codecotation: { contains: search, mode: "insensitive" } } : {},
                ]
            },
        });

        return {
            data: cotations,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une cotation
export const updateCotation = async ({ body, user, idcotation }) => {
    try {
        const updatedCotation = await db.cotation.update({
            where: { idcotation }, // Utiliser l'ID pour la recherche
            data: {
                typecotation: body.typecotation,
                dureMois: body.dureMois,
                dureeJours: body.dureeJours,
                dateEffet: body.dateEffet,
                dateEcheance: body.dateEcheance,
                reductionBNS: body.reductionBNS,
                reductionCommerciale: body.reductionCommerciale,
                descriptioncotation: body.descriptioncotation,
                lieuCotation: body.lieuCotation,
                assureId: body.assureId,
                statutId: statuts.idstatut,
                prestataireId: body.prestataireId,
                primeId: body.primeId
            }
        });

        const updatedAssure = await db.assure.update({
            where: { idassure: body.assure.assureId }, // Utiliser l'ID pour la recherche
            data: {
                nomassure: body.assure.nomassure,
                prenomassure: body.assure.prenomassure,
                emailassure: body.assure.emailassure,
                siteassure: body.assure.siteassure,
                phoneassure: body.assure.phoneassure,
                gsmassure: body.assure.gsmassure,
                faxassure: body.assure.faxassure,
                descriptionassure: body.assure.descriptionassure,
                adresseassure: body.assure.adresseassure,
                activiteId: body.assure.activiteId,
                qualiteId: body.assure.qualiteId,
                professionId: body.assure.professionId
            }
        });
        if (!updatedCotation) {
            throw new BadRequestError("Cotation non trouvée");
        }

        if (body.vehicules) {
            await db.vehicule.deleteMany({where: {cotationId: updatedCotation.idcotation}});
            let vehicules = body.vehicules;
            vehicules.forEach(async element => {
                let VehiculeCreated = await db.vehicule.create({
                    data: {
                        codevehicule: `VHE-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`,
                        dateMiseCirdulation: element.dateMiseCirdulation,
                        valeurNeuve: element.valeurNeuve,
                        valeurvenale: element.valeurvenale,
                        typeTransport: element.typeTransport,
                        nbPlace: element.nbPlace,
                        nbPlaceAssure: element.nbPlaceAssure,
                        nbPlaceSupprime: element.nbPlaceSupprime,
                        immatriculation: element.immatriculation,
                        marqueId: element.marqueId,
                        modeleId: element.modeleId,
                        energieId: element.energieId,
                        puissanceId: element.puissanceId,
                        cotationId: updatedCotation.cotationId,
                        descriptionVehicule: element.descriptionVehicule,
                        photo1: '',
                        photo2: '',
                        photo3: '',
                        photo4: ''
                    }
                })
                console.log(VehiculeCreated);

            });
        }

        return updatedCotation
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre la cotation à jour");
    }
}
