import appResponse from '../../../lib/appResponse.js';

import { createProfession, deleteProfession, getProfessionById, listDeletedProfessions, listProfessions, updateProfession } from '../../services/settings/profession.services.js';

export const createProfessionHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createProfession({ body, user });

    res.send(appResponse('Profession created successfully', response));
};

export const updateProfessionHandler = async (req, res) => {
  const { body, user } = req;
  const idprofession = req.params.id;

  const response = await updateProfession({ body, user, idprofession });

  res.send(appResponse('Profession updated successfully', response));
};
export const listAllProfessionsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listProfessions(Number(page), Number(limit), search, order);

  res.send(appResponse('Professions listed successfully', response));
};
export const listAllDeletedProfessionsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedProfessions(Number(page), Number(limit), search, order);

  res.send(appResponse('Professions listed successfully', response));
};
export const getProfessionHandler = async (req, res) => {
  const idprofession = req.params.id;

  const response = await getProfessionById(idprofession);

  res.send(appResponse('Professions fetched successfully', response));
};
export const deleteProfessionHandler = async (req, res) => {
  const idprofession = req.params.id;

  const response = await deleteProfession({idprofession});

  res.send(appResponse('Professions deleted successfully', response));
};
