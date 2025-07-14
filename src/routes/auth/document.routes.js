import router from 'express';
import { createDocumentHandler, deleteDocumentHandler, getDocumentHandler, listAllDeletedDocumentsHandler, listAllDocumentsHandler, updateDocumentHandler } from '../../controllers/auth/document.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { upload } from '../../middlewares/uploadHandler.js';

const documentRoutes = router.Router();

const documentRoute = () => {
  documentRoutes.post(
    '/create-new-document',
    authentication,
    upload.single('fichier'),
    createDocumentHandler
  );
  documentRoutes.put(
    '/update-document/:id',
    authentication,
    upload.single('fichier'),
    updateDocumentHandler
  );
  documentRoutes.get(
    '/list-all-documents',
    authentication,
    listAllDocumentsHandler
  );
  documentRoutes.get(
    '/list-deleted-documents',
    authentication,
    listAllDeletedDocumentsHandler
  );
  documentRoutes.get(
    '/get-document/:id',
    authentication,
    getDocumentHandler
  );
  documentRoutes.get(
    '/delete-document/:id',
    authentication,
    deleteDocumentHandler
  );

  return documentRoutes;
};

export default documentRoute;
