import appResponse from '../../../lib/appResponse.js';

import { createDocument, deleteDocument, getDocumentById, listDeletedDocuments, listDocuments, updateDocument } from '../../services/cotations/document.services.js';


export const createDocumentHandler = async (req, res) => {
    const { body, user, file } = req;

    const response = await createDocument({ body, user, file });

    res.send(appResponse('Document created successfully', response));
};

export const updateDocumentHandler = async (req, res) => {
  const { body, user, file } = req;
  const iddocument = req.params.id;

  const response = await updateDocument({ body, user, file, iddocument });

  res.send(appResponse('Document updated successfully', response));
};
export const listAllDocumentsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDocuments(Number(page), Number(limit), search, order);

  res.send(appResponse('Documents listed successfully', response));
};
export const listAllDeletedDocumentsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedDocuments(Number(page), Number(limit), search, order);

  res.send(appResponse('Documents listed successfully', response));
};
export const getDocumentHandler = async (req, res) => {
  const iddocument = req.params.id;

  const response = await getDocumentById(iddocument);

  res.send(appResponse('Documents fetched successfully', response));
};
export const deleteDocumentHandler = async (req, res) => {
  const iddocument = req.params.id;

  const response = await deleteDocument({iddocument});

  res.send(appResponse('Documents deleted successfully', response));
};