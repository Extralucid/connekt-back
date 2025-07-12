import appResponse from '../../../lib/appResponse.js';

import { createTopic, deleteTopic, getTopicById, listDeletedTopics, listTopics, updateTopic } from '../../services/forum/topic.services.js';


export const createTopicHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createTopic({ body, user });

    res.send(appResponse('Topic created successfully', response));
};

export const updateTopicHandler = async (req, res) => {
  const { body, user } = req;
  const idtopic = req.params.id;

  const response = await updateTopic({ body, user, idtopic });

  res.send(appResponse('Topic updated successfully', response));
};
export const listAllTopicsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listTopics(Number(page), Number(limit), search, order);

  res.send(appResponse('Topics listed successfully', response));
};
export const listAllDeletedTopicsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedTopics(Number(page), Number(limit), search, order);

  res.send(appResponse('Topics listed successfully', response));
};
export const getTopicHandler = async (req, res) => {
  const idtopic = req.params.id;

  const response = await getTopicById({idtopic});

  res.send(appResponse('Topics fetched successfully', response));
};
export const deleteTopicHandler = async (req, res) => {
  const idtopic = req.params.id;

  const response = await deleteTopic({idtopic});

  res.send(appResponse('Topics deleted successfully', response));
};