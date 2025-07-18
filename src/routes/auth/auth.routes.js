import router from 'express';
import { preferenceHandler, profileDataHandler, refreshTokenHandler, revokeTokenHandler, signInMemberAuthenticationHandler, signUpMemberAuthenticationHandler } from '../../controllers/auth/auth.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { registerSchema, loginSchema } from '../../validators/auth/auth.validator.js';
import { validateData } from '../../middlewares/validationMiddleware.js';

const authRoutes = router.Router();

const authRoute = () => {

  //authentification
  authRoutes.post(
    '/signup',
    validateData(registerSchema),
    signUpMemberAuthenticationHandler
  );
  authRoutes.post(
    '/onboarding/preferences',
    authentication,
    preferenceHandler
  );
  authRoutes.post(
    '/signin',
    validateData(loginSchema),
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
