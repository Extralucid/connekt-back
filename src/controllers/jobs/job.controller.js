import appResponse from '../../../lib/appResponse.js';

import { createJob, deleteJob, getJobById, listDeletedJobs, listJobs, updateJob } from '../../services/jobs/job.services.js';


export const createJobHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createJob({ body, user });

    res.send(appResponse('Job created successfully', response));
};

export const updateJobHandler = async (req, res) => {
  const { body, user } = req;
  const idjob = req.params.id;

  const response = await updateJob({ body, user, idjob });

  res.send(appResponse('Job updated successfully', response));
};
export const listAllJobsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listJobs(Number(page), Number(limit), search, order);

  res.send(appResponse('Jobs listed successfully', response));
};
export const listAllDeletedJobsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;

  const response = await listDeletedJobs(Number(page), Number(limit), search, order);

  res.send(appResponse('Jobs listed successfully', response));
};
export const getJobHandler = async (req, res) => {
  const idjob = req.params.id;

  const response = await getJobById({idjob});

  res.send(appResponse('Jobs fetched successfully', response));
};
export const deleteJobHandler = async (req, res) => {
  const idjob = req.params.id;

  const response = await deleteJob({idjob});

  res.send(appResponse('Jobs deleted successfully', response));
};