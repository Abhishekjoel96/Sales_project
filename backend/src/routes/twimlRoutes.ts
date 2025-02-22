// backend/src/routes/twimlRoutes.ts
import express from 'express';
import * as twimlController from '../controllers/twimlController';

const router = express.Router();

router.post('/', twimlController.getTwiml); // Twilio initially makes get request

export default router;
