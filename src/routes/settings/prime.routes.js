import router from 'express';
import { createPrimeHandler, deletePrimeHandler, getPrimeHandler, listAllDeletedPrimesHandler, listAllPrimesHandler, updatePrimeHandler } from '../../controllers/settings/prime.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const primeRoutes = router.Router();

const primeRoute = () => {
  primeRoutes.post(
    '/create-new-prime',
    createPrimeHandler
  );
  primeRoutes.put(
    '/update-prime/:id',
    authentication,
    updatePrimeHandler
  );
  primeRoutes.get(
    '/list-all-primes',
    authentication,
    listAllPrimesHandler
  );
  primeRoutes.get(
    '/list-deleted-primes',
    authentication,
    listAllDeletedPrimesHandler
  );
  primeRoutes.get(
    '/get-prime/:id',
    authentication,
    getPrimeHandler
  );
  primeRoutes.get(
    '/delete-prime/:id',
    authentication,
    deletePrimeHandler
  );

  return primeRoutes;
};

export default primeRoute;
