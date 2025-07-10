import jwt from 'jsonwebtoken';
import { UnAuthorizedError } from '../../lib/appErrors.js';
import env from '../config/env.js';
import {
    findUserById
} from '../services/auth/user.services.js';

export const authentication = async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) throw new UnAuthorizedError('Missing token');

        const token = authorization.replace('Bearer ', '');

        const decoded = jwt.verify(token, env.jwt_access_secret);
        if (!decoded) throw new UnAuthorizedError('Invalid token, user is not authorized');

        const user = await findUserById(decoded.userId);

        if (!user) throw new UnAuthorizedError('User is not authorized');

       // if (user.isVerified === false) throw new UnAuthorizedError('Acct status is not active');

        req.user = user;
        req.token = token;

        next();
    } catch (err) {
        console.log(err.message);
        throw new UnAuthorizedError(err.message);
    }
};


