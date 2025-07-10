import appResponse from '../../../lib/appResponse.js';

import { createTage, deleteTage, getTageById, listDeletedTages, listTages, updateTage } from '../../services/settings/tage.services.js';

export const createTageHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createTage({ body, user });

    res.send(appResponse('Tage created successfully', response));
};

export const updateTageHandler = async (req, res) => {
  const { body, user } = req;
  const idtage = req.params.id;

  const response = await updateTage({ body, user, idtage });

  res.send(appResponse('Tage updated successfully', response));
};
export const listAllTagesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listTages(Number(page), Number(limit), search, order);

  res.send(appResponse('Tages listed successfully', response));
};
export const listAllDeletedTagesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedTages(Number(page), Number(limit), search, order);

  res.send(appResponse('Tages listed successfully', response));
};
export const getTageHandler = async (req, res) => {
  const idtage = req.params.id;

  const response = await getTageById(idtage);

  res.send(appResponse('Tages fetched successfully', response));
};
export const deleteTageHandler = async (req, res) => {
  const idtage = req.params.id;

  const response = await deleteTage({idtage});

  res.send(appResponse('Tages deleted successfully', response));
};
