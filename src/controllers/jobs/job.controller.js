import appResponse from '../../../lib/appResponse.js';

import { createJob, createJobAlert, deleteJob, getJobById, listDeletedJobs, listJobs, listRecommendedJobs, trackJobView, updateJob } from '../../services/jobs/job.services.js';


export const createJobHandler = async (req, res) => {
    const { body, user } = req;

    const response = await createJob({ body, user });

    res.send(appResponse('Job created successfully', response));
};

export const createJobAlertHandler = async (req, res) => {
    const { keywords, frequency,  } = req.body;
    const user  = req.user;

    const response = await createJobAlert({ keywords, frequency, user });

    res.send(appResponse('Job alert created successfully', response));
};

export const createJobTrackHandler = async (req, res) => {
    const userId  = req.user.id;
    const jobId  = req.user.id;
    const ipAddress  = req.ip;

    const response = await trackJobView({ jobId, userId, ipAddress });

    res.send(appResponse('Job track created successfully', response));
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
export const listRecommendedJobsHandler = async (req, res) => {
  const { page = 1, limit = 10, search = "", order = [] } = req.query;
  const  user  = req.user;

  const response = await listRecommendedJobs(Number(page), Number(limit), search, order, user);

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