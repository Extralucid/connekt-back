import appResponse from '../../../lib/appResponse.js';

import { createPost, deletePost, getPostById, listDeletedPosts, listPosts, updatePost } from '../../services/blog/post.services.js';


export const createPostHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createPost({ body, user });

    res.send(appResponse('Post created successfully', response));
};

export const updatePostHandler = async (req, res) => {
  const { body, user } = req;
  const idpost = req.params.id;

  const response = await updatePost({ body, user, idpost });

  res.send(appResponse('Post updated successfully', response));
};
export const listAllPostsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listPosts(Number(page), Number(limit), search, order);

  res.send(appResponse('Posts listed successfully', response));
};
export const listAllDeletedPostsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedPosts(Number(page), Number(limit), search, order);

  res.send(appResponse('Posts listed successfully', response));
};
export const getPostHandler = async (req, res) => {
  const idpost = req.params.id;

  const response = await getPostById({idpost});

  res.send(appResponse('Posts fetched successfully', response));
};
export const deletePostHandler = async (req, res) => {
  const idpost = req.params.id;

  const response = await deletePost({idpost});

  res.send(appResponse('Posts deleted successfully', response));
};