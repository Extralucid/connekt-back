import appResponse from '../../../lib/appResponse.js';

import { createTutorial, deleteTutorial, getTutorialById, listDeletedTutorials, listRecommendedTutorials, listTutorials, updateTutorial } from '../../services/tutorials/tutorial.services.js';


export const createTutorialHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createTutorial({ body, user });

    res.send(appResponse('Tutorial created successfully', response));
};

export const updateTutorialHandler = async (req, res) => {
  const { body, user } = req;
  const tutorial_id = req.params.id;

  const response = await updateTutorial({ body, user, tutorial_id });

  res.send(appResponse('Tutorial updated successfully', response));
};
export const listAllTutorialsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listTutorials(Number(page), Number(limit), search, order);

  res.send(appResponse('Tutorials listed successfully', response));
};
export const listRecommendedTutorialsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;
  const user  = req.user;

  const response = await listRecommendedTutorials(Number(page), Number(limit), search, order, user);

  res.send(appResponse('Tutorials listed successfully', response));
};
export const listAllDeletedTutorialsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedTutorials(Number(page), Number(limit), search, order);

  res.send(appResponse('Tutorials listed successfully', response));
};
export const getTutorialHandler = async (req, res) => {
  const tutorial_id = req.params.id;

  const response = await getTutorialById({tutorial_id});

  res.send(appResponse('Tutorials fetched successfully', response));
};
export const deleteTutorialHandler = async (req, res) => {
  const tutorial_id = req.params.id;

  const response = await deleteTutorial({tutorial_id});

  res.send(appResponse('Tutorials deleted successfully', response));
};