import pkg from 'pg';
import env from '../config/env.js';
const { Pool } = pkg;
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

export default db;


