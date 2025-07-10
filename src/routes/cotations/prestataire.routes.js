import router from 'express';
import { createPrestataireHandler, deletePrestataireHandler, getPrestataireHandler, listAllDeletedPrestatairesHandler, listAllPrestatairesHandler, updatePrestataireHandler } from '../../controllers/cotations/prestataire.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const prestataireRoutes = router.Router();

const prestataireRoute = () => {
  prestataireRoutes.post(
    '/create-new-prestataire',
    createPrestataireHandler
  );
  prestataireRoutes.put(
    '/update-prestataire/:id',
    authentication,
    updatePrestataireHandler
  );
  prestataireRoutes.get(
    '/list-all-prestataires',
    authentication,
    listAllPrestatairesHandler
  );
  prestataireRoutes.get(
    '/list-deleted-prestataires',
    authentication,
    listAllDeletedPrestatairesHandler
  );
  prestataireRoutes.get(
    '/get-prestataire/:id',
    authentication,
    getPrestataireHandler
  );
  prestataireRoutes.get(
    '/delete-prestataire/:id',
    authentication,
    deletePrestataireHandler
  );

  return prestataireRoutes;
};

export default prestataireRoute;
