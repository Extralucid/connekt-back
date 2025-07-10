import router from 'express';
import { createEnergieHandler, deleteEnergieHandler, getEnergieHandler, listAllDeletedEnergiesHandler, listAllEnergiesHandler, updateEnergieHandler } from '../../controllers/settings/energie.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const energieRoutes = router.Router();

const energieRoute = () => {
  energieRoutes.post(
    '/create-new-energie',
    createEnergieHandler
  );
  energieRoutes.put(
    '/update-energie/:id',
    authentication,
    updateEnergieHandler
  );
  energieRoutes.get(
    '/list-all-energies',
    authentication,
    listAllEnergiesHandler
  );
  energieRoutes.get(
    '/list-deleted-energies',
    authentication,
    listAllDeletedEnergiesHandler
  );
  energieRoutes.get(
    '/get-energie/:id',
    authentication,
    getEnergieHandler
  );
  energieRoutes.get(
    '/delete-energie/:id',
    authentication,
    deleteEnergieHandler
  );

  return energieRoutes;
};

export default energieRoute;
