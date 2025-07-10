import appResponse from '../../../lib/appResponse.js';

import { createEnergie, deleteEnergie, getEnergieById, listDeletedEnergies, listEnergies, updateEnergie } from '../../services/settings/energie.services.js';

export const createEnergieHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createEnergie({ body, user });

    res.send(appResponse('Energie created successfully', response));
};

export const updateEnergieHandler = async (req, res) => {
  const { body, user } = req;
  const idenergie = req.params.id;

  const response = await updateEnergie({ body, user, idenergie });

  res.send(appResponse('Energie updated successfully', response));
};
export const listAllEnergiesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listEnergies(Number(page), Number(limit), search, order);

  res.send(appResponse('Energies listed successfully', response));
};
export const listAllDeletedEnergiesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedEnergies(Number(page), Number(limit), search, order);

  res.send(appResponse('Energies listed successfully', response));
};
export const getEnergieHandler = async (req, res) => {
  const idenergie = req.params.id;

  const response = await getEnergieById(idenergie);

  res.send(appResponse('Energies fetched successfully', response));
};
export const deleteEnergieHandler = async (req, res) => {
  const idenergie = req.params.id;

  const response = await deleteEnergie({idenergie});

  res.send(appResponse('Energies deleted successfully', response));
};
