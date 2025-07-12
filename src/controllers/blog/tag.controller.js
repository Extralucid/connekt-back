import appResponse from '../../../lib/appResponse.js';

import { createTag, deleteTag, getTagById, listDeletedTags, listTags, updateTag } from '../../services/blog/tag.services.js';


export const createTagHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createTag({ body, user });

    res.send(appResponse('Tag created successfully', response));
};

export const updateTagHandler = async (req, res) => {
  const { body, user } = req;
  const idtag = req.params.id;

  const response = await updateTag({ body, user, idtag });

  res.send(appResponse('Tag updated successfully', response));
};
export const listAllTagsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listTags(Number(page), Number(limit), search, order);

  res.send(appResponse('Tags listed successfully', response));
};
export const listAllDeletedTagsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedTags(Number(page), Number(limit), search, order);

  res.send(appResponse('Tags listed successfully', response));
};
export const getTagHandler = async (req, res) => {
  const idtag = req.params.id;

  const response = await getTagById({idtag});

  res.send(appResponse('Tags fetched successfully', response));
};
export const deleteTagHandler = async (req, res) => {
  const idtag = req.params.id;

  const response = await deleteTag({idtag});

  res.send(appResponse('Tags deleted successfully', response));
};