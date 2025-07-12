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
export const deleteDocument = async ({ iddocument }) => {
    const document = await db.document.findUnique({
        where: { iddocument: iddocument },
    }); // Utilise Prisma avec findUnique

    if (!document) {
        throw new NotFoundError('Cette document n\'existe pas!');
    }
    return db.document.update({
        where: {
            iddocument: iddocument,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir les parametres de creations d'document
export async function createDocumentData() {
    try {

        return {
            cotations: await db.cotation.findMany({ where: { isDeleted: false } }),
            tdocuments: await db.tdocument.findMany({ where: { isDeleted: false } })
        };
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}

// Obtenir les parametres de modification d'cotation
export async function updateDocumentData(iddocument) {
    try {
        const document = await db.document.findUnique({
            where: { iddocument: iddocument }, include: {
                Tdocument: true,
                Assure: true
            }
        }); // Utilise Prisma avec findUnique

        if (!document) {
            throw new NotFoundError('cet document n\'existe pas!');
        }

        return {
            document: document,
            cotations: await db.cotation.findMany({ where: { isDeleted: false } }),
            tdocuments: await db.tdocument.findMany({ where: { isDeleted: false } })
        };
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}

// Obtenir une document par ID
export async function getDocumentById(iddocument) {
    try {

        const document = await db.document.findUnique({
            where: { iddocument: iddocument },
            include: {
                Tdocument: true,
                Assure: true
            }
        }); // Utilise Prisma avec findUnique

        if (!document) {
            throw new NotFoundError('Cette document n\'existe pas!');
        }

        return document;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createDocument = async ({ body, user, file }) => {
    try {

        body.codeDocument = `DCM-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`;
        if (!file) {
            throw new BadRequestError("Document non trouvée");
        }
        body.nomDocument = file.originalname;
        const createdDocument = await db.document.create({ data: body });
        return createdDocument;
    } catch (err) {
        throw new BadRequestError(err.message)

    }
};

export const listDocuments = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomDocument" : sort.id || "nomDocument";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const documents = await db.document.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomDocument: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: {
                Tdocument: true,
                Assure: true
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.document.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { nomDocument: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: documents,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedDocuments = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "nomDocument" : sort.id || "nomDocument";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const documents = await db.document.findMany({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomDocument: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: {
                Tdocument: true,
                Assure: true
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.document.count({
            where: {
                OR: [
                    { isDeleted: true },
                    search ? { nomDocument: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: documents,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une document
export const updateDocument = async ({ body, user, file, iddocument }) => {
    const { 
        descriptionDocument,
        tdocId,
        cotationId,
        vehiculeId,
        published } = body;
    try {
        let cotation = await db.cotation.findFirst({ where: { idcotation: cotationId } });

        if (!cotation) {
            throw new BadRequestError("Document non trouvée");
        }
        if (file) {
            let nomDocument = file.originalname;
            const updatedDocument = await db.document.update({
                where: { iddocument }, // Utiliser l'ID pour le recherche
                data: {
                    nomDocument: nomDocument,
                    descriptionDocument: descriptionDocument,
                    tdocId: tdocId,
                    assureId: cotation.assureId,
                    cotationId: cotationId,
                    vehiculeId: vehiculeId,
                    published: published
                }
            });
            if (!updatedDocument) {
                throw new BadRequestError("Document non trouvée");
            }
            return updatedDocument;
        } else {
            const updatedDocument = await db.document.update({
                where: { iddocument }, // Utiliser l'ID pour le recherche
                data: {
                    descriptionDocument: descriptionDocument,
                    tdocId: tdocId,
                    assureId: cotation.assureId,
                    cotationId: cotationId,
                    vehiculeId: vehiculeId,
                    published: published
                }
            });
            if (!updatedDocument) {
                throw new BadRequestError("Document non trouvée");
            }
            return updatedDocument;
        }

        
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le document à jour");
    }
}
