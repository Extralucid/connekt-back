

import crypto  from'crypto';

export function hashToken(token) {
  return crypto.createHash('sha512').update(token).digest('hex');
}





