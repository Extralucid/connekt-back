import appResponse from '../../../lib/appResponse.js';

import { createActivite, deleteActivite, getActiviteById, listDeletedActivites, listActivites, updateActivite } from '../../services/settings/activite.services.js';

export const createActiviteHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createActivite({ body, user });

    res.send(appResponse('Activite created successfully', response));
};

export const updateActiviteHandler = async (req, res) => {
  const { body, user } = req;
  const idactivite = req.params.id;

  const response = await updateActivite({ body, user, idactivite });

  res.send(appResponse('Activite updated successfully', response));
};
export const listAllActivitesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listActivites(Number(page), Number(limit), search, order);

  res.send(appResponse('Activites listed successfully', response));
};
export const listAllDeletedActivitesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedActivites(Number(page), Number(limit), search, order);

  res.send(appResponse('Activites listed successfully', response));
};
export const getActiviteHandler = async (req, res) => {
  const idactivite = req.params.id;

  const response = await getActiviteById(idactivite);

  res.send(appResponse('Activites fetched successfully', response));
};
export const deleteActiviteHandler = async (req, res) => {
  const idactivite = req.params.id;

  const response = await deleteActivite({idactivite});

  res.send(appResponse('Activites deleted successfully', response));
};
