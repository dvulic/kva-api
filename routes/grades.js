import express from 'express';
import { getGrades } from '../controllers/gradesController.js';

const router = express.Router();

router.get('/', getGrades);

export default router;
