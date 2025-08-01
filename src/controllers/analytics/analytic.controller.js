import appResponse from '../../../lib/appResponse.js';

import {  getDashboardData } from '../../services/analytics/analytic.services.js';


export const getDashboardDataHandler = async (req, res) => {

  const response = await getDashboardData();

  res.send(appResponse('data fetched successfully', response));
};