import appResponse from '../../../lib/appResponse.js';

import { createCotation, deleteCotation, getCotationById, listDeletedCotations, listCotations, updateCotation } from '../../services/cotations/cotation.services.js';


export const createCotationHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createCotation({ body, user });

    res.send(appResponse('Cotation created successfully', response));
};

export const updateCotationHandler = async (req, res) => {
  const { body, user } = req;
  const idcotation = req.params.id;

  const response = await updateCotation({ body, user, idcotation });

  res.send(appResponse('Cotation updated successfully', response));
};
export const listAllCotationsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listCotations(Number(page), Number(limit), search, order);

  res.send(appResponse('Cotations listed successfully', response));
};
export const listAllDeletedCotationsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedCotations(Number(page), Number(limit), search, order);

  res.send(appResponse('Cotations listed successfully', response));
};
export const getCotationHandler = async (req, res) => {
  const idcotation = req.params.id;

  const response = await getCotationById(idcotation);

  res.send(appResponse('Cotations fetched successfully', response));
};
export const deleteCotationHandler = async (req, res) => {
  const idcotation = req.params.id;

  const response = await deleteCotation({idcotation});

  res.send(appResponse('Cotations deleted successfully', response));
};