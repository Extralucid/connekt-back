

import  jwt from 'jsonwebtoken';
import env from '../config/env.js';

// Usually I keep the token between 5 minutes - 15 minutes
export function generateAccessToken(user) {
  return jwt.sign({ userId: user.id }, env.jwt_access_secret, {
    expiresIn: '30m',
  });
}

// I choosed 8h because i prefer to make the user login again each day.
// But keep him logged in if he is using the app.
// You can change this value depending on your app logic.
// I would go for a maximum of 7 days, and make him login again after 7 days of inactivity.
export function generateRefreshToken(user, jti) {
  return jwt.sign({
    userId: user.id,
    jti
  }, env.jwt_refresh_secret, {
    expiresIn: '8h',
  });
}

export function generateTokens(user, jti) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return {
    accessToken,
    refreshToken,
  };
}



