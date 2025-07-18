import db from '../db/connection.js';

import _ from "lodash";
import redisClient from '../../config/redis.js';


//When a new job is posted, check for matching alerts and send alerts
const matchingAlerts = await db.jobAlert.findMany({
  where: {
    OR: [
      { keywords: { hasSome: job.keywords } },
      { categories: { some: { id: { in: job.categoryIds } } } },
    ],
  },
});
//deleting 
await db.chatAuditLog.deleteMany({
  where: { createdAt: { lt: new Date(Date.now() - 90 * 86400000) } },
});