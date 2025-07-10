import appResponse from '../../../lib/appResponse.js';

import { createModele, createModeleData, deleteModele, getModeleById, listDeletedModeles, listModeles, updateModele, updateModeleData } from '../../services/settings/modele.services.js';

export const createModeleHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createModele({ body, user });

    res.send(appResponse('Modele created successfully', response));
};

export const updateModeleHandler = async (req, res) => {
  const { body, user } = req;
  const idmodele = req.params.id;

  const response = await updateModele({ body, user, idmodele });

  res.send(appResponse('Modele updated successfully', response));
};
export const listAllModelesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listModeles(Number(page), Number(limit), search, order);

  res.send(appResponse('Modeles listed successfully', response));
};
export const listAllDeletedModelesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedModeles(Number(page), Number(limit), search, order);

  res.send(appResponse('Modeles listed successfully', response));
};
export const getModeleHandler = async (req, res) => {
  const idmodele = req.params.id;

  const response = await getModeleById(idmodele);

  res.send(appResponse('Modeles fetched successfully', response));
};
export const getCreateModeleDataHandler = async (req, res) => {

  const response = await createModeleData();

  res.send(appResponse('data fetched successfully', response));
};

export const getUpdateModeleDataHandler = async (req, res) => {

  const response = await updateModeleData({idmodele});

  res.send(appResponse('data fetched successfully', response));
};
export const deleteModeleHandler = async (req, res) => {
  const idmodele = req.params.id;

  const response = await deleteModele({idmodele});

  res.send(appResponse('Modeles deleted successfully', response));
};
