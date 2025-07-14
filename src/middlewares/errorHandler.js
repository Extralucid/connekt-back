import appResponse from '../../lib/appResponse.js';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const prismaValidationError = Prisma.PrismaClientKnownRequestError
const isProduction = process.env.NODE_ENV === 'production';

const errorNames = [
  'CastError',
  'JsonWebTokenError',
  'TokenExpiredError',
  'ValidationError',
  'SyntaxError',
  'PrismaError'
];

export const ErrorHandler = function (error, req, res, next) {
  if (error.name === 'APIERRORS' || error.isOperational) {
    return res.status(error.statusCode).send(appResponse(error.message, null, false));
  }

  if (err instanceof z.ZodError) {
    return res.status(400).json({ errors: err.errors });
  }

  if (error instanceof prismaValidationError) {
    const errorMessages = Object.values(error.errors).map((e) => e.message);
    console.error({ errorMessages });
    return res
      .status(400)
      .send(
        appResponse(
          'validation error occurred check your inputs for corrections',
          null,
          errorMessages
        )
      );
  }

  if (error.hasOwnProperty('name') && error.code === 'P2002') {
    const data = error && error.errmsg ? error.errmsg : null;
    console.error({ data });
    return res.status(400).send(appResponse('the entry already exist', data, false));
  }

  if (errorNames.includes(error.name)) {
    if (error.name === 'TokenExpiredError') {
      return res
        .status(400)
        .send(appResponse('Token has expired, Request a reset password again', null, false));
    }
    return res.status(400).send(appResponse(error.message, null, false));
  }

  // log error
  console.error(error);

  const message = isProduction
    ? 'An unexpected error has occured. Please, contact the administrator'
    : error.message;

  return res.status(500).send(appResponse(message, null, false));
};
