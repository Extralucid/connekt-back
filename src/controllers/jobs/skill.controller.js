import appResponse from '../../../lib/appResponse.js';

import { createSkill, deleteSkill, getSkillById, listDeletedSkills, listSkills, updateSkill } from '../../services/jobs/skill.services.js';


export const createSkillHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createSkill({ body, user });

    res.send(appResponse('Skill created successfully', response));
};

export const updateSkillHandler = async (req, res) => {
  const { body, user } = req;
  const idskill = req.params.id;

  const response = await updateSkill({ body, user, idskill });

  res.send(appResponse('Skill updated successfully', response));
};
export const listAllSkillsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listSkills(Number(page), Number(limit), search, order);

  res.send(appResponse('Skills listed successfully', response));
};
export const listAllDeletedSkillsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedSkills(Number(page), Number(limit), search, order);

  res.send(appResponse('Skills listed successfully', response));
};
export const getSkillHandler = async (req, res) => {
  const idskill = req.params.id;

  const response = await getSkillById({idskill});

  res.send(appResponse('Skills fetched successfully', response));
};
export const deleteSkillHandler = async (req, res) => {
  const idskill = req.params.id;

  const response = await deleteSkill({idskill});

  res.send(appResponse('Skills deleted successfully', response));
};