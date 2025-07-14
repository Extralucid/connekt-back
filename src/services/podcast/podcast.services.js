import db from '../../db/connection.js';
import {
    BadRequestError,
    DuplicateError,
    NotFoundError
} from '../../../lib/appErrors.js';
import _ from "lodash";
import redisClient from '../../config/redis.js';

// soft delete tokens after usage.
export const deletePodcast = async ({ podcast_id }) => {

    const podcast = await db.podcast.findUnique({
        where: { podcast_id: podcast_id },
    }); // Utilise Prisma avec findUnique

    if (!podcast) {
        throw new NotFoundError('Cette podcast n\'existe pas!');
    }
    return db.podcast.update({
        where: {
            podcast_id: podcast_id,
        },
        data: {
            isDeleted: true
        }
    });
}

// Obtenir une podcast par ID
export async function getPodcastById({ podcast_id }) {
    try {
        const cacheKey = `cache:podcast:${podcast_id}`;
        const cachedPodcast = await redisClient.get(cacheKey);

        if (cachedPodcast) return JSON.parse(cachedPodcast);


        const podcast = await db.podcast.findUnique({
            where: { podcast_id: podcast_id },
            include: { episodes: true, author: true }
        }); // Utilise Prisma avec findUnique

        if (!podcast) {
            throw new NotFoundError('Cette podcast n\'existe pas!');
        }

        await redisClient.setEx(cacheKey, 60, JSON.stringify(podcast)); // Cache for 60s
        return podcast;
    } catch (err) {
        throw new BadRequestError(err.message);
    }
}


export const createPodcast = async ({ body, user }) => {
    try {
        const createdpodcast = await db.podcast.create({
            data: {
                ...body,
                authorId: user.id,
            },
        });
        return createdpodcast;
    } catch (err) {
        throw new BadRequestError(err.message)
    }
};

export const listPodcasts = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "title" : sort.id || "title";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const podcasts = await db.podcast.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { title: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: { author: true },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.podcast.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { title: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: podcasts,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const listDeletedPodcasts = async (page = 0,
    limit = 10,
    search = "",
    order = []) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "title" : sort.id || "title";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const podcasts = await db.podcast.findMany({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { title: { contains: search, mode: "insensitive" } } : {},
                ],
            },
            include: { author: true },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.podcast.count({
            where: {
                OR: [
                    { isDeleted: false },
                    search ? { title: { contains: search, mode: "insensitive" } } : {},
                ],
            },
        });

        return {
            data: podcasts,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

// Mettre à jour une podcast
export const updatePodcast = async ({ body, user, podcast_id }) => {
    try {

        const updatedpodcast = await db.podcast.update({
            where: { podcast_id }, // Utiliser l'ID pour le recherche
            data: body
        });
        if (!updatedpodcast) {
            throw new BadRequestError("podcast non trouvée");
        }

        // Clear cache for all podcast-related keys
        const cacheKeys = await redisClient.keys('cache:/api/v1/youth/stag/podcast*');
        if (cacheKeys.length) await redisClient.del(cacheKeys);
        return updatedpodcast;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de mettre le podcast à jour");
    }
}

export const addEpisode = async ({ body, podcastId }) => {
    try {

        const { title, audioUrl, description } = body;

        const episode = await db.episode.create({
            data: {
                title,
                description,
                audioUrl,
                duration: 0, // Use FFmpeg or metadata lib
                podcastId,
            },
        });

        return episode;


    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de creer une episode");
    }

};

// Stream episode audio 
export const getEpisodeStream = async ({ episodeId }) => {
    try {
        const episode = await db.episode.findUnique({ where: { id: episodeId }, include: { comments: true } });

        // Implement byte-range requests for streaming (e.g., using `express-static`)
        // res.setHeader('Content-Type', 'audio/mpeg');
        // res.sendFile(episode.audioUrl); // Or proxy from S3
        return episode;
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de retrouver une episode");
    }

};

// Track listens (anonymous or authenticated)
export const trackListen = async ({ episodeId, user }) => {
    try {
        await db.listen.create({
            data: {
                episodeId: episodeId,
                userId: user?.id, // Null if anonymous
            },
        });
        res.status(204).end();
    } catch (error) {
        console.log(error.message);

        throw new BadRequestError("Impossible de tracker une ecoute");
    }
};

//list podcast episodes
export const listPodcastEpisodes = async (page = 0,
    limit = 10,
    search = "",
    order = [], podcastId = null) => {
    try {
        const offset = Math.max(0, (page - 1) * limit);
        const sort = _.isEmpty(order) ? [] : JSON.parse(_.first(order));
        const orderKey = _.isEmpty(sort) ? "title" : sort.id || "title";
        const orderDirection = _.isEmpty(sort)
            ? "desc"
            : sort.desc
                ? "desc"
                : "asc";
        const episodes = await db.episode.findMany({
            where: {
                podcastId: podcastId
            },
            skip: Number(offset),
            take: Number(limit),
            orderBy: {
                [orderKey]: orderDirection,
            },
        });

        const countTotal = await db.episode.count({
            where: {
                podcastId: podcastId
            },
        });

        return {
            data: episodes,
            totalRow: countTotal,
            totalPage: Math.ceil(countTotal / limit),
        };

    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

///////podcast subscription
export const subscribeToPodcast = async ({ podcastId, userId }) => {
    try {

        // Toggle subscription
        const existing = await db.podcastSubscription.findUnique({
            where: { userId_podcastId: { userId, podcastId } },
        });

        if (existing) {
            await db.podcastSubscription.delete({
                where: { podsub_id: existing.podsub_id },
            });
            throw new DuplicateError(err.message)
        } else {
            const subscription = await db.podcastSubscription.create({
                data: { userId, podcastId },
            });
            return subscription;
        }
    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

//comments
export const addComment = async ({ body, episodeId, user }) => {
    try {
        const { content, parentId } = body;

        const comment = await db.podcastComment.create({
            data: {
                content,
                episodeId,
                userId: user.id,
                parentId: parentId || null, // Null if top-level comment
            },
            include: { user: true }, // Return author details
        });

        // Real-time update via Socket.io
        io.to(`episode:${episodeId}`).emit('new-comment', comment);

        return comment;
    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

export const getEpisodeComments = async ({ episodeId }) => {
    try {
        const comments = await db.podcastComment.findMany({
            where: { episodeId: episodeId, parentId: null }, // Only top-level
            include: {
                user: true,
                replies: { include: { user: true } }, // Nested replies
            },
            orderBy: { createdAt: 'desc' },
        });
        return comments;
    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

//transcription
export const addTranscript = async ({body, episodeId}) => {
    try {
        const { content, language } = body;

        const transcript = await db.transcript.create({
            data: { content, language, episodeId },
        });

        return transcript;
    } catch (err) {
        console.log(err);
        throw new BadRequestError(err.message)

    }
};

