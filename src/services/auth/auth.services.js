import { BadRequestError } from '../../../lib/appErrors.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { generateTokens } from '../../utils/jwt.js';
import db from '../../db/connection.js';
import { codeGenerator } from '../../utils/codeGenerator.js';
import { hashToken } from '../../utils/hashToken.js';

// used when we create a refresh token.
const addRefreshTokenToWhitelist = async ({ jti, refreshToken, userId }) => {
    return db.refreshToken.create({
        data: {
            id: jti,
            hashedToken: hashToken(refreshToken),
            userId
        },
    });

}

export const getUserProfileData = async (userId) => {
    let userData = await db.user.findUnique({
        where: {
            id: userId
        },
        include: {
            Prestataire: true
        }
    });
    delete userData.password;
    return userData;

}
function findUserByEmail(email) {
    return db.user.findFirst({
        where: {
            OR: [
                { email: email },
                { phone: email }
            ],
        },
    });
}


function findUserById(id) {
    return db.user.findUnique({
        where: {
            id,
        },
    });
}


// used to check if the token sent by the client is in the database.
export const findRefreshTokenById = async ({ id }) => {
    return db.refreshToken.findUnique({
        where: {
            id,
        },
    });
}

// soft delete tokens after usage.
export const deleteRefreshToken = async ({ id }) => {
    return db.refreshToken.update({
        where: {
            id,
        },
        data: {
            revoked: true
        }
    });
}

export const revokeTokens = async ({ userId }) => {
    return db.refreshToken.updateMany({
        where: {
            userId
        },
        data: {
            revoked: true
        }
    });
}

export const refreshToken = async ({ body }) => {
    try {
        const { refreshToken } = body;
        if (!refreshToken) {
            throw new BadRequestError('Missing refresh token.');
        }
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const savedRefreshToken = await findRefreshTokenById(payload.jti);

        if (!savedRefreshToken || savedRefreshToken.revoked === true) {
            throw new BadRequestError('Unauthorized');
        }

        const hashedToken = hashToken(refreshToken);
        if (hashedToken !== savedRefreshToken.hashedToken) {
            throw new BadRequestError('Unauthorized');
        }

        const user = await findUserById(payload.userId);
        if (!user) {
            throw new BadRequestError('Unauthorized');
        }

        await deleteRefreshToken(savedRefreshToken.id);
        const jti = uuidv4();
        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, jti);
        await addRefreshTokenToWhitelist({ jti, refreshToken: newRefreshToken, userId: user.id });

        return {
            accessToken,
            refreshToken: newRefreshToken
        };
    } catch (err) {
        throw new BadRequestError('Une erreur s\'est produite');
    }
};

// This endpoint is only for demo purpose.
// Move this logic where you need to revoke the tokens( for ex, on password reset)
export const revokeToken = async ({ body }) => {
    try {
        const { userId } = body.userId;
        await revokeTokens(userId);
        return { message: `Tokens revoked for user with id #${userId}` };
    } catch (err) {
        next(err);
    }
};

export const signUpMemberAuthentication = async ({ body }) => {
    try {
        console.log(body);

        if (!body.email || !body.password) {
            throw new BadRequestError('You must provide an email and a password.');
        }

        const existingUser = await findUserByEmail(body.email);

        if (existingUser) {
            throw new BadRequestError('Email already in use.');
        }
        const ressource = await findRessourceByCode('ADMIN');
        const user = await db.user.create({
            data: {
                email: body.email,
                phone: body.phone,
                password: await bcrypt.hash(body.password, 12),
                codeuser: `USR-${await codeGenerator(10, 'ABCDEFGHIJKLMN1234567890')}`,
                unom: body.unom,
                uprenom: body.uprenom,
                avatar: body.avatar,
                ressourceId: ressource.idressource,
                isDeleted: false,
            }
        });
        const jti = uuidv4();
        const { accessToken, refreshToken } = generateTokens(user, jti);
        await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });
        delete user.password;
        return {
            user,
            accessToken,
            refreshToken,
        };
    } catch (err) {
        //console.log(err);
        throw new BadRequestError(err.message);
    }
};

// service
export const savePreferences = async ({ body, user }) => {
    const { bookCategories, tutorialTopics, jobCategories, blogCategories, language, notifyNewContent } = body;
    const userId = user.id;

    // Create or update preferences
    await db.userPreference.upsert({
        where: { userId },
        create: {
            userId,
            language,
            notifyNewContent,
            bookCategories: { connect: bookCategories.map(id => ({ id })) },
            tutorialTopics: { connect: tutorialTopics.map(id => ({  id })) },
            jobCategories: { connect: jobCategories.map(id => ({ id })) },
            blogCategories: { connect: blogCategories.map(id => ({  id })) },
        },
        update: {
            language,
            notifyNewContent,
            bookCategories: { set: bookCategories.map(id => ({ id })) },
            tutorialTopics: { set: tutorialTopics.map(id => ({  id })) },
            jobCategories: { connect: jobCategories.map(id => ({  id })) },
            blogCategories: { connect: blogCategories.map(id => ({ id })) },
        },
    });

    res.status(200).json({ success: true });
};


export const signInMemberAuthentication = async ({ body }) => {
    try {
        const { email, password } = body;
        if (!email || !password) {
            throw new BadRequestError('You must provide an email and a password.');
        }

        const existingUser = await findUserByEmail(email);

        if (!existingUser) {
            throw new BadRequestError('Invalid login credentials.');
        }

        const validPassword = await bcrypt.compare(password, existingUser.password);
        if (!validPassword) {
            throw new BadRequestError('Invalid login credentials.');
        }

        const jti = uuidv4();
        const { accessToken, refreshToken } = generateTokens(existingUser, jti);
        await addRefreshTokenToWhitelist({ jti, refreshToken, userId: existingUser.id });

        return {
            accessToken,
            refreshToken
        };
    } catch (err) {
        console.log(err);

        throw new BadRequestError(err.message);
    }
};


async function findRessourceByCode(code) {
    return await db.ressource.findFirst({
        where: {
            rcode: code,
        },
    });
}

