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
export const deletePack = async ({ idpack }) => {
    const pack = await db.pack.findUnique({
        where: { idpack: idpack },
    }); // Utilise Prisma avec findUnique

    if (!pack) {
        throw new NotFoundError('Cette pack n\'existe pas!');
    }
    return db.pack.update({
        where: {
            idpack: idpack,
        },
        data: {
            isDeleted: true
        }
    });
}


// Obtenir une pack par ID
export async function getPackById(idpack) {
    try {

        const pack = await db.pack.findUnique({
            where: { idpack: idpack },
            include:{
                PackTdoc: true,
                PackGarantie: true,
                PackTage: true
            }
        }); // Utilise Prisma avec findUnique

        if (!pack) {
            throw new NotFoundError('Cette pack n\'existe pas!');
        }

        return pack;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}

// Obtenir les parametres de creations d'pack
export async function createPackData() {
    try {

        return {
            garanties: await db.garantie.findMany({ where: { isDeleted: false } }),
            tdocuments: await db.tdocument.findMany({ where: { isDeleted: false } })
        };
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}

// Obtenir les parametres de modification d'pack
export async function updatePackData(idpack) {
    try {
        const pack = await db.pack.findUnique({
            where: { idpack: idpack },
            include:{
                PackTdoc: true,
                PackGarantie: true,
                PackTage: true
            }
        }); // Utilise Prisma avec findUnique

        if (!pack) {
            throw new NotFoundError('cet pack n\'existe pas!');
        }

        return {
            pack: pack,
            garanties: await db.garantie.findMany({ where: { isDeleted: false } }),
            tdocuments: await db.tdocument.findMany({ where: { isDeleted: false } })
        };
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}



export const createPack = async ({ body, user }) => {
    try {
        const existingPack = await db.pack.findFirst({
            where: {
                nompack: {
                    contains: body.nompack
                }
            }
        });
        if (existingPack) {
            throw new DuplicateError('Ce pack existe deja!');
        }
        //body.codepack = `ACT-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`;
        const createdPack = await db.pack.create({ data: body });
        if (createdPack && body.garanties) {
            let garanties = body.garanties;
            garanties.forEach(async element => {
                let createdElement = await db.packGarantie.create({
                    data: {
                        isActive: element.isActive,
                        packId: createdPack.idpack,
                        garantieId: element.garantieId
                    }
                })
                console.log(createdElement);
                
            });
        }

        if (createdPack && body.documents) {
            let documents = body.documents;
            documents.forEach(async element => {
                let createddoc = await db.packTdoc.create({
                    data: {
                        isActive: element.isActive,
                        packId: createdPack.idpack,
                        tdocId: element.tdocId
                    }
                })
                console.log(createddoc);
                
            });
        }
        return createdPack;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listPacks = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nompack" : sort.id || "nompack";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const packs = await db.pack.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nompack: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.pack.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nompack: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: packs,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedPacks = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nompack" : sort.id || "nompack";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const packs = await db.pack.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nompack: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.pack.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nompack: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: packs,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une pack
export const updatePack = async ({ body, user, idpack }) => {
    const { nompack,
        codepack,
        photopack,
        ordrepack,
        descriptionpack,
        withPT, cpEqVv, published } = body;
    try {
        const updatedPack = await db.pack.update({
            where: { idpack }, // Utiliser l'ID pour le recherche
            data: {
                nompack,
                codepack,
                photopack,
                ordrepack,
                descriptionpack,
                withPT, cpEqVv, published
            }
        });

        if (!updatedPack) {
            throw new BadRequestError("Pack non trouvée");
        }

        if (body.garanties) {
            let garanties = body.garanties;
            garanties.forEach(async element => {
                let updateddElement = await db.packGarantie.update({where: { garantieId: element.garantieId, packId: updatedPack.idpack },
                    data: {
                        isActive: element.isActive
                    }
                })
                console.log(updateddElement);
                
            });
        }
        if (body.documents) {
            let documents = body.documents;
            documents.forEach(async element => {
                let updatedElement = await db.packTdoc.update({where: { tdocId: element.tdocId, packId: updatedPack.idpack },
                    data: {
                        isActive: element.isActive
                    }
                })
                console.log(updatedElement);
                
            });
        }

        return updatedPack
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le pack à jour");
    }
}
