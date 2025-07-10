import 'dotenv/config';

export default {
  port: process.env.PORT || 4000,
  db_uri: process.env.DATABASE_URL,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  live_uri: process.env.LIVE_URI,
  node_env: process.env.NODE_ENV
};
