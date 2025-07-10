import router from 'express';
import { createTdocumentHandler, deleteTdocumentHandler, getTdocumentHandler, listAllDeletedTdocumentsHandler, listAllTdocumentsHandler, updateTdocumentHandler } from '../../controllers/settings/tdocument.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const tdocumentRoutes = router.Router();

const tdocumentRoute = () => {
  tdocumentRoutes.post(
    '/create-new-tdocument',
    createTdocumentHandler
  );
  tdocumentRoutes.put(
    '/update-tdocument/:id',
    authentication,
    updateTdocumentHandler
  );
  tdocumentRoutes.get(
    '/list-all-tdocuments',
    authentication,
    listAllTdocumentsHandler
  );
  tdocumentRoutes.get(
    '/list-deleted-tdocuments',
    authentication,
    listAllDeletedTdocumentsHandler
  );
  tdocumentRoutes.get(
    '/get-tdocument/:id',
    authentication,
    getTdocumentHandler
  );
  tdocumentRoutes.get(
    '/delete-tdocument/:id',
    authentication,
    deleteTdocumentHandler
  );

  return tdocumentRoutes;
};

export default tdocumentRoute;
