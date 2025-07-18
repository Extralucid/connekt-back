import appResponse from '../../../lib/appResponse.js';

import { createBook, deleteBook, getBookById, listDeletedBooks, listBooks, updateBook, listRecommendedBooks, trackReadingProgress } from '../../services/books/book.services.js';


export const createBookHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createBook({ body, user });

    res.send(appResponse('Book created successfully', response));
};

export const trackBookReadingProgressHandler = async (req, res) => {
    const userId  = req.user.id;
    const { bookId, currentPage } = req.body;

    const response = await trackReadingProgress({ bookId, userId, currentPage });

    res.send(appResponse('Book track created successfully', response));
};

export const updateBookHandler = async (req, res) => {
  const { body, user } = req;
  const book_id = req.params.id;

  const response = await updateBook({ body, user, book_id });

  res.send(appResponse('Book updated successfully', response));
};
export const listAllBooksHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listBooks(Number(page), Number(limit), search, order);

  res.send(appResponse('Books listed successfully', response));
};
export const listRecommendedBooksHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;
  const user  = req.user;

  const response = await listRecommendedBooks(Number(page), Number(limit), search, order, user);

  res.send(appResponse('Books listed successfully', response));
};
export const listAllDeletedBooksHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedBooks(Number(page), Number(limit), search, order);

  res.send(appResponse('Books listed successfully', response));
};
export const getBookHandler = async (req, res) => {
  const book_id = req.params.id;

  const response = await getBookById({book_id});

  res.send(appResponse('Books fetched successfully', response));
};
export const deleteBookHandler = async (req, res) => {
  const book_id = req.params.id;

  const response = await deleteBook({book_id});

  res.send(appResponse('Books deleted successfully', response));
};