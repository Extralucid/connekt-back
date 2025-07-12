import router from 'express';
//import { createRessourceHandler, deleteRessourceHandler, getRessourceHandler, listAllDeletedRessourcesHandler, listAllRessourcesHandler, profileDataHandler, refreshTokenHandler, revokeTokenHandler, signInMemberAuthenticationHandler, signUpMemberAuthenticationHandler, updateRessourceHandler } from '../controllers/auth.controller.js';
import { authentication } from '../middlewares/authentication.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';

const authRoutes = router.Router();

const authRoute = () => {

  //authentification
  authRoutes.post(
    '/signup',
    registerSchema,
    signUpMemberAuthenticationHandler
  );
  authRoutes.post(
    '/signin',
    loginSchema,
    signInMemberAuthenticationHandler
  );
  authRoutes.get(
    '/profile-data',
    authentication,
    profileDataHandler
  );

  authRoutes.post(
    '/revoke-token',
    authentication,
    revokeTokenHandler
  );
  authRoutes.post(
    '/refresh-token',
    authentication,
    refreshTokenHandler
  );
  return authRoutes;
};

export default authRoute;
