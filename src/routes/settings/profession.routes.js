import router from 'express';
import { createProfessionHandler, deleteProfessionHandler, getProfessionHandler, listAllDeletedProfessionsHandler, listAllProfessionsHandler, updateProfessionHandler } from '../../controllers/settings/profession.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const professionRoutes = router.Router();

const professionRoute = () => {
  professionRoutes.post(
    '/create-new-profession',
    createProfessionHandler
  );
  professionRoutes.put(
    '/update-profession/:id',
    authentication,
    updateProfessionHandler
  );
  professionRoutes.get(
    '/list-all-professions',
    authentication,
    listAllProfessionsHandler
  );
  professionRoutes.get(
    '/list-deleted-professions',
    authentication,
    listAllDeletedProfessionsHandler
  );
  professionRoutes.get(
    '/get-profession/:id',
    authentication,
    getProfessionHandler
  );
  professionRoutes.get(
    '/delete-profession/:id',
    authentication,
    deleteProfessionHandler
  );

  return professionRoutes;
};

export default professionRoute;
