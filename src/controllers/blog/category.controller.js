import appResponse from '../../../lib/appResponse.js';

import { createCategory, deleteCategory, getCategoryById, listDeletedCategorys, listCategorys, updateCategory } from '../../services/blog/category.services.js';


export const createCategoryHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createCategory({ body, user });

    res.send(appResponse('Category created successfully', response));
};

export const updateCategoryHandler = async (req, res) => {
  const { body, user } = req;
  const idcategory = req.params.id;

  const response = await updateCategory({ body, user, idcategory });

  res.send(appResponse('Category updated successfully', response));
};
export const listAllCategorysHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listCategorys(Number(page), Number(limit), search, order);

  res.send(appResponse('Categorys listed successfully', response));
};
export const listAllDeletedCategorysHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedCategorys(Number(page), Number(limit), search, order);

  res.send(appResponse('Categorys listed successfully', response));
};
export const getCategoryHandler = async (req, res) => {
  const idcategory = req.params.id;

  const response = await getCategoryById({idcategory});

  res.send(appResponse('Categorys fetched successfully', response));
};
export const deleteCategoryHandler = async (req, res) => {
  const idcategory = req.params.id;

  const response = await deleteCategory({idcategory});

  res.send(appResponse('Categorys deleted successfully', response));
};