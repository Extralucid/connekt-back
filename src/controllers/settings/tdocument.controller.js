import appResponse from '../../../lib/appResponse.js';

import { createTdocument, deleteTdocument, getTdocumentById, listDeletedTdocuments, listTdocuments, updateTdocument } from '../../services/settings/tdocument.services.js';

export const createTdocumentHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createTdocument({ body, user });

    res.send(appResponse('Tdocument created successfully', response));
};

export const updateTdocumentHandler = async (req, res) => {
  const { body, user } = req;
  const idtdoc = req.params.id;

  const response = await updateTdocument({ body, user, idtdoc });

  res.send(appResponse('Tdocument updated successfully', response));
};
export const listAllTdocumentsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listTdocuments(Number(page), Number(limit), search, order);

  res.send(appResponse('Tdocuments listed successfully', response));
};
export const listAllDeletedTdocumentsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedTdocuments(Number(page), Number(limit), search, order);

  res.send(appResponse('Tdocuments listed successfully', response));
};
export const getTdocumentHandler = async (req, res) => {
  const idtdoc = req.params.id;

  const response = await getTdocumentById(idtdoc);

  res.send(appResponse('Tdocuments fetched successfully', response));
};
export const deleteTdocumentHandler = async (req, res) => {
  const idtdoc = req.params.id;

  const response = await deleteTdocument({idtdoc});

  res.send(appResponse('Tdocuments deleted successfully', response));
};
