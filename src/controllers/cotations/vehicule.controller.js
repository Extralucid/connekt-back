import appResponse from '../../../lib/appResponse.js';

import { createVehicule, deleteVehicule, getVehiculeById, listDeletedVehicules, listVehicules, updateVehicule } from '../../services/cotations/vehicule.services.js';


export const createVehiculeHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createVehicule({ body, user });

    res.send(appResponse('Vehicule created successfully', response));
};

export const updateVehiculeHandler = async (req, res) => {
  const { body, user } = req;
  const idvehicule = req.params.id;

  const response = await updateVehicule({ body, user, idvehicule });

  res.send(appResponse('Vehicule updated successfully', response));
};
export const listAllVehiculesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listVehicules(Number(page), Number(limit), search, order);

  res.send(appResponse('Vehicules listed successfully', response));
};
export const listAllDeletedVehiculesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedVehicules(Number(page), Number(limit), search, order);

  res.send(appResponse('Vehicules listed successfully', response));
};
export const getVehiculeHandler = async (req, res) => {
  const idvehicule = req.params.id;

  const response = await getVehiculeById(idvehicule);

  res.send(appResponse('Vehicules fetched successfully', response));
};
export const deleteVehiculeHandler = async (req, res) => {
  const idvehicule = req.params.id;

  const response = await deleteVehicule({idvehicule});

  res.send(appResponse('Vehicules deleted successfully', response));
};