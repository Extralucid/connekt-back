import router from 'express';
import { createAssureHandler, deleteAssureHandler, getAssureHandler, listAllDeletedAssuresHandler, listAllAssuresHandler, updateAssureHandler } from '../../controllers/cotations/assure.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const assureRoutes = router.Router();

const assureRoute = () => {
  assureRoutes.post(
    '/create-new-assure',
    createAssureHandler
  );
  assureRoutes.put(
    '/update-assure/:id',
    authentication,
    updateAssureHandler
  );
  assureRoutes.get(
    '/list-all-assures',
    authentication,
    listAllAssuresHandler
  );
  assureRoutes.get(
    '/list-deleted-assures',
    authentication,
    listAllDeletedAssuresHandler
  );
  assureRoutes.get(
    '/get-assure/:id',
    authentication,
    getAssureHandler
  );
  assureRoutes.get(
    '/delete-assure/:id',
    authentication,
    deleteAssureHandler
  );

  return assureRoutes;
};

export default assureRoute;
