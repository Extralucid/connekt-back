import _ from "lodash";
import db from '../../db/connection.js';

const popularEpisodes = await db.episode.findMany({
  orderBy: { listens: { _count: 'desc' } },
  include: { _count: { select: { listens: true } } },
});