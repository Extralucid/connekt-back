import appResponse from '../../../lib/appResponse.js';

import { createBookCategory, deleteBookCategory, getBookCategoryById, listDeletedBookCategorys, listBookCategorys, updateBookCategory } from '../../services/books/bookcategory.services.js';


export const createBookCategoryHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createBookCategory({ body, user });

    res.send(appResponse('BookCategory created successfully', response));
};

export const updateBookCategoryHandler = async (req, res) => {
  const { body, user } = req;
  const bookcat_id = req.params.id;

  const response = await updateBookCategory({ body, user, bookcat_id });

  res.send(appResponse('BookCategory updated successfully', response));
};
export const listAllBookCategorysHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listBookCategorys(Number(page), Number(limit), search, order);

  res.send(appResponse('BookCategorys listed successfully', response));
};
export const listAllDeletedBookCategorysHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedBookCategorys(Number(page), Number(limit), search, order);

  res.send(appResponse('BookCategorys listed successfully', response));
};
export const getBookCategoryHandler = async (req, res) => {
  const bookcat_id = req.params.id;

  const response = await getBookCategoryById({bookcat_id});

  res.send(appResponse('BookCategorys fetched successfully', response));
};
export const deleteBookCategoryHandler = async (req, res) => {
  const bookcat_id = req.params.id;

  const response = await deleteBookCategory({bookcat_id});

  res.send(appResponse('BookCategorys deleted successfully', response));
};