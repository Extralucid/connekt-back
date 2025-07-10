import appResponse from '../../../lib/appResponse.js';

import { createPrime, deletePrime, getPrimeById, listDeletedPrimes, listPrimes, updatePrime } from '../../services/settings/prime.services.js';

export const createPrimeHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createPrime({ body, user });

    res.send(appResponse('Prime created successfully', response));
};

export const updatePrimeHandler = async (req, res) => {
  const { body, user } = req;
  const idprime = req.params.id;

  const response = await updatePrime({ body, user, idprime });

  res.send(appResponse('Prime updated successfully', response));
};
export const listAllPrimesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listPrimes(Number(page), Number(limit), search, order);

  res.send(appResponse('Primes listed successfully', response));
};
export const listAllDeletedPrimesHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedPrimes(Number(page), Number(limit), search, order);

  res.send(appResponse('Primes listed successfully', response));
};
export const getPrimeHandler = async (req, res) => {
  const idprime = req.params.id;

  const response = await getPrimeById(idprime);

  res.send(appResponse('Primes fetched successfully', response));
};
export const deletePrimeHandler = async (req, res) => {
  const idprime = req.params.id;

  const response = await deletePrime({idprime});

  res.send(appResponse('Primes deleted successfully', response));
};
