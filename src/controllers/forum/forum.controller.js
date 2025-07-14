import appResponse from '../../../lib/appResponse.js';

import { createForum, deleteForum, getForumById, listDeletedForums, listForums, updateForum } from '../../services/forum/forum.services.js';


export const createForumHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createForum({ body, user });

    res.send(appResponse('Forum created successfully', response));
};

export const updateForumHandler = async (req, res) => {
  const { body, user } = req;
  const idforum = req.params.id;

  const response = await updateForum({ body, user, idforum });

  res.send(appResponse('Forum updated successfully', response));
};
export const listAllForumsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listForums(Number(page), Number(limit), search, order);

  res.send(appResponse('Forums listed successfully', response));
};
export const listAllDeletedForumsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedForums(Number(page), Number(limit), search, order);

  res.send(appResponse('Forums listed successfully', response));
};
export const getForumHandler = async (req, res) => {
  const idforum = req.params.id;

  const response = await getForumById({idforum});

  res.send(appResponse('Forums fetched successfully', response));
};
export const deleteForumHandler = async (req, res) => {
  const idforum = req.params.id;

  const response = await deleteForum({idforum});

  res.send(appResponse('Forums deleted successfully', response));
};