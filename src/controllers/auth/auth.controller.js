import appResponse from '../../lib/appResponse.js';
import { getUserProfileData, refreshToken, revokeToken, signInMemberAuthentication, signUpMemberAuthentication } from '../services/auth/auth.services.js';

import { createRessource, deleteRessource, getRessourceById, listDeletedRessources, listRessources, updateRessource } from '../services/auth/ressource.services.js';


export const createRessourceHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createRessource({ body, user });

    res.send(appResponse('Ressource created successfully', response));
};

export const updateRessourceHandler = async (req, res) => {
  const { body, user } = req;
  const idressource = req.params.id;

  const response = await updateRessource({ body, user, idressource });

  res.send(appResponse('Ressource updated successfully', response));
};
export const listAllRessourcesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listRessources(Number(page), Number(limit), search, order);

  res.send(appResponse('Ressources listed successfully', response));
};
export const listAllDeletedRessourcesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedRessources(Number(page), Number(limit), search, order);

  res.send(appResponse('Ressources listed successfully', response));
};
export const getRessourceHandler = async (req, res) => {
  const idressource = req.params.id;

  const response = await getRessourceById(idressource);

  res.send(appResponse('Ressources fetched successfully', response));
};
export const deleteRessourceHandler = async (req, res) => {
  const idressource = req.params.id;

  const response = await deleteRessource({idressource});

  res.send(appResponse('Ressources deleted successfully', response));
};


//authentification des utilisateurs
export const signUpMemberAuthenticationHandler = async (req, res) => {
  const { body, user } = req;

  const response = await signUpMemberAuthentication({ body, user });

  res.send(appResponse('User created successfully', response));
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