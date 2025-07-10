import router from 'express';
import { createVehiculeHandler, deleteVehiculeHandler, getVehiculeHandler, listAllDeletedVehiculesHandler, listAllVehiculesHandler, updateVehiculeHandler } from '../../controllers/cotations/vehicule.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const vehiculeRoutes = router.Router();

const vehiculeRoute = () => {
  vehiculeRoutes.post(
    '/create-new-vehicule',
    createVehiculeHandler
  );
  vehiculeRoutes.put(
    '/update-vehicule/:id',
    authentication,
    updateVehiculeHandler
  );
  vehiculeRoutes.get(
    '/list-all-vehicules',
    authentication,
    listAllVehiculesHandler
  );
  vehiculeRoutes.get(
    '/list-deleted-vehicules',
    authentication,
    listAllDeletedVehiculesHandler
  );
  vehiculeRoutes.get(
    '/get-vehicule/:id',
    authentication,
    getVehiculeHandler
  );
  vehiculeRoutes.get(
    '/delete-vehicule/:id',
    authentication,
    deleteVehiculeHandler
  );

  return vehiculeRoutes;
};

export default vehiculeRoute;
