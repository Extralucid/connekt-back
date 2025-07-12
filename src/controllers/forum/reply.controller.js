import appResponse from '../../../lib/appResponse.js';

import { createReply, deleteReply, getReplyById, listDeletedReplys, listReplys, updateReply } from '../../services/forum/reply.services.js';


export const createReplyHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createReply({ body, user });

    res.send(appResponse('Reply created successfully', response));
};

export const updateReplyHandler = async (req, res) => {
  const { body, user } = req;
  const idreply = req.params.id;

  const response = await updateReply({ body, user, idreply });

  res.send(appResponse('Reply updated successfully', response));
};
export const listAllReplysHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listReplys(Number(page), Number(limit), search, order);

  res.send(appResponse('Replys listed successfully', response));
};
export const listAllDeletedReplysHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedReplys(Number(page), Number(limit), search, order);

  res.send(appResponse('Replys listed successfully', response));
};
export const getReplyHandler = async (req, res) => {
  const idreply = req.params.id;

  const response = await getReplyById({idreply});

  res.send(appResponse('Replys fetched successfully', response));
};
export const deleteReplyHandler = async (req, res) => {
  const idreply = req.params.id;

  const response = await deleteReply({idreply});

  res.send(appResponse('Replys deleted successfully', response));
};