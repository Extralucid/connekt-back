import router from 'express';
import { createFranchiseHandler, deleteFranchiseHandler, getFranchiseHandler, listAllDeletedFranchisesHandler, listAllFranchisesHandler, updateFranchiseHandler } from '../../controllers/settings/franchise.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const franchiseRoutes = router.Router();

const franchiseRoute = () => {
  franchiseRoutes.post(
    '/create-new-franchise',
    createFranchiseHandler
  );
  franchiseRoutes.put(
    '/update-franchise/:id',
    authentication,
    updateFranchiseHandler
  );
  franchiseRoutes.get(
    '/list-all-franchises',
    authentication,
    listAllFranchisesHandler
  );
  franchiseRoutes.get(
    '/list-deleted-franchises',
    authentication,
    listAllDeletedFranchisesHandler
  );
  franchiseRoutes.get(
    '/get-franchise/:id',
    authentication,
    getFranchiseHandler
  );
  franchiseRoutes.get(
    '/delete-franchise/:id',
    authentication,
    deleteFranchiseHandler
  );

  return franchiseRoutes;
};

export default franchiseRoute;
