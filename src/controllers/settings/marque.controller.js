import appResponse from '../../../lib/appResponse.js';

import { createMarque, deleteMarque, getMarqueById, listDeletedMarques, listMarques, updateMarque } from '../../services/settings/marque.services.js';

export const createMarqueHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createMarque({ body, user });

    res.send(appResponse('Marque created successfully', response));
};

export const updateMarqueHandler = async (req, res) => {
  const { body, user } = req;
  const idmarque = req.params.id;

  const response = await updateMarque({ body, user, idmarque });

  res.send(appResponse('Marque updated successfully', response));
};
export const listAllMarquesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listMarques(Number(page), Number(limit), search, order);

  res.send(appResponse('Marques listed successfully', response));
};
export const listAllDeletedMarquesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedMarques(Number(page), Number(limit), search, order);

  res.send(appResponse('Marques listed successfully', response));
};
export const getMarqueHandler = async (req, res) => {
  const idmarque = req.params.id;

  const response = await getMarqueById(idmarque);

  res.send(appResponse('Marques fetched successfully', response));
};
export const deleteMarqueHandler = async (req, res) => {
  const idmarque = req.params.id;

  const response = await deleteMarque({idmarque});

  res.send(appResponse('Marques deleted successfully', response));
};
