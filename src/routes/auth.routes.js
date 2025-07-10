import router from 'express';
import { createRessourceHandler, deleteRessourceHandler, getRessourceHandler, listAllDeletedRessourcesHandler, listAllRessourcesHandler, profileDataHandler, refreshTokenHandler, revokeTokenHandler, signInMemberAuthenticationHandler, signUpMemberAuthenticationHandler, updateRessourceHandler } from '../controllers/auth.controller.js';
import { authentication } from '../middlewares/authentication.js';

const authRoutes = router.Router();

const authRoute = () => {
  authRoutes.post(
    '/create-new-ressource',
    createRessourceHandler
  );
  authRoutes.put(
    '/update-ressource/:id',
    authentication,
    updateRessourceHandler
  );
  authRoutes.get(
    '/list-all-ressources',
    authentication,
    listAllRessourcesHandler
  );
  authRoutes.get(
    '/list-deleted-ressources',
    authentication,
    listAllDeletedRessourcesHandler
  );
  authRoutes.get(
    '/get-ressource/:id',
    authentication,
    getRessourceHandler
  );
  authRoutes.get(
    '/delete-ressource/:id',
    authentication,
    deleteRessourceHandler
  );

  //authentification
  authRoutes.post(
    '/signup',
    signUpMemberAuthenticationHandler
  );
  authRoutes.post(
    '/signin',
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
