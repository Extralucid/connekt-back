import appResponse from '../../../lib/appResponse.js';

import { createGarantie, deleteGarantie, getGarantieById, listDeletedGaranties, listGaranties, updateGarantie } from '../../services/settings/garantie.services.js';

export const createGarantieHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createGarantie({ body, user });

    res.send(appResponse('Garantie created successfully', response));
};

export const updateGarantieHandler = async (req, res) => {
  const { body, user } = req;
  const idgarantie = req.params.id;

  const response = await updateGarantie({ body, user, idgarantie });

  res.send(appResponse('Garantie updated successfully', response));
};
export const listAllGarantiesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listGaranties(Number(page), Number(limit), search, order);

  res.send(appResponse('Garanties listed successfully', response));
};
export const listAllDeletedGarantiesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedGaranties(Number(page), Number(limit), search, order);

  res.send(appResponse('Garanties listed successfully', response));
};
export const getGarantieHandler = async (req, res) => {
  const idgarantie = req.params.id;

  const response = await getGarantieById(idgarantie);

  res.send(appResponse('Garanties fetched successfully', response));
};
export const deleteGarantieHandler = async (req, res) => {
  const idgarantie = req.params.id;

  const response = await deleteGarantie({idgarantie});

  res.send(appResponse('Garanties deleted successfully', response));
};
