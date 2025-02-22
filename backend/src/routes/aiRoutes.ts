// backend/src/routes/aiRoutes.ts
import express from 'express';
import * as aiController from '../controllers/aiController';

const router = express.Router();

router.get('/dashboard', aiController.getDashboardData); // For getting aggregated dashboard data
router.post('/assistant', aiController.askAiAssistant);     // For the RAG-powered AI Assistant

export default router;
