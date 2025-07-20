import appResponse from '../../../lib/appResponse.js';

import { createTutorialCategory, deleteTutorialCategory, getTutorialCategoryById, listDeletedTutorialCategorys, listTutorialCategorys, updateTutorialCategory } from '../../services/tutorials/tutorialcategory.services.js';


export const createTutorialCategoryHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createTutorialCategory({ body, user });

    res.send(appResponse('TutorialCategory created successfully', response));
};

export const updateTutorialCategoryHandler = async (req, res) => {
  const { body, user } = req;
  const tutcat_id = req.params.id;

  const response = await updateTutorialCategory({ body, user, tutcat_id });

  res.send(appResponse('TutorialCategory updated successfully', response));
};
export const listAllTutorialCategorysHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listTutorialCategorys(Number(page), Number(limit), search, order);

  res.send(appResponse('TutorialCategorys listed successfully', response));
};
export const listAllDeletedTutorialCategorysHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedTutorialCategorys(Number(page), Number(limit), search, order);

  res.send(appResponse('TutorialCategorys listed successfully', response));
};
export const getTutorialCategoryHandler = async (req, res) => {
  const tutcat_id = req.params.id;

  const response = await getTutorialCategoryById({tutcat_id});

  res.send(appResponse('TutorialCategorys fetched successfully', response));
};
export const deleteTutorialCategoryHandler = async (req, res) => {
  const tutcat_id = req.params.id;

  const response = await deleteTutorialCategory({tutcat_id});

  res.send(appResponse('TutorialCategorys deleted successfully', response));
};