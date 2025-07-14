import appResponse from '../../../lib/appResponse.js';

import { createApplication, deleteApplication, getApplicationById, listDeletedApplications, listApplications, updateApplication } from '../../services/jobs/application.services.js';


export const createApplicationHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createApplication({ body, user });

    res.send(appResponse('Application created successfully', response));
};

export const updateApplicationHandler = async (req, res) => {
  const { body, user } = req;
  const idapplication = req.params.id;

  const response = await updateApplication({ body, user, idapplication });

  res.send(appResponse('Application updated successfully', response));
};
export const listAllApplicationsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listApplications(Number(page), Number(limit), search, order);

  res.send(appResponse('Applications listed successfully', response));
};
export const listAllDeletedApplicationsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedApplications(Number(page), Number(limit), search, order);

  res.send(appResponse('Applications listed successfully', response));
};
export const getApplicationHandler = async (req, res) => {
  const idapplication = req.params.id;

  const response = await getApplicationById({idapplication});

  res.send(appResponse('Applications fetched successfully', response));
};
export const deleteApplicationHandler = async (req, res) => {
  const idapplication = req.params.id;

  const response = await deleteApplication({idapplication});

  res.send(appResponse('Applications deleted successfully', response));
};