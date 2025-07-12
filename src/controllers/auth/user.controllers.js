import appResponse from '../../lib/appResponse.js';
import env from '../config/env.js';

import { createUser, deleteUser, getUserById, listDeletedUsers, listUsers, updateUser } from '../services/auth/user.services.js';


export const createUserHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createUser({ body, user });

    res.send(appResponse('User created successfully', response));
};

export const updateUserHandler = async (req, res) => {
  const { body, user } = req;
  const id = req.params.id;

  const response = await updateUser({ body, user, id });

  res.send(appResponse('User updated successfully', response));
};
export const listAllUsersHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listUsers(Number(page), Number(limit), search, order);

  res.send(appResponse('Users listed successfully', response));
};
export const listAllDeletedUsersHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedUsers(Number(page), Number(limit), search, order);

  res.send(appResponse('Users listed successfully', response));
};
export const getUserHandler = async (req, res) => {
  const id = req.params.id;

  const response = await getUserById(id);

  res.send(appResponse('Users fetched successfully', response));
};
export const deleteUserHandler = async (req, res) => {
  const id = req.params.id;

  const response = await deleteUser({id});

  res.send(appResponse('Users deleted successfully', response));
};
