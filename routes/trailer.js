import express from 'express';
import { getTrailer } from '../controllers/trailerController.js';

const router = express.Router();

router.get('/', getTrailer);

export default router;
