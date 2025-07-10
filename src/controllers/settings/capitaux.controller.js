import appResponse from '../../../lib/appResponse.js';

import { createCapitaux, deleteCapitaux, getCapitauxById, listDeletedCapitauxs, listCapitauxs, updateCapitaux } from '../../services/settings/capitaux.services.js';

export const createCapitauxHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createCapitaux({ body, user });

    res.send(appResponse('Capitaux created successfully', response));
};

export const updateCapitauxHandler = async (req, res) => {
  const { body, user } = req;
  const idcapitaux = req.params.id;

  const response = await updateCapitaux({ body, user, idcapitaux });

  res.send(appResponse('Capitaux updated successfully', response));
};
export const listAllCapitauxsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listCapitauxs(Number(page), Number(limit), search, order);

  res.send(appResponse('Capitauxs listed successfully', response));
};
export const listAllDeletedCapitauxsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedCapitauxs(Number(page), Number(limit), search, order);

  res.send(appResponse('Capitauxs listed successfully', response));
};
export const getCapitauxHandler = async (req, res) => {
  const idcapitaux = req.params.id;

  const response = await getCapitauxById(idcapitaux);

  res.send(appResponse('Capitauxs fetched successfully', response));
};
export const deleteCapitauxHandler = async (req, res) => {
  const idcapitaux = req.params.id;

  const response = await deleteCapitaux({idcapitaux});

  res.send(appResponse('Capitauxs deleted successfully', response));
};
