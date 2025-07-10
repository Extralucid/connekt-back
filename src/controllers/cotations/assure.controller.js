import appResponse from '../../../lib/appResponse.js';

import { createAssure, deleteAssure, getAssureById, listDeletedAssures, listAssures, updateAssure } from '../../services/cotations/assure.services.js';


export const createAssureHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createAssure({ body, user });

    res.send(appResponse('Assure created successfully', response));
};

export const updateAssureHandler = async (req, res) => {
  const { body, user } = req;
  const idassure = req.params.id;

  const response = await updateAssure({ body, user, idassure });

  res.send(appResponse('Assure updated successfully', response));
};
export const listAllAssuresHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listAssures(Number(page), Number(limit), search, order);

  res.send(appResponse('Assures listed successfully', response));
};
export const listAllDeletedAssuresHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedAssures(Number(page), Number(limit), search, order);

  res.send(appResponse('Assures listed successfully', response));
};
export const getAssureHandler = async (req, res) => {
  const idassure = req.params.id;

  const response = await getAssureById(idassure);

  res.send(appResponse('Assures fetched successfully', response));
};
export const deleteAssureHandler = async (req, res) => {
  const idassure = req.params.id;

  const response = await deleteAssure({idassure});

  res.send(appResponse('Assures deleted successfully', response));
};