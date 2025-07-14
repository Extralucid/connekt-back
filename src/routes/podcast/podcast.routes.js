import router from 'express';
import { createPodcastHandler, deletePodcastHandler, trackListenHandler, getPodcastHandler, createPodcastEpisodeHandler, getPodcastEpisodeHandler, listAllDeletedPodcastsHandler, listAllPodcastsHandler, updatePodcastHandler, listAllPodcastEpisodesHandler, getEpisodeCommentsHandler, podcastSubcriptionHandler, addCommentHandler, addTranscriptHandler } from '../../controllers/podcast/podcast.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { cache } from '../../middlewares/cacheMiddleware.js';

const podcastRoutes = router.Router();

const podcastRoute = () => {
    podcastRoutes.post(
        '/create-new-podcast',
        authentication,
        createPodcastHandler
    );
    podcastRoutes.put(
        '/update-podcast/:id',
        authentication,
        updatePodcastHandler
    );
    podcastRoutes.get(
        '/list-all-podcasts',
        authentication,
        cache(60),
        listAllPodcastsHandler
    );
    podcastRoutes.get(
        '/list-deleted-podcasts',
        authentication,
        cache(60),
        listAllDeletedPodcastsHandler
    );
    podcastRoutes.get(
        '/get-podcast/:id',
        authentication,
        getPodcastHandler
    );
    podcastRoutes.get(
        '/delete-podcast/:id',
        authentication,
        deletePodcastHandler
    );

    // Episodes
    podcastRoutes.post('/:podcastId/episodes', authentication, createPodcastEpisodeHandler);
    podcastRoutes.get('/:podcastId/episodes', authentication, listAllPodcastEpisodesHandler);
    podcastRoutes.get('/episodes/:episodeId/stream', authentication, getPodcastEpisodeHandler);
    podcastRoutes.post('/episodes/:episodeId/listens', authentication, trackListenHandler); // No auth for anonymous tracking

    // Subscriptions
    podcastRoutes.post('/podcasts/:podcastId/subscribe', authentication, podcastSubcriptionHandler);

    // Comments
    podcastRoutes.get('/episodes/:episodeId/comments', getEpisodeCommentsHandler);
    podcastRoutes.post('/episodes/:episodeId/comments', authentication, addCommentHandler);

    // Transcripts
    podcastRoutes.post('/episodes/:episodeId/transcript', authentication, addTranscriptHandler);

    return podcastRoutes;
};

export default podcastRoute;
