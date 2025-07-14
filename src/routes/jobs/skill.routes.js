import router from 'express';
import { createSkillHandler, deleteSkillHandler, getSkillHandler, listAllDeletedSkillsHandler, listAllSkillsHandler, updateSkillHandler } from '../../controllers/jobs/skill.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { cache } from '../../middlewares/cacheMiddleware.js';

const skillRoutes = router.Router();

const skillRoute = () => {
  skillRoutes.post(
    '/create-new-skill',
    authentication,
    createSkillHandler
  );
  skillRoutes.put(
    '/update-skill/:id',
    authentication,
    updateSkillHandler
  );
  skillRoutes.get(
    '/list-all-skills',
    authentication,
    cache(60),
    listAllSkillsHandler
  );
  skillRoutes.get(
    '/list-deleted-skills',
    authentication,
    cache(60),
    listAllDeletedSkillsHandler
  );
  skillRoutes.get(
    '/get-skill/:id',
    authentication,
    getSkillHandler
  );
  skillRoutes.get(
    '/delete-skill/:id',
    authentication,
    deleteSkillHandler
  );

  return skillRoutes;
};

export default skillRoute;
