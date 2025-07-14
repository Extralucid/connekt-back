import appResponse from '../../../lib/appResponse.js';

import { addComment, addEpisode, addTranscript, createPodcast, deletePodcast, getEpisodeComments, getEpisodeStream, getPodcastById, listDeletedPodcasts, listPodcastEpisodes, listPodcasts, subscribeToPodcast, updatePodcast } from '../../services/podcast/podcast.services.js';


export const createPodcastHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createPodcast({ body, user });

    res.send(appResponse('Podcast created successfully', response));
};

export const updatePodcastHandler = async (req, res) => {
  const { body, user } = req;
  const idpodcast = req.params.id;

  const response = await updatePodcast({ body, user, idpodcast });

  res.send(appResponse('Podcast updated successfully', response));
};
export const listAllPodcastsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listPodcasts(Number(page), Number(limit), search, order);

  res.send(appResponse('Podcasts listed successfully', response));
};
export const listAllDeletedPodcastsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedPodcasts(Number(page), Number(limit), search, order);

  res.send(appResponse('Podcasts listed successfully', response));
};
export const getPodcastHandler = async (req, res) => {
  const idpodcast = req.params.id;

  const response = await getPodcastById({idpodcast});

  res.send(appResponse('Podcasts fetched successfully', response));
};
export const deletePodcastHandler = async (req, res) => {
  const idpodcast = req.params.id;

  const response = await deletePodcast({idpodcast});

  res.send(appResponse('Podcasts deleted successfully', response));
};

//////////episodes features
export const createPodcastEpisodeHandler = async (req, res) => {
    const { body, user } = req;
    const podcastId = req.params.podcastId;

    const response = await addEpisode({ body, podcastId });

    res.send(appResponse('Podcast episode created successfully', response));
};

export const getPodcastEpisodeHandler = async (req, res) => {
  const episodeId = req.params.episodeId;

  const response = await getEpisodeStream({episodeId});

  res.send(appResponse('Podcast Episode fetched successfully', response));
};

export const trackListenHandler = async (req, res) => {
    const {  user } = req;
    const episodeId = req.params.episodeId;

    const response = await addEpisode({ episodeId, user });

    res.send(appResponse('Podcast episode tracked successfully', response));
};

export const listAllPodcastEpisodesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;
  const podcastId = req.params.podcastId;

  const response = await listPodcastEpisodes(Number(page), Number(limit), search, order, podcastId);

  res.send(appResponse('Podcast episodes listed successfully', response));
};

export const getEpisodeCommentsHandler = async (req, res) => {
  const episodeId = req.params.episodeId;

  const response = await getEpisodeComments({episodeId});

  res.send(appResponse('Episode comments fetched successfully', response));
};

export const podcastSubcriptionHandler = async (req, res) => {
    const userId = req.user?.id;
    const podcastId = req.params.podcastId;

    const response = await subscribeToPodcast({ podcastId, userId });

    res.send(appResponse('Podcast episode subscribed successfully', response));
};

export const addCommentHandler = async (req, res) => {
    const { body, user } = req;
    const episodeId = req.params.episodeId;

    const response = await addComment({ body, user, episodeId  });

    res.send(appResponse('Podcast episode subscribed successfully', response));
};

export const addTranscriptHandler = async (req, res) => {
    const { body, user } = req;
    const episodeId = req.params.episodeId;

    const response = await addTranscript({ body, episodeId  });

    res.send(appResponse('Podcast transcript added successfully', response));
};