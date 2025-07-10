import appResponse from '../../../lib/appResponse.js';

import { createTpuissance, deleteTpuissance, getTpuissanceById, listDeletedTpuissances, listTpuissances, updateTpuissance } from '../../services/settings/Tpuissance.services.js';

export const createTpuissanceHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createTpuissance({ body, user });

    res.send(appResponse('Tpuissance created successfully', response));
};

export const updateTpuissanceHandler = async (req, res) => {
  const { body, user } = req;
  const idpuissance = req.params.id;

  const response = await updateTpuissance({ body, user, idpuissance });

  res.send(appResponse('Tpuissance updated successfully', response));
};
export const listAllTpuissancesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listTpuissances(Number(page), Number(limit), search, order);

  res.send(appResponse('Tpuissances listed successfully', response));
};
export const listAllDeletedTpuissancesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedTpuissances(Number(page), Number(limit), search, order);

  res.send(appResponse('Tpuissances listed successfully', response));
};
export const getTpuissanceHandler = async (req, res) => {
  const idpuissance = req.params.id;

  const response = await getTpuissanceById(idpuissance);

  res.send(appResponse('Tpuissances fetched successfully', response));
};
export const deleteTpuissanceHandler = async (req, res) => {
  const idpuissance = req.params.id;

  const response = await deleteTpuissance({idpuissance});

  res.send(appResponse('Tpuissances deleted successfully', response));
};
