import appResponse from '../../../lib/appResponse.js';

import { createPack, createPackData, deletePack, getPackById, listDeletedPacks, listPacks, updatePack, updatePackData } from '../../services/settings/pack.services.js';

export const createPackHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createPack({ body, user });

    res.send(appResponse('Pack created successfully', response));
};

export const getCreatePackDataHandler = async (req, res) => {

  const response = await createPackData();

  res.send(appResponse('data fetched successfully', response));
};

export const getUpdatePackDataHandler = async (req, res) => {

  const response = await updatePackData({idpack});

  res.send(appResponse('data fetched successfully', response));
};

export const updatePackHandler = async (req, res) => {
  const { body, user } = req;
  const idpack = req.params.id;

  const response = await updatePack({ body, user, idpack });

  res.send(appResponse('Pack updated successfully', response));
};
export const listAllPacksHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listPacks(Number(page), Number(limit), search, order);

  res.send(appResponse('Packs listed successfully', response));
};
export const listAllDeletedPacksHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedPacks(Number(page), Number(limit), search, order);

  res.send(appResponse('Packs listed successfully', response));
};
export const getPackHandler = async (req, res) => {
  const idpack = req.params.id;

  const response = await getPackById(idpack);

  res.send(appResponse('Packs fetched successfully', response));
};
export const deletePackHandler = async (req, res) => {
  const idpack = req.params.id;

  const response = await deletePack({idpack});

  res.send(appResponse('Packs deleted successfully', response));
};
