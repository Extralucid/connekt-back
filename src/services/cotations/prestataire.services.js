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
export const deletePrestataire = async ({ idprestataire }) => {
    const prestataire = await db.prestataire.findUnique({
        where: { idprestataire: idprestataire },
    }); // Utilise Prisma avec findUnique

    if (!prestataire) {
        throw new NotFoundError('Cette prestataire n\'existe pas!');
    }
    return db.prestataire.update({
        where: {
            idprestataire: idprestataire,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une prestataire par ID
export async function getPrestataireById(idprestataire) {
    try {

        const prestataire = await db.prestataire.findUnique({
            where: { idprestataire: idprestataire },
            include: {
                Statut: true
            }
        }); // Utilise Prisma avec findUnique

        if (!prestataire) {
            throw new NotFoundError('Cette prestataire n\'existe pas!');
        }

        return prestataire;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createPrestataire = async ({ body, user }) => {
    try {
        const existingPrestataire = await db.prestataire.findFirst({
            where: {
                phoneprestataire: {
                    contains: body.phoneprestataire
                }
            }
        });
        if (existingPrestataire) {
            throw new DuplicateError('Ce prestataire existe deja!');
        }
        //body.codeprestataire = `PRT-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`;
        const createdPrestataire = await db.prestataire.create({ data: body });

        if (createdPrestataire) {
            const ressource = await db.ressource.findFirst({ where: { rcode: 'ADMIN' } });
            const user = await db.user.create({
                data: {
                    email: createdPrestataire.emailprestataire,
                    phone: createdPrestataire.phoneprestataire,
                    password: await bcrypt.hash('123456', 12),
                    codeuser: `USR-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`,
                    unom: createdPrestataire.nomprestataire,
                    uprenom: createdPrestataire.nomprestataire,
                    avatar: '',
                    ressourceId: ressource.idressource,
                    prestataireId: createdPrestataire.idprestataire,
                    isDeleted: false,
                }
            });
        }
        return createdPrestataire;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listPrestataires = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomprestataire" : sort.id || "nomprestataire";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const prestataires = await db.prestataire.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomprestataire: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: {
                Statut: true
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.prestataire.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomprestataire: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: prestataires,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedPrestataires = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomprestataire" : sort.id || "nomprestataire";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const prestataires = await db.prestataire.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomprestataire: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: {
                Statut: true
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.prestataire.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomprestataire: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: prestataires,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une prestataire
export const updatePrestataire = async ({ body, user, idprestataire }) => {
    const { nomprestataire,
        codeprestataire,
        responsableprestataire,
        emailprestataire,
        siteprestataire,
        phoneprestataire,
        faxprestataire,
        longitudeprestataire,
        latitudeprestataire,
        descriptionprestataire,
        adresseprestataire, statutId, published } = body;
    try {
        const updatedPrestataire = await db.prestataire.update({
            where: { idprestataire }, // Utiliser l'ID pour le recherche
            data: {
                nomprestataire,
                codeprestataire,
                responsableprestataire,
                emailprestataire,
                siteprestataire,
                phoneprestataire,
                faxprestataire,
                longitudeprestataire,
                latitudeprestataire,
                descriptionprestataire,
                adresseprestataire,
                published,
                statutId
            }
        });

        if (!updatedPrestataire) {
            throw new BadRequestError("Prestataire non trouvée");
        }

        let user = await db.user.findFirst({
            where: {
                email: updatedPrestataire.emailprestataire 
            },
        });
        if (user) {
            const updatedUser = await db.user.update({
                where: { id: user.id }, // Utiliser l'ID pour le recherche
                data: {
                    email: updatedPrestataire.emailprestataire,
                    phone: updatedPrestataire.phoneprestataire,
                    unom: updatedPrestataire.nomprestataire,
                    uprenom: updatedPrestataire.nomprestataire,
                }
            });
            console.log(updatedUser);
        }
        
        
        return updatedPrestataire
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le prestataire à jour");
    }
}
