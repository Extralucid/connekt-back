import appResponse from '../../../lib/appResponse.js';

import { createPrestataire, deletePrestataire, getPrestataireById, listDeletedPrestataires, listPrestataires, updatePrestataire } from '../../services/cotations/prestataire.services.js';


export const createPrestataireHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createPrestataire({ body, user });

    res.send(appResponse('Prestataire created successfully', response));
};

export const updatePrestataireHandler = async (req, res) => {
  const { body, user } = req;
  const idprestataire = req.params.id;

  const response = await updatePrestataire({ body, user, idprestataire });

  res.send(appResponse('Prestataire updated successfully', response));
};
export const listAllPrestatairesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listPrestataires(Number(page), Number(limit), search, order);

  res.send(appResponse('Prestataires listed successfully', response));
};
export const listAllDeletedPrestatairesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedPrestataires(Number(page), Number(limit), search, order);

  res.send(appResponse('Prestataires listed successfully', response));
};
export const getPrestataireHandler = async (req, res) => {
  const idprestataire = req.params.id;

  const response = await getPrestataireById(idprestataire);

  res.send(appResponse('Prestataires fetched successfully', response));
};
export const deletePrestataireHandler = async (req, res) => {
  const idprestataire = req.params.id;

  const response = await deletePrestataire({idprestataire});

  res.send(appResponse('Prestataires deleted successfully', response));
};