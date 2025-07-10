import appResponse from '../../../lib/appResponse.js';

import { createFranchise, deleteFranchise, getFranchiseById, listDeletedFranchises, listFranchises, updateFranchise } from '../../services/settings/franchise.services.js';

export const createFranchiseHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createFranchise({ body, user });

    res.send(appResponse('Franchise created successfully', response));
};

export const updateFranchiseHandler = async (req, res) => {
  const { body, user } = req;
  const idfranchise = req.params.id;

  const response = await updateFranchise({ body, user, idfranchise });

  res.send(appResponse('Franchise updated successfully', response));
};
export const listAllFranchisesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listFranchises(Number(page), Number(limit), search, order);

  res.send(appResponse('Franchises listed successfully', response));
};
export const listAllDeletedFranchisesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedFranchises(Number(page), Number(limit), search, order);

  res.send(appResponse('Franchises listed successfully', response));
};
export const getFranchiseHandler = async (req, res) => {
  const idfranchise = req.params.id;

  const response = await getFranchiseById(idfranchise);

  res.send(appResponse('Franchises fetched successfully', response));
};
export const deleteFranchiseHandler = async (req, res) => {
  const idfranchise = req.params.id;

  const response = await deleteFranchise({idfranchise});

  res.send(appResponse('Franchises deleted successfully', response));
};
