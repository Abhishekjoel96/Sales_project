// backend/src/routes/callRoutes.ts
import express from 'express';
import * as callController from '../controllers/callController';

const router = express.Router();

router.post('/makeCall', callController.makeCall);
router.post('/receiveCall', callController.receiveCall);
router.post('/webhook', callController.handleWebhook); // Twilio webhook for call status updates
router.get('/callLogs', callController.getAllCallLogs); // Corrected route name
router.get('/callLogs/:id', callController.getCallLog); // Corrected route name and parameter
router.put('/callLogs/:id/transcribe', callController.transcribeCallLog); // For triggering transcription

export default router;
