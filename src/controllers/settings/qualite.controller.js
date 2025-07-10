import appResponse from '../../../lib/appResponse.js';

import { createQualite, deleteQualite, getQualiteById, listDeletedQualites, listQualites, updateQualite } from '../../services/settings/qualite.services.js';

export const createQualiteHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createQualite({ body, user });

    res.send(appResponse('Qualite created successfully', response));
};

export const updateQualiteHandler = async (req, res) => {
  const { body, user } = req;
  const idqualite = req.params.id;

  const response = await updateQualite({ body, user, idqualite });

  res.send(appResponse('Qualite updated successfully', response));
};
export const listAllQualitesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listQualites(Number(page), Number(limit), search, order);

  res.send(appResponse('Qualites listed successfully', response));
};
export const listAllDeletedQualitesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedQualites(Number(page), Number(limit), search, order);

  res.send(appResponse('Qualites listed successfully', response));
};
export const getQualiteHandler = async (req, res) => {
  const idqualite = req.params.id;

  const response = await getQualiteById(idqualite);

  res.send(appResponse('Qualites fetched successfully', response));
};
export const deleteQualiteHandler = async (req, res) => {
  const idqualite = req.params.id;

  const response = await deleteQualite({idqualite});

  res.send(appResponse('Qualites deleted successfully', response));
};
