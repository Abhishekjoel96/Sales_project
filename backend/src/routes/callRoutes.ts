// backend/src/routes/callRoutes.ts
import express from 'express';
import * as callController from '../controllers/callController';

const router = express.Router();

router.post('/makeCall', callController.makeCall);
router.post('/receiveCall', callController.receiveCall);
router.post('/webhook', callController.handleWebhook); // Twilio webhook
router.get('/callLogs', callController.getAllCallLogs);
router.get('/callLogs/:id', callController.getCallLog);
router.put('/callLogs/:id/transcribe', callController.transcribeCallLog)

export default router;