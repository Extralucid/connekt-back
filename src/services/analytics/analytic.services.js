import _ from "lodash";
import db from '../../db/connection.js';



// Obtenir les episodes populaires
export async function getPopularEpisodes() {
  try {
    const popularEpisodes = await db.episode.findMany({
      orderBy: { listens: { _count: 'desc' } },
      include: { _count: { select: { listens: true } } },
    });

    return popularEpisodes;
  } catch (err) {
    throw new BadRequestError(err.message);
  }
}

// Obtenir les episodes populaires
export async function getDashboardData() {
  try {
    const userCount = await db.user.count({
      where: {
        role: 'USER'
      },
    });
    const moderateurCount = await db.user.count({
      where: {
        role: 'MODERATOR'
      },
    });
    const employerCount = await db.user.count({
      where: {
        role: 'EMPLOYER'
      },
    });
    const podcastCount = await db.podcast.count({
      where: {
        isDeleted: false
      },
    });
     const closedPodcastCount = await db.podcast.count({
      where: {
        isDeleted: true
      },
    });
     const tutorialCount = await db.tutorial.count({
      where: {
        isDeleted: false
      },
    });
    const closedTutorialCount = await db.tutorial.count({
      where: {
        isDeleted: true
      },
    });
    const jobCount = await db.job.count();

    return {
      podcastCount: podcastCount,
      closedPodcastCount: closedPodcastCount,
      tutorialCount: tutorialCount,
      closedTutorialCount: closedTutorialCount,
      jobCount: jobCount,
      moderateurCount: moderateurCount,
      userCount: userCount,
      employerCount: employerCount
    };
  } catch (err) {
    throw new BadRequestError(err.message);
  }
}