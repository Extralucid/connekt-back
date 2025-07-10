import router from 'express';
import { createModeleHandler, deleteModeleHandler, getCreateModeleDataHandler, getModeleHandler, getUpdateModeleDataHandler, listAllDeletedModelesHandler, listAllModelesHandler, updateModeleHandler } from '../../controllers/settings/modele.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const modeleRoutes = router.Router();

const modeleRoute = () => {
  modeleRoutes.post(
    '/create-new-modele',
    authentication,
    createModeleHandler
  );
  modeleRoutes.put(
    '/update-modele/:id',
    authentication,
    updateModeleHandler
  );
  modeleRoutes.get(
    '/list-all-modeles',
    authentication,
    listAllModelesHandler
  );
  modeleRoutes.get(
    '/get-create-modele-data',
    authentication,
    getCreateModeleDataHandler
  );
  modeleRoutes.get(
    '/get-update-modele-data/:id',
    authentication,
    getUpdateModeleDataHandler
  );
  modeleRoutes.get(
    '/list-deleted-modeles',
    authentication,
    listAllDeletedModelesHandler
  );
  modeleRoutes.get(
    '/get-modele/:id',
    authentication,
    getModeleHandler
  );
  modeleRoutes.get(
    '/delete-modele/:id',
    authentication,
    deleteModeleHandler
  );

  return modeleRoutes;
};

export default modeleRoute;
