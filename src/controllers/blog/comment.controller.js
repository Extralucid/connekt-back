import appResponse from '../../../lib/appResponse.js';

import { createComment, deleteComment, getCommentById, listDeletedComments, listComments, updateComment } from '../../services/blog/comment.services.js';


export const createCommentHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createComment({ body, user });

    res.send(appResponse('Comment created successfully', response));
};

export const updateCommentHandler = async (req, res) => {
  const { body, user } = req;
  const idcomment = req.params.id;

  const response = await updateComment({ body, user, idcomment });

  res.send(appResponse('Comment updated successfully', response));
};
export const listAllCommentsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listComments(Number(page), Number(limit), search, order);

  res.send(appResponse('Comments listed successfully', response));
};
export const listAllDeletedCommentsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedComments(Number(page), Number(limit), search, order);

  res.send(appResponse('Comments listed successfully', response));
};
export const getCommentHandler = async (req, res) => {
  const idcomment = req.params.id;

  const response = await getCommentById({idcomment});

  res.send(appResponse('Comments fetched successfully', response));
};
export const deleteCommentHandler = async (req, res) => {
  const idcomment = req.params.id;

  const response = await deleteComment({idcomment});

  res.send(appResponse('Comments deleted successfully', response));
};