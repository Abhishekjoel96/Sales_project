// backend/src/routes/messageRoutes.ts
import express from 'express';
import * as messageController from '../controllers/messageController';

const router = express.Router();

router.post('/send', messageController.send);
router.post('/receive', messageController.receive); // For Twilio and Mailgun webhooks
router.get('/', messageController.getAllMessages);
router.get('/:id', messageController.getMessage);

export default router;