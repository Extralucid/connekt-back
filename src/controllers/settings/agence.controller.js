import appResponse from '../../../lib/appResponse.js';

import { createAgence, deleteAgence, getAgenceById, listDeletedAgences, listAgences, updateAgence } from '../../services/settings/agence.services.js';

export const createAgenceHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createAgence({ body, user });

    res.send(appResponse('Agence created successfully', response));
};

export const updateAgenceHandler = async (req, res) => {
  const { body, user } = req;
  const idagence = req.params.id;

  const response = await updateAgence({ body, user, idagence });

  res.send(appResponse('Agence updated successfully', response));
};
export const listAllAgencesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listAgences(Number(page), Number(limit), search, order);

  res.send(appResponse('Agences listed successfully', response));
};
export const listAllDeletedAgencesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedAgences(Number(page), Number(limit), search, order);

  res.send(appResponse('Agences listed successfully', response));
};
export const getAgenceHandler = async (req, res) => {
  const idagence = req.params.id;

  const response = await getAgenceById(idagence);

  res.send(appResponse('Agences fetched successfully', response));
};
export const deleteAgenceHandler = async (req, res) => {
  const idagence = req.params.id;

  const response = await deleteAgence({idagence});

  res.send(appResponse('Agences deleted successfully', response));
};
