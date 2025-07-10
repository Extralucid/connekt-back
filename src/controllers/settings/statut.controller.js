import appResponse from '../../../lib/appResponse.js';

import { createStatut, deleteStatut, getStatutById, listDeletedStatuts, listStatuts, updateStatut } from '../../services/settings/statut.services.js';


export const createStatutHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createStatut({ body, user });

    res.send(appResponse('Statut created successfully', response));
};

export const updateStatutHandler = async (req, res) => {
  const { body, user } = req;
  const idstatut = req.params.id;

  const response = await updateStatut({ body, user, idstatut });

  res.send(appResponse('Statut updated successfully', response));
};
export const listAllStatutsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listStatuts(Number(page), Number(limit), search, order);

  res.send(appResponse('Statuts listed successfully', response));
};
export const listAllDeletedStatutsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedStatuts(Number(page), Number(limit), search, order);

  res.send(appResponse('Statuts listed successfully', response));
};
export const getStatutHandler = async (req, res) => {
  const idstatut = req.params.id;

  const response = await getStatutById(idstatut);

  res.send(appResponse('Statuts fetched successfully', response));
};
export const deleteStatutHandler = async (req, res) => {
  const idstatut = req.params.id;

  const response = await deleteStatut({idstatut});

  res.send(appResponse('Statuts deleted successfully', response));
};