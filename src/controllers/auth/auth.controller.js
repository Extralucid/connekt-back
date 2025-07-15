import appResponse from '../../../lib/appResponse.js';
import { getUserProfileData, refreshToken, revokeToken, savePreferences, signInMemberAuthentication, signUpMemberAuthentication } from '../../services/auth/auth.services.js';

//import { createRessource, deleteRessource, getRessourceById, listDeletedRessources, listRessources, updateRessource } from '../../services/auth/ressource.services.js';


//authentification des utilisateurs
export const signUpMemberAuthenticationHandler = async (req, res) => {
  const { body, user } = req;

  const response = await signUpMemberAuthentication({ body, user });

  res.send(appResponse('User created successfully', response));
};

//preference des utilisateurs
export const preferenceHandler = async (req, res) => {
  const { body, user } = req;

  const response = await savePreferences({ body, user });

  res.send(appResponse('User preferences saved successfully', response));
};

export const signInMemberAuthenticationHandler = async (req, res) => {
  const { body, user } = req;

  const response = await signInMemberAuthentication({ body, user });

  res.send(appResponse('User logged In successfully', response));
};

export const refreshTokenHandler = async (req, res) => {
  const { body, user } = req;

  const response = await refreshToken({ body, user });

  res.send(appResponse('Token refreshed In successfully', response));
};
export const revokeTokenHandler = async (req, res) => {
  const { body, user } = req;

  const response = await revokeToken({ body, user });

  res.send(appResponse('Token revoked In successfully', response));
};
export const profileDataHandler = async (req, res) => {
  const userId = req.user.id;

  const response = await getUserProfileData(userId);

  res.send(appResponse('profile data fetched In successfully', response));
};