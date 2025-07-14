import appResponse from '../../../lib/appResponse.js';

import { createCategorie, deleteCategorie, getCategorieById, listDeletedCategories, listCategories, updateCategorie } from '../../services/jobs/categorie.services.js';


export const createCategorieHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createCategorie({ body, user });

    res.send(appResponse('Categorie created successfully', response));
};

export const updateCategorieHandler = async (req, res) => {
  const { body, user } = req;
  const idcategorie = req.params.id;

  const response = await updateCategorie({ body, user, idcategorie });

  res.send(appResponse('Categorie updated successfully', response));
};
export const listAllCategoriesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listCategories(Number(page), Number(limit), search, order);

  res.send(appResponse('Categories listed successfully', response));
};
export const listAllDeletedCategoriesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedCategories(Number(page), Number(limit), search, order);

  res.send(appResponse('Categories listed successfully', response));
};
export const getCategorieHandler = async (req, res) => {
  const idcategorie = req.params.id;

  const response = await getCategorieById({idcategorie});

  res.send(appResponse('Categories fetched successfully', response));
};
export const deleteCategorieHandler = async (req, res) => {
  const idcategorie = req.params.id;

  const response = await deleteCategorie({idcategorie});

  res.send(appResponse('Categories deleted successfully', response));
};